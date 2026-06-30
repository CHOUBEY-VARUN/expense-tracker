# Expense Tracker

[![CI](https://github.com/CHOUBEY-VARUN/expense-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/CHOUBEY-VARUN/expense-tracker/actions/workflows/ci.yml)
[![CodeQL](https://github.com/CHOUBEY-VARUN/expense-tracker/actions/workflows/codeql.yml/badge.svg)](https://github.com/CHOUBEY-VARUN/expense-tracker/actions/workflows/codeql.yml)

A full-stack expense tracking application for managing personal income, expenses, and account balance from a protected dashboard.

The project includes user authentication, secure password hashing, JWT-based API access, protected transaction routes, PostgreSQL persistence, deployment across Vercel and Render, and GitHub Actions workflows for CI and security checks.

## Live Demo

https://github.com/user-attachments/assets/c23ad7e2-e934-4260-a176-2f280f9c5068

* Frontend: https://expense-tracker-five-delta-16.vercel.app/
* Backend health check: https://expense-tracker-7aj5.onrender.com/api/health

## Important Free-Tier Note

The backend is hosted on Render's free tier, so the first API request may take a short time if the server has been inactive.

## Features

* User registration and login.
* Password hashing with bcrypt.
* JWT-based authentication.
* Protected dashboard route.
* Protected transaction API endpoints.
* Add income and expense transactions.
* Edit existing income and expense transactions.
* Delete transactions.
* View total income, total expenses, and current balance.
* View income and expense entries separately.
* PostgreSQL-backed transaction persistence.
* Environment-based frontend/backend configuration.
* Full-stack deployment with Vercel, Render, and Neon/PostgreSQL.
* Backend health check endpoint for deployment verification.

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Frontend       | React, TypeScript, Vite                               |
| Routing        | React Router                                          |
| Backend        | Node.js, Express, TypeScript                          |
| Database       | PostgreSQL / Neon                                     |
| Authentication | JWT, bcrypt                                           |
| Deployment     | Vercel frontend, Render backend                       |
| CI / Quality   | GitHub Actions, CodeQL, Dependency Review, Dependabot |

## Engineering Quality

This repository includes GitHub Actions workflows to keep the project safer and easier to maintain.

* CI workflow validates both frontend and backend changes.
* Frontend checks include dependency installation, linting, TypeScript checking, and production build verification.
* Backend checks include dependency installation, TypeScript checking, and production build verification.
* CodeQL security scanning is configured for JavaScript/TypeScript analysis.
* Dependency Review checks pull requests for vulnerable dependency changes.
* Dependabot is configured for weekly dependency updates across frontend packages, backend packages, and GitHub Actions.
* CI uses `npm ci` for clean, lockfile-based installs.

## Screenshots

| Home Page                           | Dashboard                                |
| ----------------------------------- | ---------------------------------------- |
| ![Home page](screenshots/home.jpeg) | ![Dashboard](screenshots/dashboard.jpeg) |

## Architecture

```txt
Browser
  |
  v
Vercel-hosted React/Vite frontend
  |
  | REST API requests with JWT auth
  v
Render-hosted Express API
  |
  | SQL queries
  v
PostgreSQL / Neon database
```

The frontend stores the JWT after login and sends it with protected API requests. The backend verifies the token, identifies the authenticated user, and only returns or modifies transactions belonging to that user.

## API Overview

| Method   | Endpoint                | Description                                               |
| -------- | ----------------------- | --------------------------------------------------------- |
| `GET`    | `/api/health`           | Check whether the backend API is running                  |
| `POST`   | `/api/register`         | Register a new user and return a JWT                      |
| `POST`   | `/api/login`            | Authenticate a user and return a JWT                      |
| `GET`    | `/api/me`               | Verify the current JWT and return the authenticated user  |
| `GET`    | `/api/transactions`     | Get the authenticated user's income, expenses, and totals |
| `POST`   | `/api/transactions`     | Add an income or expense transaction                      |
| `PUT`    | `/api/transactions/:id` | Update an authenticated user's transaction                |
| `DELETE` | `/api/transactions/:id` | Delete an authenticated user's transaction                |

## Local Setup

### Prerequisites

* Node.js
* npm
* PostgreSQL database, or a hosted PostgreSQL database such as Neon
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/CHOUBEY-VARUN/expense-tracker.git
cd expense-tracker
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Create Environment Files

Create local env files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Update `server/.env` with your database connection details and a strong JWT secret.

### 5. Run the Backend

```bash
cd server
npm run dev
```

The backend runs on:

```txt
http://localhost:3000
```

Health check:

```txt
http://localhost:3000/api/health
```

### 6. Run the Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

## Environment Variables

### Client

`client/.env.example`

```env
VITE_API_URL=http://localhost:3000
```

| Variable       | Purpose                                   |
| -------------- | ----------------------------------------- |
| `VITE_API_URL` | Backend API base URL used by the frontend |

### Server

`server/.env.example`

```env
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

# Optional: comma-separated list of additional allowed frontend origins
CLIENT_URLS=

# Hosted database option, for example Neon or Render PostgreSQL
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DB_SSL=true

# Local PostgreSQL option
# Used only when DATABASE_URL is not set
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=replace_with_your_password
```

Do not commit real `.env` files, production database URLs, or real JWT secrets.

## Local Validation

Before opening a pull request or deploying changes, run the same core checks locally.

### Frontend

```bash
cd client
npm run lint
npm run typecheck
npm run build
```

### Backend

```bash
cd server
npm run lint
npm run typecheck
npm run build
```

The GitHub Actions CI workflow runs these checks automatically for both applications.

## Deployment Overview

* Frontend is deployed on Vercel.
* Backend API is deployed on Render.
* PostgreSQL database can be hosted on Neon or another PostgreSQL provider.
* The frontend uses `VITE_API_URL` to connect to the deployed backend.
* The backend uses `CLIENT_URL` / `CLIENT_URLS` for CORS configuration.
* The backend uses `DATABASE_URL` or local PostgreSQL connection variables for database access.

## Folder Structure

```txt
.
|-- .github/
|   |-- dependabot.yml
|   `-- workflows/
|       |-- ci.yml
|       |-- codeql.yml
|       `-- dependency-review.yml
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- config/
|   |   |-- pages/
|   |   |-- main.tsx
|   |   `-- index.css
|   |-- .env.example
|   `-- package.json
|-- screenshots/
|   |-- home.jpeg
|   `-- dashboard.jpeg
|-- server/
|   |-- src/
|   |   |-- db.ts
|   |   `-- index.ts
|   |-- .env.example
|   `-- package.json
|-- CONTRIBUTING.md
|-- LICENSE
`-- README.md
```

## Testing Strategy

The project currently uses manual product testing plus automated CI validation.

Manual testing covers:

* User registration.
* User login.
* JWT-based protected route access.
* Dashboard loading after authentication.
* Adding income and expense transactions.
* Editing existing transactions.
* Deleting transactions.
* Total income, total expense, and balance updates.
* Deployment smoke testing through the live frontend and backend health endpoint.

Automated product tests are planned as a future improvement. The highest-priority future tests are backend API tests for authentication and transaction endpoints, plus frontend integration tests for the protected dashboard flow.

## Known Limitations

* No automated product test suite yet.
* No dashboard charts or visual spending breakdowns yet.
* No filtering by category, type, or date range yet.
* No custom transaction date selection yet.
* Backend is still mostly centralized in `server/src/index.ts`; future refactoring could split routes, middleware, and utilities.
* Render's free tier can introduce cold-start latency after inactivity.

## Future Improvements

* Add backend API tests for auth and transaction CRUD.
* Add frontend integration tests for login and dashboard behavior.
* Add transaction filtering by category, type, and date range.
* Add transaction date selection.
* Add charts for spending trends and category breakdowns.
* Add pagination or “show more” for larger transaction histories.
* Add rate limiting for authentication endpoints.
* Refactor backend into separate route, middleware, controller, and utility files.

## Resume Bullet

Built and deployed a full-stack expense tracker using React, TypeScript, Express, PostgreSQL, JWT authentication, and bcrypt, supporting protected routes, income/expense CRUD, balance summaries, category-based tracking, deployment across Vercel/Render, and CI validation with GitHub Actions.

## What I Learned / Technical Highlights

* Structured a full-stack TypeScript project with separate frontend and backend applications.
* Built authentication with hashed passwords and signed JWTs.
* Protected API routes using authorization headers and backend token verification.
* Connected an Express API to PostgreSQL using the `pg` package.
* Implemented user-scoped transaction access so users only manage their own data.
* Deployed a split frontend/backend application with environment-based API configuration.
* Handled CORS for local development and deployed frontend URLs.
* Added GitHub Actions CI to validate frontend and backend changes.
* Configured CodeQL, Dependency Review, and Dependabot for security and dependency maintenance.

```
```
