"""
AURORA Mixture of Agents (MoA) Orchestrator
Generator → Critic → Optimizer → Synthesizer
All using free-tier models
"""
import os
import httpx
import json


MOA_ENABLED = os.getenv("MOA_ENABLED", "false").lower() == "true"


class MoAChain:
    """
    Implements the 4-stage MoA debate chain.
    Each stage routes to a different free provider, then synthesizes.
    """

    def __init__(self):
        self.generator_provider = os.getenv("MOA_GENERATOR", "openrouter")
        self.critic_provider    = os.getenv("MOA_CRITIC",    "groq")
        self.optimizer_provider = os.getenv("MOA_OPTIMIZER", "gemini")
        self.synthesizer_provider = os.getenv("MOA_SYNTHESIZER", "ollama")

    async def run(self, messages: list[dict], system: str = "") -> str:
        """
        Runs the full MoA chain and returns a synthesized response.
        """
        user_goal = self._extract_last_user_message(messages)

        # Stage 1: Generator
        draft = await self._call_stage(
            provider=self.generator_provider,
            system="You are an expert software engineer. Write a first-pass implementation.",
            messages=messages,
        )

        # Stage 2: Critic
        critique = await self._call_stage(
            provider=self.critic_provider,
            system=(
                "You are a senior architect and security expert. "
                "Find every security flaw, logical gap, edge case, and bottleneck in this code. "
                "Be thorough and specific."
            ),
            messages=[
                *messages,
                {"role": "assistant", "content": draft},
                {"role": "user", "content": "Please critique this implementation thoroughly."},
            ],
        )

        # Stage 3: Optimizer
        optimized = await self._call_stage(
            provider=self.optimizer_provider,
            system=(
                "You are an optimization expert. Rewrite the code to fix all the critique points, "
                "while optimizing for speed, clarity, and correctness."
            ),
            messages=[
                *messages,
                {"role": "assistant", "content": draft},
                {"role": "user", "content": f"The critique is:\n{critique}\n\nPlease rewrite to fix all issues."},
            ],
        )

        # Stage 4: Synthesizer
        final = await self._call_stage(
            provider=self.synthesizer_provider,
            system=(
                "You are a quality assurance expert. Verify this output fully solves the user's goal. "
                "Make any final adjustments and deliver the clean, final answer."
            ),
            messages=[
                {"role": "user", "content": f"Original goal: {user_goal}"},
                {"role": "assistant", "content": optimized},
                {"role": "user", "content": "Please verify this solves the goal and provide the final, clean version."},
            ],
        )

        return final

    async def _call_stage(self, provider: str, system: str, messages: list) -> str:
        """Call a provider for one MoA stage."""
        from providers.openrouter import OpenRouterClient
        from providers.groq import GroqClient
        from providers.gemini import GeminiClient
        from providers.ollama import OllamaClient

        env_map = {
            "openrouter": ("OPENROUTER_API_KEY", "deepseek/deepseek-r1:free", OpenRouterClient),
            "groq":       ("GROQ_API_KEY",       "llama-3.3-70b-versatile",    GroqClient),
            "gemini":     ("GEMINI_API_KEY",      "gemini-2.0-flash-exp",       GeminiClient),
            "ollama":     (None,                  "llama3.2",                    OllamaClient),
        }

        if provider not in env_map:
            provider = "openrouter"

        env_key_name, default_model, ClientCls = env_map[provider]
        api_key = os.getenv(env_key_name or "", "no-key")
        client = ClientCls(api_key=api_key, model=default_model)

        body = {
            "model": default_model,
            "messages": [{"role": "system", "content": system}] + messages,
            "stream": False,
            "max_tokens": 4096,
        }

        try:
            response = await client.complete(body)
            # Extract text from OpenAI-compatible response
            if isinstance(response, dict):
                choices = response.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
            return str(response)
        except Exception as e:
            return f"[Stage error on {provider}: {e}]"

    def _extract_last_user_message(self, messages: list) -> str:
        for msg in reversed(messages):
            if msg.get("role") == "user":
                content = msg.get("content", "")
                return content if isinstance(content, str) else str(content)
        return ""

