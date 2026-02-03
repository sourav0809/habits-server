# Habits – Your Habits Tracker

A full-stack habits and wellness tracker to log food, water, and daily goals. Track calories, hydration, set targets, and view analytics over time—all in one place.

---

## 1. Deployed Links

|                 | URL                                       |
| --------------- | ----------------------------------------- |
| **Frontend**    | https://habits.itssourav.online/dashboard |
| **Backend API** | https://api-habit.itssourav.online/api    |

### GitHub

- **Frontend:** [habits-client](https://github.com/sourav0809/habits-client)
- **Backend:** [habits-server](https://github.com/sourav0809/habits-server)

---

## 2. Tech Stack

| Layer          | Technologies                                                  |
| -------------- | ------------------------------------------------------------- |
| **Frontend**   | React, Vite, TypeScript, Tailwind CSS, React Query, shadcn/ui |
| **Backend**    | Express, TypeScript, MongoDB, Mongoose                        |
| **Deployment** | Vercel (frontend), AWS EC2 (backend), GitHub CI/CD            |

---

## 3. Startup Instructions

**Prerequisites:** Node.js v20+, MongoDB (local or Atlas)

```bash
# Clone the repo
git clone https://github.com/sourav0809/habits-server.git
cd habits-server

# Install dependencies
npm install

# Copy env from example and fill in your values
cp example.env .env
# Edit .env: set DATABASE_URL, JWT_SECRET, etc.

# Run the development server
npm run dev
```

- **Health check:** `http://localhost:3000/health`
- **API base:** `http://localhost:3000/api/v1`

---

## 4. Features

- **Auth** – Email/password register & login, Google OAuth, JWT
- **User foods** – Create and manage custom foods with calories per gram
- **Food consumption** – Log meals with quantity and date; paginated list and daily summary
- **Water consumption** – Log water intake (ml); list, summary, and averages
- **Goals** – Set daily targets for water (ml) and calories
- **Today’s activity** – View today’s total calories and water
- **Analytics** – Calories & water over time, progress by period, goal-achievement trend, hydration insights (streaks, goals met, best day)

---

## License

ISC
