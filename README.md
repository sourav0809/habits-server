# Node.js TypeScript Starter Kit (MongoDB)

A production-ready Node.js backend with TypeScript, MongoDB (Mongoose), JWT auth, and a clear layered structure.

## Features

- **TypeScript** – Full TypeScript support
- **Express.js** – Web framework
- **MongoDB + Mongoose** – NoSQL database with schema validation and indexes
- **Authentication** – JWT-based auth with bcrypt
- **Security** – Helmet, CORS, compression
- **Logging** – Winston

## Prerequisites

- Node.js v20+
- MongoDB (local or Atlas)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp example.env .env
# Edit .env: set DATABASE_URL (e.g. mongodb://localhost:27017/habits)

# Start dev server
npm run dev
```

- Health: `http://localhost:3000/health`
- Auth API: `http://localhost:3000/api/v1/auth` (POST /register, POST /login)

## Scripts

- `npm run dev` – Dev server with hot reload
- `npm run build` – Build for production
- `npm start` – Run production build
- `npm run lint` – Run ESLint

## Environment Variables

| Variable       | Description                    |
|----------------|--------------------------------|
| PORT           | Server port (default 3000)     |
| DATABASE_URL   | MongoDB connection string     |
| JWT_SECRET     | Secret for signing JWTs       |
| JWT_EXPIRES_IN | JWT expiry (e.g. 7d)          |
| SERVER_ENV     | development \| test \| production |

## Project Structure

```
src/
  config/       – env, logger, mongoose connection
  constant/     – enums, messages
  controller/   – HTTP handlers
  middlewares/  – express middlewares
  models/       – Mongoose schemas (User, etc.)
  routes/       – route definitions
  service/      – business logic
  types/        – TypeScript types
  utils/        – helpers, catchAsync, response, etc.
  validations/  – Joi schemas
```

## License

ISC
# habits-server
