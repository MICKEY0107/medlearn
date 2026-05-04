# Project Overview

This file explains MedLearn in plain language for someone who is seeing the project for the first time.

## What is MedLearn?

MedLearn is a healthcare research platform designed to help users do three things in one place:
- understand research papers
- discuss them with other users
- build academic or technical work from them

It is meant for:
- medical students
- doctors
- researchers
- lab scientists

## Why was this project built?

Research papers are often difficult to understand quickly, especially for students or people crossing into a new domain. Existing research websites help people find papers, but they usually do not help much with:
- simplifying content for different skill levels
- turning research into discussion
- converting papers into project ideas
- combining professional networking with academic collaboration

MedLearn tries to solve that gap.

## Main parts of the project

## 1. Frontend
The frontend is the website users interact with.

It handles:
- login and registration
- feed browsing
- paper pages
- AI panel interactions
- comments and discussions
- search and profile views
- notifications and network features

Main folder:
- `frontend/`

## 2. Backend
The backend is the main logic layer.

It handles:
- authentication
- database reads/writes
- post creation
- paper ingestion
- AI orchestration
- notifications, bookmarks, and connections
- search and admin routes

Main folder:
- `backend/`

## 3. Database
The PostgreSQL database stores:
- users
- posts
- papers
- comments
- bookmarks
- notifications
- topic follows
- connections
- AI cache
- discussion summaries

Backend accesses the DB through Prisma.

## 4. ML service
The Python ML service supports local AI-related tasks.

It provides endpoints for:
- summarisation
- classification/tagging
- embeddings

This helps the project keep working even without a paid AI API.

Main folder:
- `ml-service/`

## How the project works at a high level

```text
User opens website
→ frontend shows pages and sends API requests
→ backend validates auth and runs app logic
→ backend reads/writes PostgreSQL via Prisma
→ backend may also call ingestion services or AI helpers
→ response comes back to frontend
→ UI updates for the user
```

## Main functional modules

### Authentication
Users can register, login, refresh tokens, and logout.

### Feed
Users can share:
- papers
- insights
- questions
- projects

### Papers
A paper can be added through:
- PubMed link
- Semantic Scholar link
- DOI/CrossRef path
- PDF upload
- manual metadata

### AI features
For each paper, MedLearn can provide:
- simplified summary
- project ideas
- concept path
- discussion summary
- related papers

### Social features
Users can:
- comment
- bookmark
- connect with others
- view notifications
- follow topics

## What should a new collaborator read first?

Read in this order:
1. `README.md`
2. `docs/SETUP_AND_RUN.md`
3. `docs/ARCHITECTURE_AND_FLOW.md`
4. `backend/src/index.ts`
5. `frontend/src/lib/api-client.ts`
6. `frontend/src/context/AuthContext.tsx`

## What should be run first?

When starting locally:
1. PostgreSQL
2. ML service
3. Backend
4. Frontend

## Important idea about AI in this project

AI is not only based on one paid API.

The project currently uses a layered strategy:
- cached results first
- local ML service when available
- optional remote provider fallback
- backend heuristics as the final fallback

That makes the project easier to run locally and easier to demonstrate in a student setting.

## What this project is good for in a course presentation

This project is strong as a course project because it includes:
- full-stack development
- authentication and secure API flow
- database design
- AI integration
- external API/data-source ingestion
- modular UI
- system architecture and workflow design
