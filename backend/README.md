# ReWear Backend API

Backend API for the ReWear community clothing exchange platform.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: WorkOS (JWT verification)
- **Validation**: Zod
- **Image Storage**: Cloudinary (URLs only, uploads handled client-side)

## Phase 1 Setup Complete ✅

This phase includes:

- Express server with TypeScript configuration
- Complete Prisma schema for all entities
- Error handling utilities
- Response helpers
- Environment configuration
- Basic health check endpoint

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on the required variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rewear_db

# WorkOS Authentication
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=http://localhost:5173/auth/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary (optional - for reference)
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Start the development server:

```bash
npm run dev
```

## Database Schema

The database includes the following models:

- **User**: Stores user information (no passwords, using WorkOS)
- **Item**: Clothing items with status workflow
- **SwapRequest**: Requests for item exchanges
- **Swap**: Completed exchanges
- **PointTransaction**: Point earning/redemption history

## API Structure (To be implemented)

- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/items` - Item CRUD operations
- `/api/swaps` - Swap requests and management
- `/api/points` - Points transactions
- `/api/admin` - Admin operations
- `/api/dashboard` - User dashboard data

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
