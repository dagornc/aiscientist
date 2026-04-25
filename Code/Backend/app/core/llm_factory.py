"""LLM Factory — Strategy pattern for instantiating chat models.

Supports multiple providers via LangChain's ChatModel integrations.
All API keys are loaded from the environment via Settings.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from langchain_core.language_models.chat_models import BaseChatModel

from app.config import settings


@runtime_checkable
class ChatModelProvider(Protocol):
    """Protocol for chat model providers."""

    def create(self) -> BaseChatModel:
        """Create and return a configured chat model instance."""
        ...


class OpenRouterProvider:
    """OpenRouter provider using ChatOpenAI with custom base URL."""

    def create(self) -> BaseChatModel:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
            default_headers={"HTTP-Referer": "https://autosearch.app"},
        )


class OpenAIProvider:
    """OpenAI provider."""

    def create(self) -> BaseChatModel:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )


class AnthropicProvider:
    """Anthropic provider."""

    def create(self) -> BaseChatModel:
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )


class DeepSeekProvider:
    """DeepSeek provider via OpenAI-compatible API."""

    def create(self) -> BaseChatModel:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.deepseek_api_key,
            base_url="https://api.deepseek.com/v1",
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )


class GeminiProvider:
    """Google Gemini provider."""

    def create(self) -> BaseChatModel:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.gemini_api_key,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )


_PROVIDERS: dict[str, type[ChatModelProvider]] = {
    "openrouter": OpenRouterProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "deepseek": DeepSeekProvider,
    "gemini": GeminiProvider,
}


def create_chat_model(provider: str | None = None) -> BaseChatModel:
    """Factory function: create a chat model for the given provider.

    Args:
        provider: Provider name. Defaults to ``settings.llm_provider``.

    Returns:
        A configured ``BaseChatModel`` instance.

    Raises:
        ValueError: If the provider is not supported.
    """
    name = provider or settings.llm_provider
    provider_cls = _PROVIDERS.get(name)
    if provider_cls is None:
        supported = ", ".join(sorted(_PROVIDERS.keys()))
        msg = f"Unsupported LLM provider: {name!r}. Supported: {supported}"
        raise ValueError(msg)
    return provider_cls().create()


def list_available_providers() -> list[dict[str, str]]:
    """Return metadata for all supported providers.

    Returns:
        A list of dicts with ``id`` and ``name`` keys.
    """
    return [
        {"id": "openrouter", "name": "OpenRouter"},
        {"id": "openai", "name": "OpenAI"},
        {"id": "anthropic", "name": "Anthropic"},
        {"id": "deepseek", "name": "DeepSeek"},
        {"id": "gemini", "name": "Google Gemini"},
    ]
