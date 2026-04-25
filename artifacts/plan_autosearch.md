# Plan : Autosearch — AI Scientist Implementation

## Vue d'ensemble
Implémentation complète de l'algorithme **AI Scientist** de Sakana AI, avec une interface web moderne pour piloter le pipeline de découverte scientifique automatisée.

## Les 4 phases du pipeline AI Scientist
1. **Idea Generation** — Brainstorming de idées de recherche novatrices + vérification de nouveauté (Semantic Scholar / OpenAlex)
2. **Experimental Iteration** — Exécution des expériences, collecte de résultats, génération de visualisations
3. **Paper Write-up** — Rédaction automatique d'un manuscript LaTeX avec citations
4. **Automated Peer Review** — Évaluation automatisée du papier avec feedback itératif

## Architecture

### Backend (Python / FastAPI)
- **Framework** : FastAPI + Uvicorn
- **Orchestration IA** : LangGraph (StateGraph) pour le pipeline multi-étapes
- **LLM** : ChatOpenAI via LangChain avec factory pattern (OpenRouter par défaut)
- **Recherche biblio** : Semantic Scholar API + OpenAlex fallback
- **Exécution code** : Sandbox Docker pour exécuter les expériences générées
- **Génération LaTeX** : Templates + compilation pdflatex

### Frontend (React + TypeScript)
- **Framework** : Vite + React 18
- **UI** : Tailwind CSS + Shadcn/UI + Radix
- **Visualisation pipeline** : React Flow pour le graphe du workflow AI Scientist
- **Modes** : Clair/Sombre, multilingue (FR/EN), responsive

### Structure du projet
```
Autosearch/
├── Cmd/                    # Scripts shell standalone
│   ├── start_backend.sh
│   ├── start_frontend.sh
│   └── setup_env.sh
├── Code/
│   ├── Backend/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py              # FastAPI app
│   │   │   ├── config.py            # Settings via pydantic
│   │   │   ├── api/
│   │   │   │   ├── routes_ideas.py
│   │   │   │   ├── routes_experiments.py
│   │   │   │   ├── routes_papers.py
│   │   │   │   ├── routes_reviews.py
│   │   │   │   └── routes_models.py
│   │   │   ├── core/
│   │   │   │   ├── llm_factory.py   # Factory pattern pour LLM
│   │   │   │   ├── pipeline.py      # LangGraph pipeline orchestration
│   │   │   │   └── sandbox.py       # Docker sandbox pour exécution code
│   │   │   ├── models/
│   │   │   │   ├── idea.py
│   │   │   │   ├── experiment.py
│   │   │   │   ├── paper.py
│   │   │   │   └── review.py
│   │   │   ├── services/
│   │   │   │   ├── idea_generator.py
│   │   │   │   ├── experiment_runner.py
│   │   │   │   ├── paper_writer.py
│   │   │   │   ├── reviewer.py
│   │   │   │   └── literature_search.py
│   │   │   └── db/
│   │   │       └── database.py      # SQLite via SQLAlchemy
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── Frontend/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── i18n/
│       │   └── lib/
│       ├── package.json
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── vite.config.ts
├── Config/
│   └── global.yaml
├── Doc/
│   └── sphinx/
├── Log/
├── Test/
│   ├── test_idea_generator.py
│   ├── test_experiment_runner.py
│   ├── test_paper_writer.py
│   ├── test_reviewer.py
│   └── test_api.py
├── start.sh
├── .env
├── .env.example
├── docker-compose.yml
├── .gitignore
└── requirements.txt
```

## Étapes de construction
1. ✅ Planification (ce document)
2. Scaffold de l'arborescence projet
3. Backend : config, LLM factory, models pydantic
4. Backend : services (idea_generator, experiment_runner, paper_writer, reviewer, literature_search)
5. Backend : pipeline LangGraph
6. Backend : API routes FastAPI
7. Frontend : scaffold Vite + React + Tailwind + Shadcn
8. Frontend : pages et composants (Dashboard, Pipeline, Ideas, Experiments, Papers, Reviews)
9. Frontend : React Flow pour visualisation du pipeline
10. Frontend : mode clair/sombre, i18n, responsive
11. Docker & scripts shell
12. Tests
13. Documentation Sphinx
14. Git init + push GitHub
