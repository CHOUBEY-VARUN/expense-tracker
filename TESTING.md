# Testing Strategy

This document outlines the current manual testing checklist and future automated testing roadmap for the Expense Tracker project.

The project currently uses manual product testing plus automated CI validation through GitHub Actions. Automated product tests are planned as a future improvement.

## Current Testing Coverage

### 1. Authentication

Verify that users can register and log in successfully.

Checklist:

* A new user can register with a username and password.
* Duplicate usernames are handled correctly.
* A registered user can log in with valid credentials.
* Login fails with invalid credentials.
* Passwords are hashed before being stored in the database.
* A valid JWT is returned after successful registration or login.
* The `/api/me` endpoint returns the authenticated user when a valid token is provided.
* Protected endpoints reject requests with missing or invalid tokens.

### 2. Protected Frontend Routes

Verify that unauthenticated users cannot access private app pages.

Checklist:

* A logged-out user cannot access the dashboard.
* A logged-in user can access the dashboard.
* Refreshing the dashboard keeps the user authenticated if a valid token exists.
* Logging out removes the token and redirects the user away from protected pages.

### 3. Transaction CRUD

Verify that authenticated users can manage their own income and expense records.

Checklist:

* A user can add an income transaction.
* A user can add an expense transaction.
* A user can edit an existing transaction.
* A user can delete an existing transaction.
* Empty or invalid transaction fields are handled correctly.
* Amount values are handled as numbers.
* Income and expense transactions are displayed correctly on the dashboard.

### 4. Balance and Totals

Verify that dashboard totals update correctly after transaction changes.

Checklist:

* Total income updates after adding, editing, or deleting income transactions.
* Total expenses update after adding, editing, or deleting expense transactions.
* Balance is calculated correctly as total income minus total expenses.
* Totals update without requiring a manual page refresh after transaction changes.

### 5. User Data Isolation

Verify that users can only access their own transactions.

Checklist:

* User A cannot see User B's transactions.
* User A cannot edit User B's transactions.
* User A cannot delete User B's transactions.
* Backend queries are scoped to the authenticated user's ID.

### 6. API Smoke Testing

Verify core backend endpoints.

Endpoints to test:

| Method   | Endpoint                | Expected Result                                          |
| -------- | ----------------------- | -------------------------------------------------------- |
| `GET`    | `/api/health`           | Returns API health status                                |
| `POST`   | `/api/register`         | Creates a user and returns a JWT                         |
| `POST`   | `/api/login`            | Authenticates a user and returns a JWT                   |
| `GET`    | `/api/me`               | Returns the authenticated user                           |
| `GET`    | `/api/transactions`     | Returns the authenticated user's transactions and totals |
| `POST`   | `/api/transactions`     | Creates a transaction                                    |
| `PUT`    | `/api/transactions/:id` | Updates a transaction                                    |
| `DELETE` | `/api/transactions/:id` | Deletes a transaction                                    |

### 7. Deployment Smoke Testing

Verify the deployed application after each important change.

Checklist:

* Live frontend loads successfully.
* Backend health endpoint returns a successful response.
* Registration works in production.
* Login works in production.
* Dashboard loads after login.
* Transactions can be added in production.
* Transactions can be edited in production.
* Transactions can be deleted in production.
* Totals update correctly in production.
* No CORS errors appear in the browser console.

## CI Validation

GitHub Actions validates both the frontend and backend on pushes and pull requests.

The CI workflow checks:

* Dependency installation with `npm ci`.
* Frontend linting.
* Frontend TypeScript validation.
* Frontend production build.
* Backend TypeScript validation.
* Backend production build.

Additional repository quality workflows include:

* CodeQL security scanning for JavaScript/TypeScript.
* Dependency Review for pull requests.
* Dependabot weekly dependency update checks.

## Future Automated Testing Roadmap

### Backend API Tests

Recommended tools:

* Jest or Vitest
* Supertest
* Test PostgreSQL database or isolated test database

High-priority backend tests:

* Register user.
* Reject duplicate username.
* Login with valid credentials.
* Reject login with invalid credentials.
* Reject protected routes without token.
* Add income transaction.
* Add expense transaction.
* Update transaction.
* Delete transaction.
* Prevent users from accessing another user's transactions.

### Frontend Tests

Recommended tools:

* Vitest
* React Testing Library

High-priority frontend tests:

* Login form renders correctly.
* Register form renders correctly.
* Dashboard requires authentication.
* Dashboard displays income, expenses, and balance.
* Transaction form handles user input.
* Transaction list updates after adding or deleting a transaction.

### End-to-End Tests

Recommended tool:

* Playwright

High-priority E2E flows:

* User registers, logs in, and reaches the dashboard.
* User adds an income transaction.
* User adds an expense transaction.
* User edits a transaction.
* User deletes a transaction.
* Dashboard totals update correctly after each operation.

## Current Status

Manual testing and CI validation are currently in place.

Automated product tests are planned as a future improvement.
