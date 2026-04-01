# Turbo AI Notes Taking App Challenge

This repository contains my implementation of the Turbo AI Notes Taking App challenge using Django/Django REST Framework for the backend and Next.js for the frontend.

This README is being maintained as a living document throughout development. It captures not only the technical direction of the project, but also how I used AI intentionally as part of the build process.

## Project Summary

The goal of this challenge is to recreate the notes-taking experience described in the provided video and Figma references, while balancing product quality, engineering judgment, and delivery speed within a 72-hour timebox.

Current repository structure:

- `notes-taking-backend`: Django + Django REST Framework backend
- `notes-taking-frontend`: Next.js frontend

## Process Summary

I approached this challenge as a product-focused full stack implementation rather than only a UI exercise. My goal is to deliver a solution that is clean, practical, and easy to extend.

Initial progress:

- Reviewed the challenge brief, constraints, and deliverables.
- Audited the current workspace to understand what had already been scaffolded.
- Established the backend foundation with Django, Django REST Framework, and PostgreSQL.
- Chose Docker Compose to run the local database in a predictable way.
- Added an authentication foundation based on JWT for the API while preserving Django session-based authentication compatibility.
- Started maintaining this README early so that decisions and AI usage are documented as part of the workflow, not reconstructed at the end.

## Key Design And Technical Decisions

The following decisions have been made so far:

- Backend stack: Django + Django REST Framework
- Frontend stack: Next.js
- Database: PostgreSQL
- Local database orchestration: Docker Compose
- Backend environment management: `.env`-based configuration
- Cross-origin setup: Django configured to allow the local frontend during development
- Authentication strategy: JWT for API access, with Django session authentication preserved for compatibility and admin ergonomics

Rationale:

- PostgreSQL was selected because the challenge description does not mandate a database, and Postgres is a strong default for production-style application work.
- Docker Compose keeps local setup consistent and reduces machine-specific database friction.
- Django REST Framework provides a fast and reliable way to expose a clean API while preserving room for testable application structure.
- Using JWT gives the frontend a clean authentication flow, while keeping Django sessions enabled avoids unnecessary regressions in admin access and local development workflows.
- A custom email-based user model was introduced early so authentication can match the product requirements without fighting Django defaults later.

## AI Usage

The challenge explicitly encourages AI usage, so I used it deliberately as an engineering accelerator rather than as a replacement for judgment.

### Tool Used

- Codex / GPT-5

### How I Used AI

I used AI in a collaborative, review-driven way:

- To break down the challenge requirements into actionable implementation steps
- To inspect and summarize the current state of the repository quickly
- To pressure-test technical decisions, such as the choice of PostgreSQL and Docker Compose
- To generate and maintain documentation while development is still in progress
- To accelerate setup and reduce time spent on repetitive project bootstrapping
- To design and implement the authentication foundation, including tradeoffs between JWT, session authentication, and email-based login

### How I Did Not Use AI

I did not treat AI output as final by default. I used it as a pair-programming and reasoning assistant, while keeping ownership of:

- Architecture and tradeoff decisions
- Scope prioritization inside the time constraint
- Reviewing generated code and documentation before accepting it
- Adapting suggestions to the specific requirements of the challenge

### Why This Matters

I see effective AI usage as part of modern senior engineering work: using the tool to move faster on low-leverage tasks, preserve more time for product and system thinking, and maintain momentum without compromising accountability.

## AI Collaboration Log

This section will be updated continuously as the project evolves.

### 2026-03-31

- Used AI to analyze the challenge brief and translate it into an initial execution approach.
- Used AI to inspect the current workspace and identify the starting state of the frontend and backend.
- Used AI to evaluate whether the challenge required a specific database and confirm that PostgreSQL was a reasonable engineering choice.
- Used AI to outline the backend bootstrap path for Django REST Framework plus PostgreSQL.
- Used AI to draft this README as a living project artifact, including a transparent explanation of how AI is being used during development.
- Used AI to design a JWT-based authentication setup for Django REST Framework without breaking Django session authentication.
- Used AI to introduce a custom user model with email-based login, name, and audit fields such as `created_at`.
- Used AI to verify the authentication flow with tests covering JWT login, authenticated user retrieval, and Django session compatibility.
- Used AI to identify and resolve a local migration-history mismatch caused by introducing a custom user model after an earlier database bootstrap.
- Used AI to design and document the notes API around a single `ModelViewSet`, including route behavior and per-user access rules.

## Current Status

Work in progress.

What is already in place:

- A Next.js frontend scaffold exists in `notes-taking-frontend`
- A Django backend scaffold exists in `notes-taking-backend`
- Django REST Framework, CORS support, environment-based settings, and PostgreSQL configuration have been introduced in the backend
- JWT authentication and a custom email-based user model have been added to the backend foundation
- Authentication endpoints for register, token, token refresh, and current user are now in place
- Notes CRUD endpoints are now in place under `/api/notes/`
- A Docker Compose file exists to run PostgreSQL locally

