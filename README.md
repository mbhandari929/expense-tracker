# Expense Tracker App

A React, TypeScript, and Vite application for managing income and expenses.

## Features

- Add, edit, and delete income and expense transactions
- View monthly income and expense reports
- Manage opening and closing balances
- Set a monthly expense limit
- Search transactions
- Export data as CSV
- Backup and import data as JSON
- Dark mode
- Backend API integration

## Requirements

- Node.js
- npm
- Expense Tracker backend API

## Frontend Setup

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Backend Setup

The backend is maintained in a separate NestJS project and is not included in this repository.

Open the backend project and run:

```bash
npm install
npm run start:dev
```

The backend normally runs at:

```text
http://localhost:3000
```

The backend must allow requests from the frontend origin:

```text
http://localhost:5173
```

Example NestJS CORS configuration:

```ts
app.enableCors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});
```

## Running the Application

Start the backend first:

```bash
npm run start:dev
```

Then start the frontend in another terminal:

```bash
npm run dev
```

Both servers must be running for transaction loading, creation, editing, deletion, and JSON import.

## Data Storage

Income and expense transactions are stored in the backend database.

The following settings are stored in browser localStorage:

- Opening balance
- Income source options
- Expense source options

The backend API is the primary data source for transaction data.

## API Endpoints

```text
GET    /income
POST   /income
PATCH  /income/:id
DELETE /income/:id

GET    /expense
POST   /expense
PATCH  /expense/:id
DELETE /expense/:id
```

## Production Build

```bash
npm run build
```