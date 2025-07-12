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

See [Items API Documentation](./docs/items-api.md) for detailed documentation.

## ✅ Phase 4 Swap & Points System Complete

This phase includes:

- **Swap Request System**
  - Direct item-to-item swaps
  - Point-based redemptions
  - Accept/reject/cancel requests
  - Swap history tracking
- **Points System**
  - Automatic point calculation based on condition
  - Point transactions tracking
  - Points leaderboard
  - Balance management
- **Dashboard API**
  - Comprehensive user statistics

See [Swaps & Points API Documentation](./docs/swaps-api.md) for detailed documentation.

## ✅ Phase 5 Admin Routes Complete

This phase includes:

- **Admin Dashboard**
  - Platform statistics (users and items counts)
  - Pending items queue for moderation
  - Full items list with filters
- **Item Moderation**
  - Approve/reject pending items
  - Delete any item (admin privilege)
  - View all items regardless of status

See [Admin API Documentation](./docs/admin-api.md) for detailed documentation.

### Key Features:

- **Two Exchange Methods**: Direct swaps or point redemptions
- **Automated Points**: Points calculated by item condition (10-50 points)
- **Transaction Safety**: Database transactions ensure consistency
- **Request Management**: Full lifecycle from creation to completion
- **Rich Dashboard**: All user data aggregated in one endpoint

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

### Complete API Routes

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

#### Swaps

- `POST /api/swaps/requests` - Create swap request
- `POST /api/swaps/redeem` - Create point redemption
- `GET /api/swaps/requests` - List swap requests
- `GET /api/swaps/requests/:id` - Get request details
- `POST /api/swaps/requests/:id/respond` - Accept/reject request
- `POST /api/swaps/requests/:id/cancel` - Cancel request
- `GET /api/swaps/history` - Get swap history

#### Points

- `GET /api/points/transactions` - Get point transactions
- `GET /api/points/balance` - Get current balance
- `GET /api/points/leaderboard` - Get top users
- `GET /api/points/calculate/:itemId` - Calculate item points

#### Dashboard

- `GET /api/dashboard` - Get full dashboard data
- `GET /api/dashboard/summary` - Get summary metrics

#### Admin

- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/items/pending` - Get pending items for moderation
- `GET /api/admin/items` - Get all items with admin filters

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## System Flows

### Item Lifecycle

```
PENDING → APPROVED → AVAILABLE → SWAPPED
     ↓
  REJECTED
```

### Swap Flow

1. User creates swap request (with or without offered item)
2. Item owner receives notification
3. Owner accepts/rejects
4. If accepted:
   - Items marked as SWAPPED
   - Points transferred (if redemption)
   - Swap record created
   - Other requests cancelled

### Points Flow

- Earn: When someone takes your item (+10 to +50 points)
- Spend: When redeeming items (-10 to -50 points)
- Balance: Tracked in user record and transaction history

## Production Deployment

The backend API is feature-complete with all core functionality implemented:

- ✅ Authentication & User Management
- ✅ Item Management & Moderation
- ✅ Swap & Points System
- ✅ Admin Dashboard

For production deployment, consider:

- Setting up proper database backups
- Implementing rate limiting
- Adding monitoring and logging
- Configuring HTTPS
- Setting up CI/CD pipeline

## Testing

Run the test suite:

```bash
npm test
```
