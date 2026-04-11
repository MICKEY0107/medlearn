# MedLearn: Project Roadmap (Full-Fledged)

This document outlines the remaining 20% of work required to transition from the current stable foundation to a production-ready, full-featured professional ecosystem.

## Phase A: Content & Social Activation (Immediate)
- **Personalized Feed Engine**: Implement the algorithm to show posts from **Connected Peers** and **Followed Topics** (curate the global feed).
- **Post Interactions**: Finalize the "Like", "Bookmark", and "Repost" logic on the backend for persistent engagement.
- **Discussion Highlights**: Implement logic to auto-mark "Best Answers" in Question posts (like StackOverflow).

## Phase B: Advanced ML & Semantic Search (Next Level)
- **Vector Embeddings (pgvector)**: Integrate Sentence Transformers in the `ml-service` to turn all paper abstracts into vectors.
- **"Similar Papers" Feature**: Enable semantic search—find papers that are conceptually similar even if they don't share keywords.
- **RAG Implementation (DocChat)**: Allow users to "Chat with a Paper" specifically using their vector store (Research Assistant).

## Phase C: Real-time & Performance (Production Ready)
- **Real-time Notifications**: Integrate **Socket.io** for live alerts (e.g., when a paper you posted gets cited or discussed).
- **Infinite Scroll**: Optimize the feed for thousands of posts with pagination and skeleton loading.
- **Global Deployment**: Optimize Docker containers for cloud hosting (AWS/DigitalOcean/Vercel).

## Phase D: Professional Verification (Quality)
- **Institutional Verification**: Logic to verify Doctor/Researcher credentials (institutional email verification).
- **Unit Testing**: 90%+ coverage for core ingestion and auth services.

---

**MedLearn is now stable at Phase 2 & 7. The foundation is built.**
