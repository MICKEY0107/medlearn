# MedLearn

MedLearn is a healthcare research and professional networking platform built as a full-stack course project. It combines paper discovery, research discussion, academic networking, and AI-assisted understanding into one system.

## What MedLearn does

MedLearn combines three ideas in one platform:
- **Professional networking** for students, doctors, researchers, and lab scientists
- **Research paper exploration** with discussion, bookmarks, and related-paper discovery
- **AI assistance** for paper summarisation, project ideas, concept paths, and discussion synthesis

## Core features

- User registration, login, token refresh, and profile management
- Multi-type social feed: paper, insight, question, and project posts
- Paper ingestion from PubMed, Semantic Scholar, DOI/CrossRef, PDF, or manual metadata
- Paper detail page with abstract, discussion thread, AI panel, and related papers
- Search across users, papers, and posts
- Bookmarks, notifications, topic following, and professional connections
- Admin statistics page
- Free-first AI pipeline with cache, local ML service, optional remote provider fallback, and backend heuristics

## Tech stack

### Frontend
- Next.js
- TypeScript
- React Query
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT authentication

### Data and AI
- PostgreSQL
- Python FastAPI ML service
- Optional OpenRouter / Groq / Claude provider fallback

## Repository structure

```text
medlearn/
├── backend/       # Express API + Prisma + ingestion + AI orchestration
├── frontend/      # Next.js application
├── ml-service/    # FastAPI local ML helper service
├── docs/          # Project docs for onboarding, architecture, setup, and report guidance
└── roadmap.md     # Future improvements and next-phase work
```

## Read this first

If you are new to the project, read these files in order:
1. [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)
2. [docs/SETUP_AND_RUN.md](docs/SETUP_AND_RUN.md)
3. [docs/ARCHITECTURE_AND_FLOW.md](docs/ARCHITECTURE_AND_FLOW.md)
4. [docs/REPORT_GUIDE.md](docs/REPORT_GUIDE.md)

## Quick start

### 1. Prerequisites
- Node.js
- PostgreSQL
- Python 3.x
- npm

### 2. Services and ports
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- ML service: `http://localhost:8000`
- PostgreSQL: `localhost:5433`

### 3. Start order
1. Start PostgreSQL
2. Start the ML service
3. Start the backend
4. Start the frontend

See [docs/SETUP_AND_RUN.md](docs/SETUP_AND_RUN.md) for the full setup flow.

## Documentation guide

- [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) — beginner-friendly explanation of the system
- [ARCHITECTURE_AND_FLOW.md](docs/ARCHITECTURE_AND_FLOW.md) — structure and end-to-end pipelines
- [SETUP_AND_RUN.md](docs/SETUP_AND_RUN.md) — local setup and troubleshooting
- [REPORT_GUIDE.md](docs/REPORT_GUIDE.md) — how to use this project as input for the formal course report

## Current project direction

MedLearn is currently optimized for a **free-first local development path**:
- the project should still be usable without paid AI access
- local ML and backend heuristics keep the main AI features functional
- optional remote providers improve quality when keys are configured

## Future work

Planned next steps are captured in [roadmap.md](roadmap.md).