## Running The Project

Before running either project, copy the example environment file to a real `.env` file in each project directory.

On macOS / Linux:

```bash
# Backend
cd notes-taking-backend
cp .env.example .env

# Frontend
cd ../notes-taking-frontend
cp .env.example .env
```

On Windows (PowerShell):

```powershell
# Backend
cd notes-taking-backend
Copy-Item .env.example .env

# Frontend
cd ..\notes-taking-frontend
Copy-Item .env.example .env
```

Backend:

```bash
cd notes-taking-backend
docker compose up -d
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

Create and activate a Python virtual environment for the backend (Python 3.13.3 required):

On macOS / Linux (with `python3.13` available):

```bash
# from the repository root
cd notes-taking-backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows (PowerShell) using Python 3.13:

```powershell
cd notes-taking-backend
py -3.13 -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Verify the active Python version:

```bash
python --version
# should print: Python 3.13.3
```

Run backend authentication tests:

```bash
cd notes-taking-backend
.venv/bin/python manage.py test accounts
```

Frontend:

```bash
cd notes-taking-frontend
yarn dev
```

## Authentication Summary

The backend currently uses:

- JWT for API authentication
- Django session authentication preserved for compatibility and admin workflows
- Email + password as the login credentials
- A custom user model with `email`, `name`, `created_at`, and `updated_at`

Detailed route documentation is intentionally kept at the end of this README so
the earlier sections can prioritize project context, technical decisions, and
AI usage.

## Demo Video

To be recorded.

The final submission will include a short walkthrough in English covering:

- Product flow
- Architecture overview
- Key tradeoffs and implementation choices
- How AI was used during development

## Next Steps

The next implementation milestones are:

- Finalize authentication integration from frontend to backend
- Implement the frontend screens based on the video and Figma references
- Connect the frontend to the backend
- Add test coverage and polish the final developer experience

## API Routes

Base API groups currently exposed by the backend:

- `/api/auth/` for authentication
- `/api/notes/` for note management
- `/api-auth/` for Django REST Framework's browsable API login helpers during development

### Authentication Routes

#### `POST /api/auth/register/`

Creates a new user and returns both the serialized user object and JWT tokens.

Expected request body:

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "StrongPassword123!"
}
```

Behavior:

- Creates a user with email-based authentication
- Returns `user`, `access`, and `refresh` tokens in the response payload

#### `POST /api/auth/token/`

Authenticates an existing user with email and password and returns a new JWT pair.

Expected request body:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

Behavior:

- Uses email instead of username for login
- Returns `access`, `refresh`, and the authenticated `user`

#### `POST /api/auth/token/refresh/`

Generates a new access token from a valid refresh token.

Expected request body:

```json
{
  "refresh": "<refresh-token>"
}
```

#### `GET /api/auth/me/`

Returns the currently authenticated user.

Behavior:

- Requires authentication
- Accepts JWT authentication
- Also accepts Django session authentication for compatibility and admin ergonomics

### Notes Routes

Notes are managed through a single Django REST Framework `ModelViewSet`, which means the backend exposes the standard CRUD actions for one resource.

Each note currently has:

- `title`
- `content`
- `category`
- `user`
- `created_at`
- `last_edited_at`

Allowed note categories:

- `Random Thoughts`
- `School`
- `Personal`

Important ownership rule:

- Every notes endpoint requires authentication
- Each user can only list, read, update, and delete their own notes
- On creation, the backend ignores any incoming `user` value and always binds the note to the authenticated user

#### `GET /api/notes/`

Lists the authenticated user's notes.

Behavior:

- Returns only notes that belong to `request.user`
- Orders notes by most recently edited first

#### `POST /api/notes/`

Creates a new note for the authenticated user.

Expected request body:

```json
{
  "title": "Feature idea",
  "content": "Notes about the next iteration",
  "category": "Random Thoughts"
}
```

Behavior:

- Automatically assigns the note to the authenticated user
- Ignores any client attempt to create a note for another user

#### `GET /api/notes/<id>/`

Returns one note owned by the authenticated user.

Behavior:

- Returns the note only if it belongs to the authenticated user
- Returns `404` when the note does not belong to that user or does not exist

#### `PUT /api/notes/<id>/`

Replaces a note owned by the authenticated user.

Behavior:

- Full update of the note resource
- Cannot be used to transfer ownership
- Returns `404` for notes outside the authenticated user's scope

#### `PATCH /api/notes/<id>/`

Partially updates a note owned by the authenticated user.

Behavior:

- Supports partial edits such as updating only `title`, `content`, or `category`
- Returns `404` for notes outside the authenticated user's scope

#### `DELETE /api/notes/<id>/`

Deletes a note owned by the authenticated user.

Behavior:

- Removes the note only when it belongs to the authenticated user
- Returns `404` for notes outside the authenticated user's scope
