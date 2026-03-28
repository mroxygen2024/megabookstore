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
  "message": "What is the price of Atomic Habits?",
  "sessionId": "optional-existing-session-id"
}
```

## Folder Structure

```text
oak-&-ink-bookstore/
  client/    # React frontend
  server/    # Express API + RAG services
```

## Contribution

1. Fork the repository.
2. Create a feature branch.
3. Commit with clear messages.
4. Open a pull request with context and testing notes.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
