# Authentication Guide

## Overview

ReWear uses WorkOS AuthKit for authentication. The frontend handles the authentication flow using AuthKit, and the backend verifies JWT tokens sent with API requests.

## Authentication Flow

1. **Frontend Authentication (AuthKit)**
   - User logs in via WorkOS AuthKit on the frontend
   - AuthKit returns a JWT token
   - Frontend stores the token (localStorage/cookie)

2. **Backend Verification**
   - Frontend sends JWT token in `Authorization: Bearer <token>` header
   - Backend verifies the token using WorkOS public keys
   - Backend creates/updates user in database on first login
   - User object is attached to the request

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/health` - Health check
- `GET /api/users/:id` - Get public user profile

### Protected Endpoints (Authentication Required)

#### Auth Routes

- `GET /api/auth/me` - Get current authenticated user

#### User Routes

- `GET /api/users/profile` - Get full profile of authenticated user

### Admin-Only Endpoints

Admin endpoints require `isAdmin: true` on the user. These will be implemented in future phases:

- `/api/admin/*` - All admin routes

## Making Authenticated Requests

Include the JWT token in the Authorization header:

```javascript
// Frontend example
const response = await fetch("http://localhost:8080/api/auth/me", {
	headers: {
		Authorization: `Bearer ${jwtToken}`,
		"Content-Type": "application/json",
	},
});
```

## Middleware Usage

### Basic Authentication

```typescript
import { authenticate } from "../middleware/auth.middleware";

// Adds user to request if valid token provided
router.get("/some-route", authenticate, (req, res) => {
	// req.user is available here (or null if not authenticated)
});
```

### Require Authentication

```typescript
import { authenticate, requireAuth } from "../middleware/auth.middleware";

// Returns 401 if no valid token
router.get("/protected-route", authenticate, requireAuth, (req, res) => {
	// req.user is guaranteed to exist here
});
```

### Admin Authorization

```typescript
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/authorize.middleware";

// Returns 403 if not admin
router.get("/admin-route", authenticate, requireAdmin, (req, res) => {
	// Only admins can access this route
});
```

## User Creation & Race Conditions

The authentication middleware handles user creation automatically:

1. Checks if user exists by email
2. If not, creates new user with:
   - Email from JWT
   - Name from JWT (or email prefix as fallback)
   - 0 points
   - `isAdmin: false`
3. Handles race conditions using database unique constraints
4. Updates user name if changed in WorkOS

## Admin Users

Admin users are regular users with `isAdmin: true`. To make a user an admin:

1. Update in database: `UPDATE users SET "isAdmin" = true WHERE email = 'admin@example.com';`
2. Update user role in WorkOS dashboard (for consistency)

## Error Responses

### 401 Unauthorized

- No token provided
- Invalid token
- Expired token

### 403 Forbidden

- Valid token but insufficient permissions
- Not an admin for admin routes
- Not the owner for ownership-protected routes

## Testing Authentication

1. Get a JWT token from your frontend using WorkOS AuthKit
2. Test the `/api/auth/me` endpoint:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/auth/me
```

Expected response:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "user@example.com",
			"name": "John Doe",
			"points": 0,
			"isAdmin": false
		}
	}
}
```
