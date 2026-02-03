# Habits – Your Habits Tracker

A full-stack habits and wellness tracker to log food, water, and daily goals. Track calories, hydration, set targets, and view analytics over time—all in one place.

---

## 1. Deployed Links

|                 | URL                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | https://habits.itssourav.online                                                                                 |
| **Backend API** | https://api-habit.itssourav.online/api                                                                          |
| **Demo**        | [Watch demo (Google Drive)](https://drive.google.com/file/d/1BjDh4y4BlDRMaq9ne2pgAlpMsM2pfWYQ/view?usp=sharing) |

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

## 5. Assessment Requirement Mapping

This project fulfills the Frontend Assessment requirements in the following way:

### Authentication

- Email/password login & signup implemented using JWT
- Protected routes with auth guards

### Dashboard

- Food tracking with calorie calculation
- Water intake logging (daily)
- Daily summary for calories and water
- Visual charts for quick insight

### Goals

- User can set daily water and calorie goals
- Progress shown visually on dashboard

### UI/UX

- Responsive design using Tailwind & shadcn/ui
- Loading, error, and empty states handled
- Clear visual hierarchy and feedback

---

## 6. Implementation Notes

While the assessment required a minimal backend, additional endpoints were implemented to demonstrate real-world frontend data consumption and dashboard design.

### Food Dataset Assumption

- The system starts with no predefined foods by default
- Users can create and manage their own food items
- This was a deliberate choice to give users flexibility

### Data Modeling Tradeoff

Instead of a single `DailyLog` document per day, food and water entries are stored as separate collections (`food_consumptions`, `water_consumptions`) and aggregated on read. This improves flexibility for analytics and trends while still supporting daily summaries efficiently.

---

## License

ISC
