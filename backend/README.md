# ReWear Backend

Express.js + TypeScript backend API for the ReWear clothing exchange platform.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication
- **Validation**: express-validator
- **File Upload**: Multer
- **Development**: TSX for hot reloading

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── tsconfig.json
```

## Setup Instructions

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/rewear_db?schema=public"

   # Server
   PORT=5000
   NODE_ENV=development

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173

   # File Upload
   MAX_FILE_SIZE=5242880 # 5MB in bytes
   ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations (creates tables)
   npm run prisma:migrate

   # (Optional) Open Prisma Studio to view database
   npm run prisma:studio
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints (Planned)

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/items` - Get user's items
- `GET /api/users/:id/swaps` - Get user's swap history

### Items

- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item (auth required)
- `PUT /api/items/:id` - Update item (owner only)
- `DELETE /api/items/:id` - Delete item (owner/admin)

### Swaps

- `POST /api/swaps` - Create swap request
- `GET /api/swaps` - Get user's swaps
- `PUT /api/swaps/:id/accept` - Accept swap request
- `PUT /api/swaps/:id/reject` - Reject swap request
- `PUT /api/swaps/:id/complete` - Mark swap as completed

### Admin

- `GET /api/admin/items` - Get all items for moderation
- `PUT /api/admin/items/:id/approve` - Approve item
- `PUT /api/admin/items/:id/reject` - Reject item
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user (role, status)

## Database Models

- **User**: Authentication and profile information
- **Item**: Clothing items available for exchange
- **Swap**: Exchange transactions between users

## Development Notes

- The backend uses Prisma ORM for type-safe database access
- JWT tokens are used for authentication
- File uploads are handled with Multer
- Input validation is done using express-validator
- Error handling is centralized through middleware
- All async routes are wrapped with error handling

## Next Steps

1. Implement authentication controllers
2. Create item management endpoints
3. Build swap request system
4. Add file upload functionality
5. Implement admin panel endpoints
6. Add comprehensive validation
7. Write unit and integration tests
