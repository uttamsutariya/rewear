# Admin API Documentation

## Overview

The admin API provides simple oversight and moderation capabilities for the ReWear platform. All admin endpoints require authentication and admin role (`isAdmin: true`).

## Authentication

All requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

The user associated with the token must have `isAdmin: true`.

## Endpoints

### Platform Statistics

```
GET /api/admin/stats
```

Get a lightweight overview of platform statistics.

**Response:**

```json
{
	"success": true,
	"data": {
		"users": {
			"total": 156
		},
		"items": {
			"total": 423,
			"pending": 12,
			"approved": 380,
			"rejected": 5,
			"available": 350,
			"swapped": 26
		}
	}
}
```

### Pending Items

```
GET /api/admin/items/pending
```

Get all items awaiting admin approval, sorted oldest first.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)

**Response:**

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"title": "Vintage Denim Jacket",
				"description": "...",
				"category": "Outerwear",
				"status": "PENDING",
				"createdAt": "2024-01-20T10:30:00Z",
				"user": {
					"id": "user-uuid",
					"email": "user@example.com",
					"name": "John Doe"
				},
				"_count": {
					"swapRequests": 0
				}
			}
		],
		"pagination": {
			"page": 1,
			"limit": 20,
			"total": 12,
			"pages": 1
		}
	}
}
```

### All Items (Admin View)

```
GET /api/admin/items
```

Get all items with filters and admin-specific data.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, AVAILABLE, SWAPPED)
- `userId` (optional): Filter by user ID
- `search` (optional): Search in title and description

**Response:** Same structure as pending items endpoint.

## Admin Actions on Items

These endpoints are available through the regular items API but accessible to admins:

### Approve Item

```
POST /api/items/:id/approve
```

Approve a pending item.

**Response:**

```json
{
	"success": true,
	"data": {
		/* item object */
	},
	"message": "Item approved successfully"
}
```

### Reject Item

```
POST /api/items/:id/reject
```

Reject a pending item with optional reason.

**Request Body:**

```json
{
	"reason": "Images don't match description" // optional
}
```

### Delete Item

```
DELETE /api/items/:id
```

Delete any item (admin can delete any user's items).

**Note:** Cannot delete items that are SWAPPED or have pending swap requests.

### View All Items

```
GET /api/items/all
```

View all items including pending and rejected ones (regular users only see available items).

## Error Responses

### Unauthorized (401)

```json
{
	"success": false,
	"error": "Unauthorized",
	"message": "Authentication required"
}
```

### Forbidden (403)

```json
{
	"success": false,
	"error": "Forbidden",
	"message": "Admin access required"
}
```

## Admin Workflow

1. **Monitor Pending Items**
   - Check `/api/admin/items/pending` regularly
   - Review items in FIFO order (oldest first)

2. **Moderate Items**
   - Approve items that meet guidelines
   - Reject items with clear reason if they violate policies
   - Delete items that are spam or severely inappropriate

3. **Platform Oversight**
   - Check `/api/admin/stats` for platform health
   - Monitor growth trends
   - Identify any unusual patterns

## Best Practices

1. **Timely Moderation**: Process pending items promptly to maintain user engagement
2. **Clear Communication**: Always provide reasons when rejecting items
3. **Consistent Standards**: Apply moderation guidelines uniformly
4. **Regular Monitoring**: Check stats regularly to understand platform trends
