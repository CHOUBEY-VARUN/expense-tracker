# Expense Tracker

A full-stack expense tracking application for managing personal income, expenses, and account balance from a protected dashboard. The project includes user authentication, secure password storage, JWT-based API access, and a React dashboard backed by a PostgreSQL database.

## Live Demo

- Frontend: https://expense-tracker-five-delta-16.vercel.app/
- Backend/API: https://expense-tracker-7aj5.onrender.com

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL / Neon
- Authentication: JWT, bcrypt
- Deployment: Vercel, Render

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected dashboard route and protected transaction API endpoints
- Add income and expense transactions
- View total income, total expenses, and current balance
- View income and expense entries separately
- Full-stack deployment setup for a Vercel frontend and Render backend

## Screenshots

Screenshots are not committed yet. Add images to the `screenshots/` folder and update these paths when available.

![Home page screenshot](screenshots/home.jpeg)
![Dashboard screenshot](screenshots/dashboard.jpeg)

## What I Learned

- How to structure a full-stack TypeScript project with separate frontend and backend apps
- How to build authentication with hashed passwords and signed JWTs
- How to protect API routes using authorization headers
- How to connect an Express API to PostgreSQL using the `pg` package
- How to deploy a split frontend/backend application with environment-based API configuration
- How to handle CORS for local development and deployed frontend URLs

## Future Improvements

- Add form validation and user-facing error messages
- Refresh dashboard data immediately after adding a transaction
- Add edit and delete actions for transactions
- Add transaction date selection instead of always using the current date
- Add filtering by category, type, and date range
- Add charts for spending trends and category breakdowns
- Add automated tests for authentication and transaction endpoints

## Local Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL database, or a hosted PostgreSQL database such as Neon

### Clone the Repository

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

### Create Environment Files

Create a `.env` file in the `server/` directory and set the backend environment variables listed below.

Create a `.env` file in the `client/` directory and set the frontend API URL:

```env
VITE_API_URL=http://localhost:3000
```

### Run the Backend

```bash
cd server
npm run dev
```

The API runs on `http://localhost:3000` by default.

### Run the Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Environment Variables

### Client

```env
VITE_API_URL=http://localhost:3000
```

### Server

Use either a hosted database connection string:

```env
PORT=3000
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DB_SSL=true
```

Or individual local PostgreSQL connection values:

```env
PORT=3000
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=replace_with_your_password
DB_SSL=false
```

For multiple deployed frontend origins, the server also supports `CLIENT_URLS` as a comma-separated list.

## Folder Structure

```text
.
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- config/
|   |   |-- pages/
|   |   |-- main.tsx
|   |   `-- index.css
|   `-- package.json
|-- server/
|   |-- src/
|   |   |-- db.ts
|   |   `-- index.ts
|   `-- package.json
`-- README.md
```

## API Overview

- `POST /api/register` - create a new user and return a JWT
- `POST /api/login` - authenticate a user and return a JWT
- `GET /api/transactions` - get the authenticated user's income, expenses, and totals
- `POST /api/transactions` - add an authenticated user's income or expense transaction
- `GET /api/me` - verify the current JWT and return the authenticated user
