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

## Endpoints

Base URL: `/api/v1`

Users
- `GET /api/v1/users` — Get all users
- `GET /api/v1/users/contacts?search=<term>&newChat=<true|false>` — Get current user contacts. When `newChat=true` performs exact mobile lookup using `search` and returns matched user. Each user object includes `isInYourContact`.
- `GET /api/v1/users/:id` — Get user by ID
- `GET /api/v1/users/mobile/:mobileNumber` — Search user by mobile number

Auth
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login user

Chats
- `GET /api/v1/chats/my-chats` — Get all chats for current user. `lastMessage` includes `updated_at`, `is_deleted`, `deleted_by`, `deleted_at`.
- `POST /api/v1/chats/create` — Create new chat
- `GET /api/v1/chats/:id/messages` — Get messages for a chat. Each message includes `updated_at` and `deleted_at` (nullable).
- `PUT /api/v1/chats/:id/messages/read` — Mark messages as read
- `DELETE /api/v1/chats/:id/clear` — Clear chat messages for current user
- `GET /api/v1/chats/:id/group-details` — Get group chat details
- `POST /api/v1/chats/:id/members` — Add member to group
- `DELETE /api/v1/chats/:id/members/:userId` — Remove member from group
- `DELETE /api/v1/chats/:id/leave` — Leave group chat
- `PUT /api/v1/chats/update-group-info` — Update group chat info
- `GET /api/v1/chats/:groupId/available-members` — Get available members for adding to a group

Socket events (server emits / listens)
- `chat:join` — join a chat room
- `message:send` — client sends a new message
- `message:new` — server emits a newly created message (includes `created_at`, nullable `updated_at`)
- `message:update` / `message:updated` — update flow for messages (server emits `updated_at`)
- `message:delete` / `message:deleted` — delete flow (server emits `deleted_at`, `deleted_by`)
- `typing:start` / `typing:started` and `typing:stop` / `typing:stopped` — typing indicators
- `presence:heartbeat` / `presence:online` / `presence:offline` — presence events

If you'd like, I can expand each endpoint to include request/response examples and required permissions.


