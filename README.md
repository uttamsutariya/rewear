# ReWear - Community Clothing Exchange Platform

A web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. Built for sustainable fashion and reducing textile waste.

## 🎯 Hackathon Project

This project is being developed for a hackathon with the goal of promoting sustainable fashion by encouraging users to reuse wearable garments instead of discarding them.

## 🏗️ Project Structure

This is a monorepo containing both frontend and backend applications:

```
rewear/
├── frontend/         # React + Vite + TypeScript frontend
├── backend/          # Express + TypeScript + Prisma backend
├── package.json      # Root package.json for monorepo
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rewear
   ```

2. **Install dependencies for both frontend and backend**

   ```bash
   npm install
   ```

3. **Set up the backend**

   - Navigate to the backend directory
   - Copy `.env.example` to `.env` and update the values
   - Set up your PostgreSQL database
   - Run database migrations

4. **Start development servers**

   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   ```

   Or run them separately:

   ```bash
   # Backend only
   npm run dev:backend

   # Frontend only
   npm run dev:frontend
   ```

## 📋 Features

### User Features

- **Authentication**: Email/password signup and login
- **User Dashboard**: Profile management, points balance, items overview
- **Item Management**: Upload, browse, and manage clothing items
- **Swap System**: Direct swaps or point-based redemption
- **Search & Filter**: Find items by category, size, condition

### Admin Features

- Moderate and approve/reject item listings
- Remove inappropriate content
- User management

## 🛠️ Tech Stack

### Frontend

- React with Vite
- TypeScript
- Modern UI/UX design

### Backend

- Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication
- RESTful API

## 📝 Development Notes

- The project uses npm workspaces for monorepo management
- Both frontend and backend use TypeScript for type safety
- Hot reloading is enabled in development mode
- API runs on port 5000, frontend on port 5173 by default

## 🤝 Contributing

This is a hackathon project. For contribution guidelines and more information, please refer to the individual README files in the frontend and backend directories.

## 📄 License

This project is created for a hackathon. License details to be determined.

## Team members

- Uttam Sutariya (uttamsutariya.dev@gmail.com)
- Keval Rabadiya (kevalrabadiya27@gmail.com)
- Dhrumil Bhut (dhrumilbhut@gmail.com)
- Radhika Patel (patelradhi1710@gmail.com)
