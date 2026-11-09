"""
AURORA RTK Token Saver — compresses Claude Code tool outputs
Saves 20-40% of tokens per request by stripping redundant content
"""
import os
import re
from typing import Any

MAX_TOOL_LINES  = int(os.getenv("TOKEN_SAVER_MAX_TOOL_LINES", "200"))
MAX_DIFF_LINES  = int(os.getenv("TOKEN_SAVER_MAX_DIFF_LINES", "200"))
MAX_TRACEBACK   = 25  # lines of stack traces to keep


class TokenSaver:
    """
    Compresses tool_result content blocks in Claude Messages API payloads.
    Returns (compressed_body, estimated_tokens_saved).
    """

    def compress(self, body: dict) -> tuple[dict, int]:
        messages = body.get("messages", [])
        total_saved = 0

        compressed_messages = []
        seen_tool_outputs: dict[str, str] = {}  # tool_use_id → content hash

        for msg in messages:
            if msg.get("role") == "user":
                content = msg.get("content", [])
                if isinstance(content, list):
                    new_content = []
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "tool_result":
                            compressed, saved = self._compress_tool_result(
                                block, seen_tool_outputs
                            )
                            total_saved += saved
                            new_content.append(compressed)
                        else:
                            new_content.append(block)
                    compressed_messages.append({**msg, "content": new_content})
                else:
                    compressed_messages.append(msg)
            else:
                compressed_messages.append(msg)

        body = {**body, "messages": compressed_messages}
        return body, total_saved

    def _compress_tool_result(
        self, block: dict, seen: dict
    ) -> tuple[dict, int]:
        content = block.get("content", "")
        if not isinstance(content, str):
            # Could be a list of content blocks
            if isinstance(content, list):
                compressed_list = []
                total = 0
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        c, s = self._compress_text(item["text"])
                        compressed_list.append({**item, "text": c})
                        total += s
                    else:
                        compressed_list.append(item)
                return {**block, "content": compressed_list}, total
            return block, 0

        compressed, saved = self._compress_text(content)
        return {**block, "content": compressed}, saved

    def _compress_text(self, text: str) -> tuple[str, int]:
        original_len = len(text)

        # 1. Compress git diff output
        text = self._compress_diff(text)

        # 2. Compress stack traces
        text = self._compress_traceback(text)

        # 3. Compress repetitive file listings
        text = self._compress_file_listing(text)

        # 4. Deduplicate repeated lines
        text = self._dedup_lines(text)

        # 5. Compress long node_modules or .git paths
        text = re.sub(r'node_modules/[^\s]+', 'node_modules/…', text)
        text = re.sub(r'\.git/objects/[0-9a-f]+', '.git/objects/…', text)

        saved = max(0, (original_len - len(text)) // 4)  # rough token estimate
        return text, saved

    def _compress_diff(self, text: str) -> str:
        if "diff --git" not in text and "@@" not in text:
            return text
        lines = text.splitlines()
        if len(lines) <= MAX_DIFF_LINES:
            return text
        half = MAX_DIFF_LINES // 2
        kept = lines[:half] + [
            f"\n… [{len(lines) - MAX_DIFF_LINES} diff lines compressed by AURORA Token Saver] …\n"
        ] + lines[-half:]
        return "\n".join(kept)

    def _compress_traceback(self, text: str) -> str:
        if "Traceback (most recent call last)" not in text and "Error:" not in text:
            return text
        lines = text.splitlines()
        if len(lines) <= MAX_TRACEBACK:
            return text
        return "\n".join(lines[:MAX_TRACEBACK]) + f"\n… [traceback truncated by AURORA] …"

    def _compress_file_listing(self, text: str) -> str:
        lines = text.splitlines()
        if len(lines) <= MAX_TOOL_LINES:
            return text
        half = MAX_TOOL_LINES // 2
        kept = lines[:half] + [
            f"… [{len(lines) - MAX_TOOL_LINES} lines compressed by AURORA Token Saver] …"
        ] + lines[-half:]
        return "\n".join(kept)

    def _dedup_lines(self, text: str) -> str:
        lines = text.splitlines()
        seen = set()
        result = []
        dup_count = 0
        for line in lines:
            stripped = line.strip()
            if stripped and stripped in seen and len(stripped) > 20:
                dup_count += 1
                continue
            if stripped:
                seen.add(stripped)
            result.append(line)
        if dup_count:
            result.append(f"… [{dup_count} duplicate lines removed by AURORA] …")
        return "\n".join(result)

