# ChatFlow 💬

### Real-Time Chat & Messaging Platform

> Connect Instantly. Flow Naturally.

ChatFlow is a production-grade real-time chat application built with **Node.js, Express, Socket.io, Redis, PostgreSQL, and React**.
It supports 1v1 messaging, group chats, typing indicators, seen receipts, online presence, and scalable real-time communication.

---

# ✨ Features

* 🔐 JWT Authentication
* 👤 User Profiles Management
* 💬 1v1 & Group Conversations
* ⚡ Real-Time Messaging using Socket.io
* ✅ Delivered & Seen Receipts
* 🟢 Online / Offline Presence
* ⌨️ Typing Indicators
* 🔍 Search Users & Messages
* ✏️ Edit / Delete Messages
* 📦 Dockerized Setup
* ☁️ AWS Ready Deployment
* 📄 Swagger API Documentation

---

# 🏗️ Tech Stack

## Backend

* Node.js
* Express.js
* Socket.io
* PostgreSQL
* Sequelize ORM
* Redis
* JWT Authentication
* Nodemailer
* Joi Validation

## Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Axios
* Socket.io Client

## DevOps

* Docker
* Docker Compose

---

# 📁 Project Structure

```bash
chatflow/
│
├── chatflow-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── index.js
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── chatflow-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── router/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── Dockerfile
│   └── index.html
│
├── docker-compose.yml
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/uday900/chatapp.git
cd chatflow
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
PORT=3000

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chatflow

JWT_SECRET=your_jwt_secret

REDIS_HOST=redis
REDIS_PORT=6379

CLIENT_URL=http://localhost:5173
```

---

# 🐳 Run with Docker

## Start Containers

```bash
docker-compose up --build
```

## Services

| Service     | Port |
| ----------- | ---- |
| Frontend    | 5173 |
| Backend API | 3000 |
| PostgreSQL  | 5432 |
| Redis       | 6379 |

---

# 💻 Local Development

## Backend

```bash
cd chatapp-backend

npm install
npm run dev
```

## Frontend

```bash
cd chatapp-frontend

npm install
npm run dev
```

---

# 🔌 Socket.io Events

## Client → Server

| Event                | Purpose               |
| -------------------- | --------------------- |
| `message:send`       | Send new message      |
| `message:seen`       | Mark messages as seen |
| `message:edit`       | Edit message          |
| `message:delete`     | Delete message        |
| `message:typing`     | Typing indicator      |
| `presence:heartbeat` | Online presence       |

---

## Server → Client

| Event              | Purpose             |
| ------------------ | ------------------- |
| `message:new`      | Receive new message |
| `receipt:seen`     | Seen receipt        |
| `typing:started`   | User typing         |
| `presence:online`  | User online         |
| `presence:offline` | User offline        |

---

# 🧠 Architecture

```txt
React Frontend
      │
      ▼
Express REST API
      │
Socket.io Server
      │
 ┌───────────────┐
 │ Redis PubSub │
 └───────────────┘
      │
PostgreSQL Database
```

---

# 📸 Screenshots

Add your application screenshots here.

```md
![Login](./screenshots/login.png)
![Chat](./screenshots/chat.png)
```

---

# 🔐 Authentication

* JWT Access Token
* Refresh Token Support
* Protected Routes
* Google OAuth (Optional)

---

# 📦 Deployment

Production deployment supports:

* AWS EC2
* AWS RDS
* AWS S3
* NGINX Reverse Proxy
* Docker Containers
* GitHub Actions CI/CD

---

# 🛠️ Future Improvements

* Voice & Video Calling
* Push Notifications
* End-to-End Encryption
* Message Pinning
* AI Chat Assistant
* Mobile App (React Native)

---

# 👨‍💻 Author

### Darla Udaya Kiran

Full Stack Developer
Hyderabad, India

---

# 📄 License

MIT License

---

# ⭐ Support

If you like this project:

* Star the repository
* Fork the project
* Contribute improvements

---

# 🔥 ChatFlow

> Real-Time Communication Engine Built with Modern Web Technologies.
