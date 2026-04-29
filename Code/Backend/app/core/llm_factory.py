"""LLM Factory — Strategy pattern for instantiating chat models.

Supports multiple providers via LangChain's ChatModel integrations.
All API keys are loaded from the environment via Settings.
"""

from __future__ import annotations

import asyncio
from typing import AsyncIterator, Literal, Protocol, runtime_checkable

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage
from tenacity import retry, stop_after_attempt, wait_exponential

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
            model=settings.llm_model.replace('openrouter/', ''),
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


# Global model cache
_model_cache: dict[str, BaseChatModel] = {}

# Enhanced retry implementation
retry_decorator = retry(
    stop=stop_after_attempt(settings.llm_retry_attempts),
    wait=wait_exponential(multiplier=settings.llm_retry_delay, min=1, max=60),
    reraise=True,
)


@retry_decorator
def create_chat_model(provider: str | None = None) -> BaseChatModel:
    """Factory function: create a chat model for the given provider with retry logic.

    Args:
        provider: Provider name. Defaults to ``settings.llm_provider``.

    Returns:
        A configured ``BaseChatModel`` instance.

    Raises:
        ValueError: If the provider is not supported.
        Exception: After max retries if instantiation fails.
    """
    # Build cache key from all settings that affect the model
    name = provider or settings.llm_provider
    cache_key = f"{name}:{settings.llm_model}:{settings.llm_temperature}:{settings.llm_max_tokens}"
    
    # Check if model is already cached
    if cache_key in _model_cache:
        return _model_cache[cache_key]
    
    provider_cls = _PROVIDERS.get(name)
    if provider_cls is None:
        supported = ", ".join(sorted(_PROVIDERS.keys()))
        msg = f"Unsupported LLM provider: {name!r}. Supported: {supported}"
        raise ValueError(msg)
    
    # Additional error handling during model creation
    try:
        model = provider_cls().create()
        # Cache the created model
        _model_cache[cache_key] = model
        return model
    except Exception as e:
        print(f"Error creating model for provider {name}: {e}")
        raise


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


class ModelStreamManager:
    """Helper class to manage streamed responses with enhanced error handling."""
    
    def __init__(self, chat_model: BaseChatModel):
        self.chat_model = chat_model
    
    async def stream_completion(
        self, 
        messages: list[BaseMessage], 
        streaming_callback=None,
        **kwargs
    ) -> AsyncIterator[str]:
        """Stream completion response with robust error handling and retries."""
        try:
            # Attempt streaming with retry logic
            async for chunk in self._stream_with_retry(messages, kwargs):
                if streaming_callback:
                    await streaming_callback(chunk)
                yield chunk
        except Exception as e:
            print(f"Error during streaming: {e}")
            raise
    
    @retry_decorator
    async def _stream_with_retry(self, messages: list[BaseMessage], kwargs: dict):
        """Internal method to handle streaming with retry logic."""
        try:
            async for chunk in self.chat_model.astream(messages, **kwargs):
                content = chunk.content if hasattr(chunk, 'content') else str(chunk)
                yield content
        except Exception as e:
            print(f"Stream attempt failed: {e}")
            raise
