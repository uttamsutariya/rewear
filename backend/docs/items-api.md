# Items API Documentation

## Overview

The Items API provides endpoints for managing clothing items in the ReWear platform. Items go through an approval workflow and support advanced filtering, search, and pagination.

## Item Status Workflow

```
PENDING → APPROVED → AVAILABLE → SWAPPED
     ↓
  REJECTED
```

- **PENDING**: Newly created items awaiting admin approval
- **APPROVED**: Admin has approved but status transitions to AVAILABLE
- **AVAILABLE**: Item is visible and can be swapped
- **REJECTED**: Admin rejected the item

- **SWAPPED**: Item has been exchanged (terminal state)

## Image Upload Flow

Before creating an item, images must be uploaded:

```javascript
// 1. Upload images
const formData = new FormData();
formData.append("images", file1);
formData.append("images", file2);

const uploadResponse = await fetch("/api/upload/images", {
	method: "POST",
	headers: {
		Authorization: `Bearer ${token}`,
	},
	body: formData,
});

const { data } = await uploadResponse.json();
// data.urls = ["https://res.cloudinary.com/...", ...]

// 2. Create item with URLs
const itemResponse = await fetch("/api/items", {
	method: "POST",
	headers: {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		title: "Blue Denim Jacket",
		description: "Vintage denim jacket in excellent condition",
		category: "Men",
		type: "Jacket",
		size: "L",
		condition: "Like New",
		tags: ["denim", "vintage", "blue"],
		images: data.urls,
	}),
});
```

## Endpoints

### Get Item Constants

```
GET /api/items/constants
```

Returns available options for categories, types, sizes, and conditions.

**Response:**

```json
{
	"success": true,
	"data": {
		"CATEGORIES": ["Men", "Women", "Kids", "Unisex"],
		"TYPES": ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"],
		"SIZES": ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"],
		"CONDITIONS": ["New", "Like New", "Good", "Fair", "Poor"]
	}
}
```

### List Items

```
GET /api/items
```

List available items with filtering and pagination.

**Query Parameters:**

- `category` - Filter by category
- `type` - Filter by type
- `size` - Filter by size
- `condition` - Filter by condition
- `tags` - Filter by tags (string or array)
- `search` - Search in title, description, and tags
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field: createdAt, updatedAt, title (default: createdAt)
- `sortOrder` - Sort order: asc, desc (default: desc)

**Example:**

```
GET /api/items?category=Women&size=M&search=dress&page=1&limit=20
```

**Response:**

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"title": "Summer Dress",
				"description": "Light summer dress",
				"category": "Women",
				"type": "Dress",
				"size": "M",
				"condition": "Good",
				"tags": ["summer", "floral"],
				"images": ["https://..."],
				"status": "AVAILABLE",
				"createdAt": "2024-01-01T00:00:00Z",
				"user": {
					"id": "uuid",
					"name": "Jane Doe"
				}
			}
		],
		"pagination": {
			"page": 1,
			"limit": 20,
			"total": 45,
			"totalPages": 3
		}
	}
}
```

### Get Featured Items

```
GET /api/items/featured?limit=10
```

Get featured items for the homepage.

### Get User's Items

```
GET /api/items/user/:userId
```

Get items by a specific user. Shows only available items unless you're the owner or an admin.

**Authentication:** Required

### Create Item

```
POST /api/items
```

Create a new item listing.

**Authentication:** Required

**Request Body:**

```json
{
	"title": "Blue Denim Jacket",
	"description": "Vintage denim jacket in excellent condition",
	"category": "Men",
	"type": "Jacket",
	"size": "L",
	"condition": "Like New",
	"tags": ["denim", "vintage", "blue"],
	"images": ["https://res.cloudinary.com/your-cloud/image/upload/..."]
}
```

**Validation Rules:**

- Title: 3-100 characters
- Description: 10-1000 characters
- Tags: 1-10 tags, each 2-20 characters
- Images: 1-5 Cloudinary URLs

**Response:**

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"status": "PENDING"
		// ... all item fields
	},
	"message": "Item created successfully. It will be available after admin approval."
}
```

### Get Item Details

```
GET /api/items/:id
```

Get a single item by ID. Non-available items are only visible to owners and admins.

**Authentication:** Optional (required for non-available items)

### Update Item

```
PUT /api/items/:id
```

Update an item. Only owners and admins can update items.

**Authentication:** Required

**Notes:**

- Cannot update SWAPPED items
- Non-admin updates to APPROVED items reset status to PENDING

### Delete Item

```
DELETE /api/items/:id
```

Delete an item. Only owners and admins can delete items.

**Authentication:** Required

**Restrictions:**

- Cannot delete SWAPPED items
- Cannot delete items with pending swap requests

### Admin: Approve Item

```
POST /api/items/:id/approve
```

Approve a pending item.

**Authentication:** Required (Admin only)

### Admin: Reject Item

```
POST /api/items/:id/reject
```

Reject a pending item.

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
	"reason": "Item description doesn't match images" // optional
}
```

## Error Responses

### Validation Error (400)

```json
{
	"success": false,
	"error": "Validation Error",
	"message": "Invalid request data",
	"details": {
		"errors": [
			{
				"field": "title",
				"message": "Title must be at least 3 characters"
			}
		]
	}
}
```

### Not Found (404)

```json
{
	"success": false,
	"error": "Not Found",
	"message": "Item not found"
}
```

### Forbidden (403)

```json
{
	"success": false,
	"error": "Forbidden",
	"message": "You can only update your own items"
}
```

## Best Practices

1. **Image Upload**: Always upload images before creating/updating items
2. **Filtering**: Use specific filters to reduce response size
3. **Pagination**: Use pagination for large result sets
4. **Search**: Use the search parameter for text-based queries
5. **Error Handling**: Check for validation errors and handle appropriately
