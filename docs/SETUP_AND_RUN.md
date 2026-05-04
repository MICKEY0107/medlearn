# Setup and Run Guide

This guide is for someone cloning the project for the first time.

## 1. What you need installed

- Node.js
- npm
- PostgreSQL
- Python 3.x
- pip

## 2. Services used by the project

- **Frontend** → `http://localhost:3000`
- **Backend** → `http://localhost:3001`
- **ML service** → `http://localhost:8000`
- **PostgreSQL** → `localhost:5433`

## 3. Project folders

- `frontend/` → Next.js app
- `backend/` → Express + Prisma API
- `ml-service/` → FastAPI helper service

## 4. Environment setup

### Frontend
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend
Use `backend/.env.example` as the starting point.

Important values include:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/medlearn"
JWT_ACCESS_SECRET="your_secret"
JWT_REFRESH_SECRET="your_secret"
ML_SERVICE_URL="http://localhost:8000"
PORT=3001
FRONTEND_URL="http://localhost:3000"
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="meta-llama/llama-3.3-70b-instruct:free"
GROQ_API_KEY=""
GROQ_MODEL="llama-3.3-70b-versatile"
```

Notes:
- remote provider keys are optional
- the project is designed to keep working locally without a paid AI setup
- never commit real `.env` files or real API keys

## 5. Install dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

### ML service
```bash
cd ml-service
pip install -r requirements.txt
```

## 6. Database setup

Make sure PostgreSQL is running on port `5433`.

Create a database named:
- `medlearn`

Then run Prisma setup from the backend folder:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 7. Start order

Always start in this order:

### Step 1: Start PostgreSQL
Ensure the database server is running.

### Step 2: Start ML service
From `ml-service/`:

```bash
python main.py
```

Expected health endpoint:
- `http://127.0.0.1:8000/health`

### Step 3: Start backend
From `backend/`:

```bash
npm run dev
```

Expected health endpoint:
- `http://127.0.0.1:3001/health`

### Step 4: Start frontend
From `frontend/`:

```bash
npm run dev
```

Expected app URL:
- `http://localhost:3000`

## 8. Recommended verification flow

After startup, test these main flows:

1. register or login
2. open the feed
3. create an insight post
4. create a paper post using a paper URL
5. open the paper page
6. open the AI panel
7. test summary, project ideas, and concept path
8. test search
9. test bookmarks and notifications
10. test profile and network flow

## 9. Common issues and quick fixes

### Backend says DB connection failed
- check PostgreSQL is running
- verify `DATABASE_URL`
- verify port `5433`
- ensure database `medlearn` exists

### Frontend loads but API requests fail
- check backend is running on `3001`
- check `frontend/.env.local`
- check CORS-related frontend/backend URLs match

### AI panel fails
- check backend is running
- check ML service is running on `8000`
- if no provider keys are set, the project should still fall back to local or heuristic paths

### Paper ingest fails
- try a valid PubMed, Semantic Scholar, or DOI link
- for PDF input, ensure the file is a valid PDF
- if metadata extraction is weak, use manual title/abstract input

### Auth problems
- clear localStorage tokens in the browser
- login again
- ensure backend JWT secrets are set

## 10. What is optional vs required?

### Required
- PostgreSQL
- frontend dependencies
- backend dependencies
- valid backend env

### Strongly recommended
- local ML service

### Optional
- OpenRouter key
- Groq key
- Claude key

## 11. Best file entrypoints for debugging

If something breaks, start here:
- `backend/src/index.ts`
- `backend/src/routes/auth.ts`
- `backend/src/routes/posts.ts`
- `backend/src/routes/papers.ts`
- `backend/src/routes/ai.ts`
- `frontend/src/lib/api-client.ts`
- `frontend/src/context/AuthContext.tsx`
