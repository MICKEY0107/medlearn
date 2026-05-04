# Architecture and Flow

This document explains how MedLearn is structured and how data moves through the system.

## 1. System overview

```text
User Browser
   ↓
Next.js Frontend
   ↓
Express Backend API
   ↓
PostgreSQL via Prisma
   ↓
Optional AI/ML helpers
   ├─ Local FastAPI ML service
   └─ Remote provider fallback
```

## 2. Project structure

```text
medlearn/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── lib/
│   │   ├── services/
│   │   └── index.ts
│   └── prisma/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── lib/
├── ml-service/
└── docs/
```

## 3. Frontend flow

The frontend is responsible for pages, user interactions, API calls, and auth state.

Core files:
- `frontend/src/app/layout.tsx`
- `frontend/src/app/providers.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/lib/api-client.ts`

### App startup flow

```text
Browser loads app
→ Root layout renders
→ Providers wrap the app
→ AuthContext checks localStorage for tokens
→ frontend calls /api/auth/me
→ backend validates token
→ user session is restored
```

### API calling pattern

```text
Component or hook
→ api-client helper
→ axios attaches Bearer token
→ backend endpoint
→ response returned
→ UI updates
```

If a request fails with 401:
- frontend tries refresh token flow
- stores new tokens
- retries the original request

## 4. Backend flow

Core backend entry:
- `backend/src/index.ts`

### Request lifecycle

```text
Incoming HTTP request
→ Express app
→ helmet + cors + json parsing + rate limiter
→ route selection
→ auth middleware if required
→ route handler logic
→ Prisma/service calls
→ JSON response
→ error handler if needed
```

Registered route groups:
- `/api/auth`
- `/api/users`
- `/api/posts`
- `/api/papers`
- `/api/ai`
- `/api/comments`
- `/api/search`
- `/api/admin`
- `/api/connections`
- `/api/upload`

## 5. Database interaction flow

Core DB access file:
- `backend/src/lib/prisma.ts`

Pattern:

```text
Route handler
→ prisma query / transaction
→ PostgreSQL
→ data returned to route
→ API response sent
```

Main stored entities include:
- User
- Post
- Paper
- Comment
- Bookmark
- Connection
- Notification
- AICache
- DiscussionSummary
- RefreshToken

## 6. Feed and post creation flow

Frontend files:
- `frontend/src/app/feed/page.tsx`
- `frontend/src/components/feed/FeedComposer.tsx`

Backend file:
- `backend/src/routes/posts.ts`

### Feed loading

```text
User opens /feed
→ useFeed hook runs
→ GET /api/posts
→ backend fetches paginated posts
→ optional interaction flags added
→ frontend renders cards by post type
```

### Post creation

#### Insight / Question / Project
```text
User submits form
→ POST /api/posts
→ backend validates and inserts post
→ feed refetches
```

#### Paper post
```text
User submits paper link or PDF
→ POST /api/papers/ingest
→ backend resolves metadata
→ Paper row created
→ frontend receives paperId
→ POST /api/posts with paperId
→ discussion post linked to paper is created
```

## 7. Paper ingestion pipeline

Core files:
- `backend/src/routes/papers.ts`
- `backend/src/services/ingestion/index.ts`
- `backend/src/services/ingestion/pubmed.ts`
- `backend/src/services/ingestion/semanticScholar.ts`
- `backend/src/services/ingestion/crossref.ts`
- `backend/src/services/ingestion/pdfParser.ts`

### Input routing

```text
Ingest request arrives
→ if PDF: resolvePDF
→ if PubMed URL / PMID: resolvePubMed
→ if Semantic Scholar URL: resolveSemanticScholar
→ if DOI or DOI-like URL: resolveCrossRef
→ if manual title/abstract: build manual metadata
→ create Paper row in database
→ trigger async tag generation
```

## 8. Paper detail and discussion flow

Frontend file:
- `frontend/src/app/paper/[id]/page.tsx`

Backend files:
- `backend/src/routes/papers.ts`
- `backend/src/routes/posts.ts`
- `backend/src/routes/ai.ts`

### Flow

```text
User opens /paper/:id
→ load paper details
→ load related papers
→ load linked discussion post if present
→ load comments for the post
→ allow user to add new comments
→ if enough comments exist, discussion summary can be generated
```

## 9. AI/ML flow

Frontend files:
- `frontend/src/components/ai-panel/AIBottomSheet.tsx`
- `frontend/src/hooks/useAIPanel.ts`

Backend files:
- `backend/src/routes/ai.ts`
- `backend/src/services/mlService.ts`
- `backend/src/lib/remoteAI.ts`

ML files:
- `ml-service/main.py`
- `ml-service/models/*`

### AI request flow

```text
User opens AI panel
→ frontend calls simplify / project ideas / concept path API
→ backend checks AICache first
→ if cached: return immediately
→ if uncached: call mlService
→ result is cached
→ frontend renders the response
```

### Fallback order

```text
1. Local ML service if available
2. Remote provider if configured
   - OpenRouter
   - Groq
   - optional Claude
3. Backend heuristic fallback
```

### AI-supported features
- student summary
- researcher summary
- compare mode
- project ideas
- concept path
- paper tagging
- discussion summary
- related papers (heuristic ranking)

## 10. Search, profile, and network flow

### Search
Frontend:
- `frontend/src/app/search/page.tsx`

Backend:
- `backend/src/routes/search.ts`

Flow:

```text
User types query
→ frontend updates URL and calls /api/search
→ backend searches papers + users + posts in parallel
→ frontend groups and displays results
```

### Profile / bookmarks / notifications / connections
Backend file:
- `backend/src/routes/users.ts`

These flows use the same pattern:

```text
Frontend page or hook
→ usersAPI / connection API call
→ backend validates auth
→ Prisma query or update
→ frontend renders returned data
```

## 11. Local runtime sequence

```text
1. Start PostgreSQL on 5433
2. Start ml-service on 8000
3. Start backend on 3001
4. Start frontend on 3000
5. Open the app in browser
```

## 12. Key files to read first

Recommended order:
1. `README.md`
2. `docs/PROJECT_OVERVIEW.md`
3. `docs/SETUP_AND_RUN.md`
4. `backend/src/index.ts`
5. `frontend/src/lib/api-client.ts`
6. `frontend/src/context/AuthContext.tsx`
7. `backend/src/routes/posts.ts`
8. `backend/src/routes/papers.ts`
9. `backend/src/routes/ai.ts`
10. `backend/src/services/mlService.ts`

## 13. One-line mental model

```text
Frontend pages and hooks call backend APIs, backend routes coordinate business logic and storage, and AI features are layered through cache, local ML, provider fallback, and heuristics.
```
