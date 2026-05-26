# ChatApp Frontend

A React + Vite chat application frontend built with:

- React 19
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router DOM
- Socket.IO client
- Axios for API calls

## Requirements

- Node.js 18+ (recommended)
- npm or yarn
- Backend API available for authentication, chat, and socket connections

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (optional):

Create a `.env` or `.env.local` file in the project root if you need to override default endpoints.

Supported variables:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_BUILD_COMMIT=<git-sha>
```

The app defaults to:

- `http://localhost:3000/api/v1` for API requests
- `ws://localhost:3000` for WebSocket connections

## Available scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint across the frontend codebase

## Running locally

```bash
npm run dev
```

Then open the URL shown in the terminal (default: `http://localhost:5173`).

## Project structure

- `src/`
  - `api/` - Axios client configuration
  - `components/` - Reusable UI and modal components
  - `config/` - Environment configuration
  - `pages/` - Top-level route pages
  - `redux/` - Redux store and slices
  - `router/` - App routing and protected routes
  - `socket/` - Socket.IO client setup
  - `utils/` - Helper utilities and constants

## Notes

- The frontend uses `localStorage` for access token storage.
- Backend service health is detected through network errors and response events.
- Chat state is managed in Redux, with separate slices for auth, chat, and user data.

## Useful links

- Vite docs: https://vitejs.dev
- React docs: https://react.dev
- Redux Toolkit docs: https://redux-toolkit.js.org
- Tailwind CSS docs: https://tailwindcss.com
