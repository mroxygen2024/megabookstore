# Mega Book Store

[![Tech Stack](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)]() [![Tech Stack](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)]() [![Tech Stack](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)]() [![Tech Stack](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)]() [![Tech Stack](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white)]() [![AI](https://img.shields.io/badge/AI-Gemini_+_RAG-1f6feb)]() [![Realtime](https://img.shields.io/badge/Realtime-SSE-green)]() [![License](https://img.shields.io/badge/License-MIT-blue)]() [![Build](https://img.shields.io/badge/Build-NPM_Scripts-lightgrey)]()

A full-stack bookstore platform with authentication, admin document ingestion, and a Retrieval-Augmented Generation (RAG) assistant for contextual Q&A.

![Mega Book Store Mock UI](client/mega-bookstore-mock.jpg)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Apps](#running-the-apps)
- [Docker Workflow](#docker-workflow)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Folder Structure](#folder-structure)
- [Contribution](#contribution)
- [License](#license)

## Overview

Mega Book Store combines a modern React frontend with an Express + MongoDB backend and a RAG-powered chat flow. Admin users can upload PDF/DOCX content to build a searchable knowledge base, and authenticated users can ask questions that are answered from retrieved context.

## Features

- Authentication with role-based authorization (`admin`, `user`)
- Book catalog browsing and pricing display in ETB
- Admin knowledge-base ingestion pipeline (PDF/DOCX)
- Text extraction, chunking, embedding, and vector retrieval
- RAG chat API with SSE streaming support
- Graceful maintenance response when provider quota/rate limits are hit

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 6
- Tailwind CSS
- Zustand
- React Router

### Backend

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT authentication
- OAuth 2.0 (Google)
- Multer for uploads

### AI / RAG

- Gemini (`@google/genai`) for answer generation
- Voyage AI or Gemini embeddings (configurable)
- MongoDB vector search over chunk embeddings

## Architecture

1. Admin uploads documents via `/api/admin/documents`.
2. Server extracts and cleans text.
3. Text is chunked and embedded.
4. Chunks are stored in `rag_chunks` with metadata.
5. Chat query is embedded and matched using vector search.
6. Retrieved context is passed to Gemini for final response.

## Getting Started

1. Clone the repository.
2. Install dependencies for both apps.
3. Configure environment variables.
4. Start server and client.

## Configuration

Create these files:

- `client/.env`
- `server/.env`

You can start from the included templates:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Example values:

```env
# client/.env
VITE_API_BASE_URL=
```

```env
# server/.env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
GEMINI_API_KEY=<your-gemini-api-key>
VOYAGE_API_KEY=<your-voyage-api-key>
EMBEDDING_PROVIDER=voyage
```

## Running the Apps

```bash
# terminal 1
cd server
npm run dev
```

```bash
# terminal 2
cd client
npm run dev
```

Frontend: `http://localhost:5173`

## Docker Workflow

### Quick Start (Copy/Paste)

Run this from the project root to start everything in development mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

To stop it:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

This repository includes Docker support for both development and production:

- `docker-compose.yml` (shared/base config)
- `docker-compose.dev.yml` (hot-reload development stack)
- `docker-compose.prod.yml` (optimized production stack)

### Docker Prerequisites

1. Docker Engine + Docker Compose plugin installed.
2. External MongoDB connection string configured in `server/.env` (`MONGODB_URI`).

### Start Development Stack (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

The dev stack uses Vite proxying (`/api`, `/uploads`) to the server container.

### Start Production Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

- Frontend (Nginx): `http://localhost`
- Backend (direct): `http://localhost:4000`

Nginx serves the frontend and reverse-proxies `/api` and `/uploads` to the backend service.

### Stop Any Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Run Seed Commands in Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm server npm run seed:books
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm server npm run seed:users
```

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`

### Books

- `GET /api/books`

### Admin

- `POST /api/admin/documents`
- `GET /api/admin/documents`
- `DELETE /api/admin/documents/:id`

### Chat

- `POST /api/chat`
- `GET /api/chat/stream`
- `GET /api/chat/sessions`
- `GET /api/chat/sessions/:id`

## Usage Examples

### Upload a knowledge document (admin)

Use multipart form data with field name `file` to upload PDF or DOCX content.

### Ask a chat question (authenticated user)

Send `POST /api/chat` with:

```json
{

  # Mega Book Store

  [![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)]()
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)]()
  [![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)]()
  [![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)]()
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white)]()
  [![AI](https://img.shields.io/badge/AI-Gemini_+_RAG-1f6feb)]()
  [![Realtime](https://img.shields.io/badge/Realtime-SSE-green)]()
  [![License](https://img.shields.io/badge/License-MIT-blue)]()
  [![Build](https://img.shields.io/badge/Build-NPM_Scripts-lightgrey)]()

  > A modern, production-grade full-stack bookstore platform with authentication, admin document ingestion, and a Retrieval-Augmented Generation (RAG) assistant for contextual Q&A. Built for open source and enterprise teams.

  ---

  ## Table of Contents

  1. [Key Features](#1-key-features)
  2. [Quick Start: Dockerized Setup](#2-quick-start-dockerized-setup)
  3. [Demo / Screenshots](#3-demo--screenshots)
  4. [Tech Stack](#4-tech-stack)
  5. [Architecture Overview](#5-architecture-overview)
  6. [Feature Breakdown](#6-feature-breakdown)
  7. [Folder Structure](#7-folder-structure)
  8. [Environment Variables](#8-environment-variables)
  9. [Manual Installation](#9-manual-installation)
  10. [API Endpoints & Events](#10-api-endpoints--events)
  11. [Future Improvements](#11-future-improvements)
  12. [License & Contact](#12-license--contact)

  ---

  ## 1. Key Features

  - **Authentication**: JWT & Google OAuth, role-based (`admin`, `user`)
  - **Book Catalog**: Browse/search books, pricing in ETB
  - **Admin Knowledge Base**: Upload PDF/DOCX, ingestion pipeline
  - **RAG Chat Assistant**: Contextual Q&A, Gemini LLM, SSE streaming
  - **Vector Search**: MongoDB Atlas vector index, fast retrieval
  - **Secure Uploads**: Multer, file type/size validation
  - **Production-Ready Docker**: Dev & prod stacks, Nginx reverse proxy
  - **Graceful Maintenance**: Handles provider quota/rate limits

  ---

  ## 2. Quick Start: Dockerized Setup

  ### Prerequisites

  - [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
  - External MongoDB Atlas cluster (or compatible URI)
  - Gemini/Voyage API keys (for RAG)

  ### Environment Setup

  1. Copy example env files:
     ```bash
     cp client/.env.example client/.env
     cp server/.env.example server/.env
     ```
  2. Edit `server/.env` and `client/.env` with your secrets and endpoints.

  ### Development Stack

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
  ```
  - Frontend: [http://localhost:5173](http://localhost:5173)
  - Backend: [http://localhost:4000](http://localhost:4000)

  ### Production Stack

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
  ```
  - Frontend (Nginx): [http://localhost](http://localhost)
  - Backend: [http://localhost:4000](http://localhost:4000)

  ### Stopping

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.dev.yml down
  docker compose -f docker-compose.yml -f docker-compose.prod.yml down
  ```

  ### Seeding Data (in Docker)

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm server npm run seed:books
  docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm server npm run seed:users
  ```

  #### Networking, Ports, Security
  - Default ports: 5173 (frontend), 4000 (backend)
  - Nginx reverse proxies `/api` and `/uploads` in production
  - Ensure secrets are never committed; use `.env` files only
  - MongoDB must be accessible from Docker containers

  ---

  ## 3. Demo / Screenshots

  <!-- Add screenshots or demo GIFs here -->
  ![Bookstore UI](client/mega-bookstore-mock.jpg)

  ---

  ## 4. Tech Stack

  **Frontend:**
  - React 19, TypeScript, Vite 6, Tailwind CSS, Zustand, React Router

  **Backend:**
  - Node.js (ESM), Express 5, MongoDB + Mongoose, JWT, OAuth 2.0 (Google), Multer

  **AI / RAG:**
  - Gemini (`@google/genai`), Voyage AI (embeddings), MongoDB Atlas Vector Search

  **DevOps:**
  - Docker, Docker Compose, Nginx (prod)

  ---

  ## 5. Architecture Overview

  ```mermaid
  flowchart TD
      A[Admin Uploads Document] --> B[Text Extraction & Cleaning]
      B --> C[Chunking & Embedding]
      C --> D[Store Chunks in MongoDB]
      E[User Sends Chat Query] --> F[Embed Query]
      F --> G[Vector Search]
      G --> H[Retrieve Top Chunks]
      H --> I[Gemini LLM Generates Answer]
      I --> J[Stream Response to User]
  ```

  **Auth Flow:**
  - JWT for session, Google OAuth for SSO
  - Role-based access for admin endpoints

  **Frontend/Backend Interaction:**
  - REST API for CRUD, SSE for chat streaming
  - Vite dev proxy in development, Nginx in production

  ---

  ## 6. Feature Breakdown

  ### Authentication
  - JWT login/signup, Google OAuth
  - `/api/auth/signup`, `/api/auth/login`, `/api/auth/google`, `/api/auth/me`

  ### Book Catalog
  - `/api/books` (search, filter, pagination)

  ### Admin Knowledge Base
  - `/api/admin/documents` (upload/list/delete)
  - PDF/DOCX ingestion, chunking, embedding

  ### Chat & RAG
  - `/api/chat` (Q&A), `/api/chat/stream` (SSE)
  - `/api/chat/sessions`, `/api/chat/sessions/:id`
  - Contextual retrieval, Gemini answer generation

  ### Real-Time & Streaming
  - SSE for chat responses

  ---

  ## 7. Folder Structure

  ```text
  oak-&-ink-bookstore/
    client/    # React frontend
      components/
      pages/
      services/
      store/
      ...
    server/    # Express API + RAG
      config/
      middleware/
      models/
      routes/
      scripts/
      services/
      uploads/
      ...
    docker-compose.yml
    docker-compose.dev.yml
    docker-compose.prod.yml
    README.md
    LICENSE
  ```

  ---

  ## 8. Environment Variables

  ### `client/.env.example`
  ```env
  # Set to empty to use Vite/Nginx proxy routes (/api, /uploads)
  VITE_API_BASE_URL=
  # Optional, used by Vite dev proxy inside Docker dev stack
  VITE_DEV_PROXY_TARGET=http://server:4000
  # Optional direct key injection used by existing app config
  GEMINI_API_KEY=
  ```

  ### `server/.env.example`
  ```env
  PORT=4000
  CLIENT_ORIGIN=http://localhost:5173,http://localhost
  MONGODB_URI=<your-mongodb-uri>
  MONGODB_DB_NAME=mega_book_store_chat
  JWT_SECRET=<your-jwt-secret>
  GEMINI_API_KEY=<your-gemini-api-key>
  VOYAGE_API_KEY=<your-voyage-api-key>
  EMBEDDING_PROVIDER=voyage
  VECTOR_INDEX_NAME=chunk_vector_index
  EMBEDDING_DIMENSIONS=1024
  GOOGLE_CLIENT_ID=<your-google-client-id>
  LOG_MEMORY=false
  SEED_ADMIN_EMAIL=admin@megabookstore.com
  SEED_ADMIN_PASSWORD=Admin@12345
  ```

  ---

  ## 9. Manual Installation

  ```bash
  # 1. Clone the repository
  git clone <repo-url>
  cd oak-&-ink-bookstore

  # 2. Install dependencies
  cd server && npm install && cd ../client && npm install

  # 3. Configure environment variables
  cp ../server/.env.example ../server/.env
  cp ../client/.env.example ../client/.env
  # Edit .env files as needed

  # 4. Start development servers
  cd ../server && npm run dev
  # In another terminal:
  cd ../client && npm run dev
  ```

  ---

  ## 10. API Endpoints & Events

  ### Auth
  - `POST /api/auth/signup` — Register new user
  - `POST /api/auth/login` — Login with email/password
  - `POST /api/auth/google` — Google OAuth
  - `GET /api/auth/me` — Get current user

  ### Books
  - `GET /api/books` — List/search books

  ### Admin
  - `POST /api/admin/documents` — Upload document (admin)
  - `GET /api/admin/documents` — List documents
  - `DELETE /api/admin/documents/:id` — Delete document

  ### Chat
  - `POST /api/chat` — Ask question (RAG)
  - `GET /api/chat/stream` — SSE chat stream
  - `GET /api/chat/sessions` — List chat sessions
  - `GET /api/chat/sessions/:id` — Get session details

  ### Events
  - **REST**: Standard JSON request/response
  - **SSE**: Server-Sent Events for streaming chat answers

  ---

  ## 11. Future Improvements

  - User profile management
  - Book purchasing & order history
  - Admin analytics dashboard
  - Multi-language support
  - Enhanced document ingestion (more formats)
  - Rate limiting & abuse prevention
  - CI/CD pipeline & test coverage

  ---

  ## 12. License & Contact

  **License:** MIT — see [LICENSE](LICENSE)

  **Author:** Fuad Sano 
  Contact: [conatacts.fuad@gmail.com]
