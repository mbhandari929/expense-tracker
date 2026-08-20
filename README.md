# Expense Tracker App

A React, TypeScript, and Vite application for managing income and expenses.

## Features

- Add, edit, and delete income and expense transactions
- View monthly income and expense reports
- Manage opening balances
- Set monthly expense limits
- Manage income and expense sources
- Search transactions
- Export data as CSV
- Backup and restore data as JSON
- Dark mode
- Backend API integration
- JWT authentication
- Password change and password reset

## Requirements

- Node.js
- npm
- Expense Tracker backend API

## Backend Repository

https://github.com/mbhandari929/expense-tracker-api-new

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS / Linux:

```bash
cp .env.example .env.local
```

### 3. Configure API settings

In `.env.local`:

```env
VITE_API_URL=/api
```

### 4. Start the backend

Backend URL:

```text
http://localhost:3000
```

### 5. Start the frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Authentication and Security

Authentication is handled using JWT access tokens.

The access token is stored in `sessionStorage` and sent in the `Authorization: Bearer <token>` header for protected API requests.

Because `sessionStorage` is accessible from JavaScript, an XSS vulnerability could expose the access token. User-controlled content should not be rendered as executable HTML or JavaScript.

The backend currently issues access tokens with a lifetime of 1 hour.

When a protected API request returns `401 Unauthorized`, the React-owned authenticated request handler ends the session and returns the application to the login screen without reloading the page.

The change-password form handles its own `401` response so that an incorrect current password is shown as a form error, while an expired or invalid session ends the authenticated session.
### Logout

Logout removes the JWT access token from `sessionStorage` and returns the frontend to the login screen.

The backend currently does not use refresh tokens or a token blacklist. Therefore, a copied access token may remain valid until its 1-hour expiration.

Password changes and password resets invalidate existing access tokens by updating the user's token version on the backend.

### Password Reset

Password reset links use a hash-based client-side route:

```text
/#/reset-password?token=RESET_TOKEN
## Transaction Chart

The transaction chart currently shows all-time transaction totals.

Changing the selected month affects the transaction list and monthly report, but the chart remains an all-time summary.

## Development Note

React StrictMode may cause the initial `/api/income` or `/api/expense` request to appear as `(canceled)` in the browser Network panel during development.

This happens because StrictMode intentionally runs effects again in development and the previous request is aborted.

A subsequent request succeeds normally. This is mainly a development-mode behavior and does not occur in the same way in the production build.

## Build

```bash
npm run build
```