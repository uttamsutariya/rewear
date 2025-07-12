# ReWear Backend API

Backend API for the ReWear community clothing exchange platform.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: WorkOS (JWT verification)
- **Validation**: Zod
- **Image Storage**: Cloudinary (backend-controlled uploads)
- **File Upload**: Multer

## ✅ Phase 1 Setup Complete

This phase includes:

- Express server with TypeScript configuration
- Complete Prisma schema for all entities
- Error handling utilities
- Response helpers
- Environment configuration
- Basic health check endpoint

## ✅ Phase 2 Authentication Complete

This phase includes:

- WorkOS JWT token verification
- Authentication middleware with automatic user creation
- Race condition handling for concurrent user creation
- Authorization middleware for admin and resource ownership
- Protected route examples
- Auth endpoints (`/api/auth/me`, `/api/auth/logout`)
- User endpoints (`/api/users/profile`, `/api/users/:id`)

See [Authentication Guide](./docs/authentication.md) for detailed documentation.

## ✅ Phase 3 Item Management Complete

This phase includes:

- Image upload endpoints with Cloudinary integration
- Complete item CRUD operations
- Item search, filtering, and pagination
- Admin moderation workflow (approve/reject items)
- Zod validation for all inputs
- Category and size management

### Key Features:

- **Controlled Image Uploads**: Images go through backend before Cloudinary
- **Item Status Workflow**: PENDING → APPROVED/REJECTED → AVAILABLE → SWAPPED
- **Advanced Search**: Filter by category, type, size, condition, tags
- **Admin Controls**: Approve/reject items, view all items
- **Owner Controls**: Edit/delete own items (with restrictions)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on the required variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rewear_db

# WorkOS Authentication
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=http://localhost:5173/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_FOLDER=rewear/items

# Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
MAX_FILES=5
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

## API Structure

### Implemented Routes

#### Authentication

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

#### Users

- `GET /api/users/profile` - Get authenticated user's full profile
- `GET /api/users/:id` - Get public user profile

#### Upload

- `POST /api/upload/image` - Upload single image to Cloudinary
- `POST /api/upload/images` - Upload multiple images to Cloudinary

#### Items

- `GET /api/items/constants` - Get categories, types, sizes, conditions
- `GET /api/items/featured` - Get featured items
- `GET /api/items` - List available items (with filters)
- `GET /api/items/all` - List all items (admin only)
- `GET /api/items/user/:userId` - Get user's items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/approve` - Approve item (admin)
- `POST /api/items/:id/reject` - Reject item (admin)

### To Be Implemented

- `/api/swaps` - Swap requests and management
- `/api/points` - Points transactions
- `/api/admin` - Admin dashboard data
- `/api/dashboard` - User dashboard data

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Upload Flow

1. Frontend sends images to `/api/upload/images`
2. Backend validates file types and sizes
3. Backend uploads to Cloudinary
4. Backend returns Cloudinary URLs
5. Frontend uses URLs when creating item

## Item Workflow

1. User creates item → Status: PENDING
2. Admin approves → Status: AVAILABLE
3. Item gets swapped → Status: SWAPPED

Items can only be edited/deleted when not SWAPPED.

## Next Steps

Phase 4 will implement:

- Swap request system
- Direct item-to-item swaps
- Point-based redemptions
- Swap history tracking
