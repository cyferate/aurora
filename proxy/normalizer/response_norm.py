"""
AURORA Response Normalizer
Translates OpenAI SSE stream → Anthropic SSE stream format
Handles tool calls, text deltas, and stream lifecycle events
"""
import json
import re
import time
import uuid
from typing import AsyncGenerator, Any


async def stream_normalize_response(
    provider_client: Any,
    openai_body: dict,
    provider_name: str,
) -> AsyncGenerator[bytes, None]:
    """
    Streams Anthropic-format SSE events from an OpenAI-compatible provider.
    Claude Code expects this exact SSE format.
    """
    message_id = f"msg_{uuid.uuid4().hex[:20]}"
    model = openai_body.get("model", "unknown")

    # ── message_start ──────────────────────────────────────────────────────────
    yield _sse_event("message_start", {
        "type": "message_start",
        "message": {
            "id": message_id,
            "type": "message",
            "role": "assistant",
            "content": [],
            "model": f"aurora/{provider_name}/{model}",
            "stop_reason": None,
            "stop_sequence": None,
            "usage": {"input_tokens": 0, "output_tokens": 0}
        }
    })

    # ── content_block_start (text) ────────────────────────────────────────────
    yield _sse_event("content_block_start", {
        "type": "content_block_start",
        "index": 0,
        "content_block": {"type": "text", "text": ""}
    })
    yield _sse_event("ping", {"type": "ping"})

    input_tokens = 0
    output_tokens = 0
    tool_call_buffers: dict[int, dict] = {}
    tool_block_index = 1  # text block is 0
    current_tool_index: int | None = None

    try:
        async for chunk in provider_client.stream(openai_body):
            if not chunk:
                continue

            choices = chunk.get("choices", [])
            if not choices:
                # Usage chunk
                usage = chunk.get("usage", {})
                input_tokens = usage.get("prompt_tokens", input_tokens)
                output_tokens = usage.get("completion_tokens", output_tokens)
                continue

            delta = choices[0].get("delta", {})
            finish_reason = choices[0].get("finish_reason")

            # Text delta
            text_delta = delta.get("content", "")
            if text_delta:
                # Strip <think> tags from streamed content
                text_delta = re.sub(r'<think>', '', text_delta)
                text_delta = re.sub(r'</think>', '', text_delta)
                yield _sse_event("content_block_delta", {
                    "type": "content_block_delta",
                    "index": 0,
                    "delta": {"type": "text_delta", "text": text_delta}
                })
                output_tokens += len(text_delta.split())

            # Tool call delta
            tool_calls = delta.get("tool_calls", [])
            for tc in tool_calls:
                idx = tc.get("index", 0)
                if idx not in tool_call_buffers:
                    # New tool call starting
                    tool_id = tc.get("id", f"toolu_{uuid.uuid4().hex[:20]}")
                    fn = tc.get("function", {})
                    name = fn.get("name", "")
                    tool_call_buffers[idx] = {
                        "id": tool_id,
                        "name": name,
                        "args_buffer": "",
                        "block_index": tool_block_index
                    }
                    tool_block_index += 1

                    # Close text block first if open
                    if current_tool_index is None:
                        yield _sse_event("content_block_stop", {
                            "type": "content_block_stop", "index": 0
                        })

                    # Start tool use block
                    yield _sse_event("content_block_start", {
                        "type": "content_block_start",
                        "index": tool_call_buffers[idx]["block_index"],
                        "content_block": {
                            "type": "tool_use",
                            "id": tool_id,
                            "name": name,
                            "input": {}
                        }
                    })
                    current_tool_index = idx

                args_delta = tc.get("function", {}).get("arguments", "")
                if args_delta:
                    tool_call_buffers[idx]["args_buffer"] += args_delta
                    yield _sse_event("content_block_delta", {
                        "type": "content_block_delta",
                        "index": tool_call_buffers[idx]["block_index"],
                        "delta": {"type": "input_json_delta", "partial_json": args_delta}
                    })

            if finish_reason:
                break

    except Exception as e:
        # Stream error — emit error as text
        err_msg = f"\n[AURORA ERROR: {provider_name} stream failed: {str(e)}]"
        yield _sse_event("content_block_delta", {
            "type": "content_block_delta",
            "index": 0,
            "delta": {"type": "text_delta", "text": err_msg}
        })

    # ── Close open blocks ──────────────────────────────────────────────────────
    if current_tool_index is not None:
        for buf in tool_call_buffers.values():
            yield _sse_event("content_block_stop", {
                "type": "content_block_stop",
                "index": buf["block_index"]
            })
    else:
        yield _sse_event("content_block_stop", {
            "type": "content_block_stop", "index": 0
        })

    # ── message_delta (stop_reason) ───────────────────────────────────────────
    stop_reason = "tool_use" if tool_call_buffers else "end_turn"
    yield _sse_event("message_delta", {
        "type": "message_delta",
        "delta": {"stop_reason": stop_reason, "stop_sequence": None},
        "usage": {"output_tokens": output_tokens}
    })

    # ── message_stop ───────────────────────────────────────────────────────────
    yield _sse_event("message_stop", {"type": "message_stop"})


def _sse_event(event_type: str, data: dict) -> bytes:
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n".encode("utf-8")

