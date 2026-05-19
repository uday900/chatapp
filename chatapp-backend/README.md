# ChatApp Backend

This repository contains the backend API and socket server for ChatApp.

## Quick Start

Prerequisites
- Node.js (>=14)
- PostgreSQL (or configured DB in `src/config/db.js`)
- Redis (optional, for presence/session support)

Install

```bash
npm install
```

Run (development)

```bash
npm run dev
```

Run with Docker Compose

```bash
docker-compose up --build
```

API docs (Swagger)

- After starting the server, open: `http://localhost:3000/api-docs` (or configured `PORT`) to view Swagger UI.

Configuration

- Environment variables live in your environment (or `.env` if you use one).
- Check `src/config/db.js` for DB connection details and `src/config/swagger.js` for Swagger setup.

Important Endpoints & Notes

- Contacts search: `GET /api/v1/users/contacts?search=<term>`
  - New query param: `newChat=true` — when true, the endpoint performs an exact mobile lookup using `search` and returns the matched user (if found).
  - Response includes `isInYourContact` (boolean) for each returned user.

- Chats listing: `GET /api/v1/chats/my-chats`
  - `lastMessage` now includes `updated_at`, `is_deleted`, `deleted_by`, and `deleted_at` (timestamps may be null when not set).

- Chat messages: `GET /api/v1/chats/:id/messages`
  - Each message item includes `updated_at` and `deleted_at` (nullable). `updated_at` is null on message creation and set only when a message is edited.

Socket events

- Socket events and room names are defined in `src/constants/endpoints.js`.
- `message:new` payload includes `created_at` and `updated_at` (nullable).
- `message:deleted` emit includes `is_deleted`, `deleted_by`, and `deleted_at`.

Database / Model notes

- `ChatMessage` model stores `updatedAt` as nullable and `deletedAt` when a message is deleted. This repository uses Sequelize models in `src/models`.

Testing & Verification

- Start the server and exercise create/edit/delete message flows to confirm `updated_at` and `deleted_at` behavior.
- View Swagger UI to verify API docs.

Need help?

If you want I can:
- Run the dev server and validate Swagger UI
- Update the remaining Swagger blocks for all routes
- Add migrations to explicitly update DB schema for `updatedAt`/`deletedAt`

