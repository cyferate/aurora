"""
AURORA Request Normalizer
Translates Anthropic Messages API format → OpenAI Chat Completions format
"""
import re
from typing import Any


def normalize_request(anthropic_body: dict) -> dict:
    """
    Converts Anthropic /v1/messages payload to OpenAI /v1/chat/completions format.
    Handles: system prompt, tool definitions, tool use/results, thinking blocks.
    """
    messages = []

    # ── System prompt ──────────────────────────────────────────────────────────
    system = anthropic_body.get("system")
    if system:
        if isinstance(system, str):
            messages.append({"role": "system", "content": system})
        elif isinstance(system, list):
            # Anthropic allows system as array of content blocks
            text_parts = [
                b.get("text", "") for b in system
                if isinstance(b, dict) and b.get("type") == "text"
            ]
            messages.append({"role": "system", "content": "\n".join(text_parts)})

    # ── Messages ───────────────────────────────────────────────────────────────
    for msg in anthropic_body.get("messages", []):
        role = msg.get("role", "user")
        content = msg.get("content", "")

        # Simple string content
        if isinstance(content, str):
            messages.append({"role": role, "content": content})
            continue

        # Content block array
        if isinstance(content, list):
            converted = _convert_content_blocks(role, content)
            messages.extend(converted)

    # ── Tool definitions ───────────────────────────────────────────────────────
    tools = None
    if "tools" in anthropic_body:
        tools = []
        for tool in anthropic_body["tools"]:
            tools.append({
                "type": "function",
                "function": {
                    "name": tool.get("name"),
                    "description": tool.get("description", ""),
                    "parameters": tool.get("input_schema", {"type": "object", "properties": {}})
                }
            })

    # ── Build OpenAI body ──────────────────────────────────────────────────────
    openai_body: dict[str, Any] = {
        "model": anthropic_body.get("model", "deepseek/deepseek-r1:free"),
        "messages": messages,
        "stream": anthropic_body.get("stream", False),
        "max_tokens": anthropic_body.get("max_tokens", 8192),
    }

    if tools:
        openai_body["tools"] = tools

    if "temperature" in anthropic_body:
        openai_body["temperature"] = anthropic_body["temperature"]

    if "top_p" in anthropic_body:
        openai_body["top_p"] = anthropic_body["top_p"]

    return openai_body


def _convert_content_blocks(role: str, blocks: list) -> list[dict]:
    """Converts a list of Anthropic content blocks into OpenAI messages."""
    result = []
    text_parts = []
    tool_calls = []
    tool_results = []

    for block in blocks:
        if not isinstance(block, dict):
            continue
        btype = block.get("type")

        if btype == "text":
            text = block.get("text", "")
            # Strip <think> tags and convert to hidden system note
            text = _strip_think_tags(text)
            text_parts.append(text)

        elif btype == "thinking":
            # Claude's native thinking block → prepend as hidden note
            thinking_text = block.get("thinking", "")
            text_parts.append(f"[REASONING]: {thinking_text}")

        elif btype == "tool_use":
            # Claude assistant using a tool
            tool_calls.append({
                "id": block.get("id", f"call_{block.get('name')}"),
                "type": "function",
                "function": {
                    "name": block.get("name"),
                    "arguments": _safe_json_dumps(block.get("input", {}))
                }
            })

        elif btype == "tool_result":
            # Claude user returning tool result
            tool_id = block.get("tool_use_id", "")
            tool_content = block.get("content", "")
            if isinstance(tool_content, list):
                tool_content = "\n".join(
                    b.get("text", "") for b in tool_content
                    if isinstance(b, dict) and b.get("type") == "text"
                )
            tool_results.append({
                "role": "tool",
                "tool_call_id": tool_id,
                "content": str(tool_content)
            })

        elif btype == "image":
            # Base64 image — pass through as OpenAI vision format
            source = block.get("source", {})
            if source.get("type") == "base64":
                text_parts.append(
                    f"[Image: {source.get('media_type', 'image')} base64 data]"
                )

    # Compose messages
    if text_parts or tool_calls:
        msg: dict[str, Any] = {"role": role, "content": "\n".join(text_parts) or ""}
        if tool_calls:
            msg["tool_calls"] = tool_calls
        result.append(msg)

    result.extend(tool_results)

    return result


def _strip_think_tags(text: str) -> str:
    """Removes <think>...</think> tags (DeepSeek R1 style)."""
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()


def _safe_json_dumps(obj: Any) -> str:
    import json
    try:
        return json.dumps(obj)
    except Exception:
        return str(obj)

