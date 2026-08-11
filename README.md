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

## Requirements

- Node.js
- npm
- Expense Tracker backend API

## Backend Repository

https://github.com/mbhandari929/expense-tracker-api-new

## Local Setup

### 1. Install dependencies

npm install

### 2. Create `.env.local`

PowerShell:

Copy-Item .env.example .env.local

### 3. Configure API settings

In `.env.local`:

VITE_API_URL=/api

Authentication is handled using JWT.
After login, the frontend sends the access token in the Authorization header.


### 4. Start the backend

Backend URL:

http://localhost:3000

### 5. Start the frontend

npm run dev

Frontend URL:

http://localhost:5173

## Build

npm run build