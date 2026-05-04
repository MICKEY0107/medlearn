# Report Guide

This document is **not the final report**. It is a guide for turning MedLearn into the formal academic report required by the course.

It uses these reference files outside the repo:
- `course-handout.md`
- `project-font.md`
- `body-format.md`

## 1. What the course expects

From the course handout, your project presentation/report should demonstrate:
- problem understanding
- literature and background survey
- methodology and technical approach
- implementation quality
- testing and analysis
- results and discussion
- innovation and creativity
- final demonstration readiness

That aligns well with MedLearn because the project includes:
- full-stack web development
- database design
- authentication and API architecture
- paper ingestion workflows
- AI integration
- user-facing modules and documentation

## 2. Report structure to follow

From `project-font.md`, the expected report structure is:
1. Title Page
2. Candidate’s Declaration and Supervisor’s Declaration
3. Acknowledgement
4. Table of Contents
5. Abstract
6. Introduction
7. Literature Review
8. Problem Statement
9. Methodology
10. Experimental/Simulation/Analytical Analysis and Discussion of Results
11. Conclusions
12. References
13. Plagiarism Check Report

## 3. Front-page guidance

From `project-font.md`, your front pages should include:
- full project title
- student name
- enrollment number
- mentor/supervisor name and designation
- department and university details
- submission month/year

Do **not** use shortened project names on the title page.

## 4. Declaration and acknowledgement guidance

From `body-format.md`, you will later need:
- candidate declaration
- supervisor declaration
- acknowledgement page

These require personal details you should fill manually later:
- your full name
- exact university roll/enrollment number
- supervisor name
- supervision period/dates
- signatures if required in final submission

## 5. How MedLearn maps to each report section

## Abstract
Use this section to summarize:
- the problem: research papers are hard to understand and act on quickly
- the solution: MedLearn combines research discovery, discussion, networking, and AI support
- the implementation: Next.js + Express + PostgreSQL + Prisma + FastAPI ML service
- the result: a working full-stack platform with paper ingestion, AI features, and social collaboration

Useful references:
- `README.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/ARCHITECTURE_AND_FLOW.md`

## Introduction
Explain:
- the growth of medical research content
- difficulty in reading and understanding papers efficiently
- absence of platforms that combine research, social discussion, and AI support
- why MedLearn is relevant to students, doctors, and researchers

Useful source:
- project motivation from `context.md`

## Literature Review
This section should discuss:
- current research discovery systems like PubMed-style access
- AI-assisted summarisation in research/education
- academic collaboration and discussion platforms
- challenges with medical-domain summarisation

You should write this from actual literature sources and papers, not from code.

The project helps support this section because it includes:
- medical research understanding use case
- hybrid AI path
- structured paper discussion support

## Problem Statement
State clearly what gap MedLearn addresses.

Example themes to cover:
- papers are difficult for different user levels to understand
- paper reading and academic discussion are fragmented
- there is a gap between reading research and building projects from it
- existing systems do not unify learning, networking, and AI support well

Useful source:
- `docs/PROJECT_OVERVIEW.md`

## Methodology
This is one of the most important sections.

Explain the system in layers:
- frontend architecture
- backend route and service design
- database design using Prisma/PostgreSQL
- paper ingestion workflow
- AI fallback pipeline
- local ML support

Useful references:
- `docs/ARCHITECTURE_AND_FLOW.md`
- `backend/src/index.ts`
- `frontend/src/lib/api-client.ts`
- `backend/src/services/ingestion/index.ts`
- `backend/src/services/mlService.ts`
- `ml-service/main.py`

## Experimental / Analytical Analysis and Discussion of Results
Use this section to explain:
- what modules were implemented
- what user flows are working
- how the system behaves in practice
- what AI outputs are available
- what tests or validations were performed
- strengths and observed limitations

You can discuss implemented features like:
- authentication
- feed and posts
- paper ingest
- AI panel
- comments and discussion summary
- search
- bookmarks/notifications/network

Also discuss current limitations honestly, for example:
- heuristic fallback quality vs richer hosted models
- no final production deployment yet
- semantic similarity can still be improved further

Useful references:
- `README.md`
- `docs/SETUP_AND_RUN.md`
- `roadmap.md`

## Conclusions
Summarize:
- what was built
- whether the objectives were met
- what makes the project valuable
- what can be improved in future work

Useful source:
- `roadmap.md`

## References
Include:
- research papers used for literature review
- APIs or datasets referenced academically if relevant
- official documentation for major frameworks only if your report format allows technical references

## 6. What evidence from the project helps during evaluation

Based on the course handout, evaluators will care about:

### Project understanding
Use:
- problem statement
- system goals
- user roles
- feature module explanation

### Methodology and approach
Use:
- architecture flow
- route structure
- DB design
- ingestion and AI design

### Implementation and execution
Use:
- working local application
- modular code structure
- current running stack

### Results and analysis
Use:
- implemented features
- verified user flows
- limitations and future roadmap

### Documentation quality
Use:
- `README.md`
- onboarding docs
- setup guide
- architecture guide

## 7. What to avoid in the final report

- do not paste raw code into every section unless specifically required
- do not claim production deployment if it is not done
- do not invent benchmark numbers you did not measure
- do not fabricate literature findings
- do not leave placeholders in the final submitted version

## 8. What you still need later before final submission

Before writing the actual report, you will still need:
- your full name
- enrollment number / roll number
- mentor/supervisor name and designation
- exact project period dates
- plagiarism check report
- screenshots/figures if required
- any measured results or demo observations you want to include in the analysis section

## 9. Suggested order when writing the real report later

1. Finalize the system and screenshots
2. Prepare literature review references
3. Write methodology from the implemented architecture
4. Write results/discussion from tested flows
5. Write introduction and problem statement
6. Write abstract last
7. Fill declarations and acknowledgements at the end
