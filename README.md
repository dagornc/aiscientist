# Autosearch — AI Scientist

A fully automated scientific discovery pipeline inspired by [Sakana AI's AI Scientist](https://sakana.ai/ai-scientist/).

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Idea        │────▶│  Experiment  │────▶│  Paper       │────▶│  Peer       │
│  Generation  │     │  Execution   │     │  Write-up    │     │  Review     │
└─────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
       │                                                               │
       └───────────── Revision Loop (if rejected) ◀──────────────────┘
```

## Stack

- **Backend**: FastAPI + Pydantic v2 + LangGraph + SQLAlchemy
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Shadcn/UI
- **LLM**: Multi-provider (OpenRouter, OpenAI, Anthropic, Google) via LangChain
- **Sandbox**: Docker-based code execution with resource limits
- **Search**: Semantic Scholar + OpenAlex literature integration

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 2. Install dependencies
./Cmd/install.sh

# 3. Start both services
./Cmd/start.sh
```

Backend: http://localhost:8000 (API docs at /docs)  
Frontend: http://localhost:5173

## Directory Structure

```
Cmd/             # Shell scripts (install, start, test)
Code/Backend/    # FastAPI application
Code/Frontend/   # React application
Config/          # Global configuration (global.yaml)
Doc/sphinx/      # Sphinx documentation
Log/             # Runtime logs
Test/            # pytest test suite
artifacts/       # Generated research artifacts
```

## Pipeline Phases

1. **Idea Generation** — LLM generates novel research ideas with novelty scoring via literature search
2. **Experimental Iteration** — LLM-designed experiments executed in Docker sandbox
3. **Paper Write-up** — Structured LaTeX paper generation with methodology and results
4. **Automated Peer Review** — ICLR-style review with scores, revision loop if needed

## License

MIT
