# ReWear API Quick Reference

## Base URL

```
http://localhost:8080/api
```

## Authentication

All authenticated endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

## API Endpoints Summary

### Auth & Users

| Method | Endpoint         | Auth | Description           |
| ------ | ---------------- | ---- | --------------------- |
| GET    | `/auth/me`       | ✅   | Get current user      |
| POST   | `/auth/logout`   | ❌   | Logout (client-side)  |
| GET    | `/users/profile` | ✅   | Get full user profile |
| GET    | `/users/:id`     | ❌   | Get public user info  |

### Upload

| Method | Endpoint         | Auth | Description                               |
| ------ | ---------------- | ---- | ----------------------------------------- |
| POST   | `/upload/images` | ✅   | Upload multiple images (max 5, 10MB each) |

### Items

| Method | Endpoint              | Auth | Description                                 |
| ------ | --------------------- | ---- | ------------------------------------------- |
| GET    | `/items/constants`    | ❌   | Get categories, types, sizes, conditions    |
| GET    | `/items/featured`     | ❌   | Get featured items                          |
| GET    | `/items`              | ❌   | Browse available items (with filters)       |
| GET    | `/items/all`          | 👮   | Get all items including pending (admin)     |
| GET    | `/items/user/:userId` | ❌   | Get user's items                            |
| POST   | `/items`              | ✅   | Create new item                             |
| GET    | `/items/:id`          | ❌\* | Get item details (\*auth for non-available) |
| PUT    | `/items/:id`          | ✅   | Update item (owner/admin)                   |
| DELETE | `/items/:id`          | ✅   | Delete item (owner/admin)                   |
| POST   | `/items/:id/approve`  | 👮   | Approve item (admin)                        |
| POST   | `/items/:id/reject`   | 👮   | Reject item (admin)                         |

### Swaps

| Method | Endpoint                      | Auth | Description           |
| ------ | ----------------------------- | ---- | --------------------- |
| POST   | `/swaps/requests`             | ✅   | Create swap request   |
| POST   | `/swaps/redeem`               | ✅   | Redeem with points    |
| GET    | `/swaps/requests`             | ✅   | List swap requests    |
| GET    | `/swaps/requests/:id`         | ✅   | Get request details   |
| POST   | `/swaps/requests/:id/respond` | ✅   | Accept/reject request |
| POST   | `/swaps/requests/:id/cancel`  | ✅   | Cancel request        |
| GET    | `/swaps/history`              | ✅   | Get swap history      |

### Points

| Method | Endpoint                    | Auth | Description             |
| ------ | --------------------------- | ---- | ----------------------- |
| GET    | `/points/balance`           | ✅   | Get current balance     |
| GET    | `/points/transactions`      | ✅   | Get transaction history |
| GET    | `/points/leaderboard`       | ❌   | Get top users           |
| GET    | `/points/calculate/:itemId` | ❌   | Calculate item points   |

### Dashboard

| Method | Endpoint             | Auth | Description             |
| ------ | -------------------- | ---- | ----------------------- |
| GET    | `/dashboard`         | ✅   | Get full dashboard data |
| GET    | `/dashboard/summary` | ✅   | Get summary metrics     |

### Admin

| Method | Endpoint               | Auth | Description                |
| ------ | ---------------------- | ---- | -------------------------- |
| GET    | `/admin/stats`         | 👮   | Get platform statistics    |
| GET    | `/admin/items/pending` | 👮   | Get pending items          |
| GET    | `/admin/items`         | 👮   | Get all items with filters |

## Legend

- ✅ = Authentication Required
- 👮 = Admin Only
- ❌ = Public Access
- ❌\* = Conditional Auth

## Common Query Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Filtering Items

- `category`: Filter by category
- `type`: Filter by type
- `size`: Filter by size
- `condition`: Filter by condition
- `search`: Search in title/description
- `sortBy`: Sort field (createdAt, title)
- `sortOrder`: asc or desc

### Swap Requests

- `type`: "sent" or "received"
- `status`: "pending", "accepted", "rejected", "cancelled"

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description",
  "details": { ... }  // Optional
}
```

## HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (Delete success)
- `400`: Bad Request (Validation error)
- `401`: Unauthorized (No/invalid token)
- `403`: Forbidden (No permission)
- `404`: Not Found
- `500`: Server Error

## Points System

- **New**: 50 points
- **Like New**: 40 points
- **Good**: 30 points
- **Fair**: 20 points
- **Poor**: 10 points

## Item Status Flow

```
PENDING → APPROVED → AVAILABLE → SWAPPED
     ↓
  REJECTED
```
