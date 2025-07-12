# Swaps & Points API Documentation

## Overview

The Swaps API manages item exchange requests and the points system in ReWear. Users can either:

1. **Direct Swap**: Exchange one of their items for another user's item
2. **Point Redemption**: Use accumulated points to get an item

## Points System

Points are automatically calculated based on item condition:

- **New**: 50 points
- **Like New**: 40 points
- **Good**: 30 points
- **Fair**: 20 points
- **Poor**: 10 points

### How Points Work

- **Earn Points**: When someone takes your item (via swap or redemption)
- **Spend Points**: When you redeem items without offering one in exchange
- **Balance**: Points never expire and accumulate over time

## Swap Flow

### Direct Swap Flow

```
1. User A sees User B's item
2. User A creates swap request offering one of their items
3. User B receives notification
4. User B accepts/rejects request
5. If accepted:
   - Both items marked as SWAPPED
   - Swap record created
   - Other pending requests cancelled
```

### Point Redemption Flow

```
1. User A sees an item they want
2. User A creates redemption request (no offered item)
3. System checks if User A has enough points
4. Item owner receives notification
5. Owner accepts/rejects request
6. If accepted:
   - Points deducted from User A
   - Points awarded to item owner
   - Item marked as SWAPPED
```

## API Endpoints

### Swap Requests

#### Create Direct Swap Request

```
POST /api/swaps/requests
```

Create a swap request offering one of your items.

**Authentication:** Required

**Request Body:**

```json
{
	"itemId": "uuid", // Item you want
	"offeredItemId": "uuid", // Your item to offer
	"message": "I love this jacket!" // Optional message
}
```

**Response:**

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"requesterId": "uuid",
		"itemId": "uuid",
		"offeredItemId": "uuid",
		"status": "PENDING",
		"createdAt": "2024-01-01T00:00:00Z",
		"item": {
			/* item details */
		},
		"requester": {
			/* user details */
		}
	}
}
```

#### Create Point Redemption

```
POST /api/swaps/redeem
```

Redeem an item using points.

**Authentication:** Required

**Request Body:**

```json
{
	"itemId": "uuid" // Item you want to redeem
}
```

**Validations:**

- Must have enough points
- Cannot redeem own items
- Item must be AVAILABLE

#### List Swap Requests

```
GET /api/swaps/requests?type=all&status=PENDING&page=1&limit=20
```

Get your swap requests.

**Authentication:** Required

**Query Parameters:**

- `type`: "sent", "received", "all" (default: "all")
- `status`: PENDING, ACCEPTED, REJECTED, CANCELLED
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**

```json
{
	"success": true,
	"data": {
		"requests": [
			{
				"id": "uuid",
				"status": "PENDING",
				"isPointRedemption": false,
				"isSent": true,
				"isReceived": false,
				"item": {
					/* item details */
				},
				"requester": {
					/* user details */
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

#### Get Swap Request Details

```
GET /api/swaps/requests/:id
```

Get detailed information about a specific swap request.

**Authentication:** Required (must be involved in the request)

#### Respond to Swap Request

```
POST /api/swaps/requests/:id/respond
```

Accept or reject a swap request for your item.

**Authentication:** Required (must own the requested item)

**Request Body:**

```json
{
	"action": "accept", // or "reject"
	"message": "Sorry, already promised to someone else" // Optional
}
```

**What Happens on Accept:**

- Creates a Swap record
- Updates item(s) status to SWAPPED
- Handles point transactions (if redemption)
- Cancels other pending requests for involved items

#### Cancel Swap Request

```
POST /api/swaps/requests/:id/cancel
```

Cancel your pending swap request.

**Authentication:** Required (must be the requester)

### Swap History

#### Get Swap History

```
GET /api/swaps/history?page=1&limit=20
```

Get your completed swaps.

**Authentication:** Required

**Response includes:**

- Items exchanged
- Users involved
- Whether it was a point redemption
- Your role (initiator/receiver)
- Completion date

### Points Management

#### Get Point Transactions

```
GET /api/points/transactions?type=all&page=1&limit=20
```

Get your point transaction history.

**Authentication:** Required

**Query Parameters:**

- `type`: "earned", "redeemed", "all" (default: "all")
- `page`: Page number
- `limit`: Items per page

**Response:**

```json
{
	"success": true,
	"data": {
		"transactions": [
			{
				"id": "uuid",
				"amount": 30,
				"type": "EARNED",
				"createdAt": "2024-01-01T00:00:00Z",
				"item": {
					"id": "uuid",
					"title": "Blue Shirt",
					"images": ["url"]
				}
			}
		],
		"summary": {
			"totalEarned": 150,
			"totalRedeemed": 80,
			"currentBalance": 70
		},
		"pagination": {
			/* ... */
		}
	}
}
```

#### Get Points Balance

```
GET /api/points/balance
```

Get your current points balance.

**Authentication:** Required

#### Get Points Leaderboard

```
GET /api/points/leaderboard?limit=10
```

Get the top users by points.

**Public endpoint**

**Response:**

```json
{
	"success": true,
	"data": [
		{
			"rank": 1,
			"userId": "uuid",
			"name": "Jane Doe",
			"points": 520,
			"itemsSwapped": 15
		}
	]
}
```

#### Calculate Item Points

```
GET /api/points/calculate/:itemId
```

Calculate how many points an item is worth.

**Public endpoint**

### Dashboard

#### Get Full Dashboard

```
GET /api/dashboard
```

Get comprehensive dashboard data including:

- User profile
- Item statistics by status
- Swap statistics (sent/received/completed)
- Recent activity
- Point summary
- Quick action suggestions

**Authentication:** Required

#### Get Dashboard Summary

```
GET /api/dashboard/summary
```

Get a simplified summary with key metrics.

**Authentication:** Required

## Error Responses

### Insufficient Points (400)

```json
{
	"success": false,
	"error": "Validation Error",
	"message": "Insufficient points. This item requires 30 points."
}
```

### Already Have Pending Request (409)

```json
{
	"success": false,
	"error": "Conflict",
	"message": "You already have a pending request for this item"
}
```

### Item Not Available (400)

```json
{
	"success": false,
	"error": "Validation Error",
	"message": "Item is not available for swapping"
}
```

## Best Practices

1. **Check Points Before Redemption**: Use `/api/points/calculate/:itemId` to check required points
2. **Handle Race Conditions**: Multiple users might request the same item
3. **Provide Context**: Include optional messages in swap requests
4. **Monitor Dashboard**: Check for pending requests regularly
5. **Fair Trading**: Keep items in the condition you describe
