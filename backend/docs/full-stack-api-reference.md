# ReWear Platform - Full Stack API Reference & Frontend Implementation Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Original Requirements Mapping](#original-requirements-mapping)
3. [Complete API Reference](#complete-api-reference)
4. [Frontend Implementation Phases](#frontend-implementation-phases)

---

## Project Overview

ReWear is a sustainable fashion platform that enables clothing exchange through:

- **Direct Swaps**: Trade items directly with other users
- **Point-Based System**: Earn points by giving items, spend points to redeem items
- **Community Focus**: Browse, search, and discover pre-loved clothing

### Core Value Proposition

- Reduce textile waste by promoting reuse
- Build a community around sustainable fashion
- Make clothing exchange accessible and rewarding

---

## Original Requirements Mapping

### ✅ User Authentication

- **Implemented**: WorkOS AuthKit integration with JWT tokens
- **APIs**: `/api/auth/me`, `/api/auth/logout`, `/api/users/profile`

### ✅ Landing Page Data

- **Implemented**: Featured items, categories, public browsing
- **APIs**: `/api/items/featured`, `/api/items`, `/api/items/constants`

### ✅ User Dashboard

- **Implemented**: Profile, points, items, swaps, comprehensive stats
- **APIs**: `/api/dashboard`, `/api/users/profile`, `/api/swaps/history`

### ✅ Item Detail Page

- **Implemented**: Full item data, user info, swap/redeem actions
- **APIs**: `/api/items/:id`, `/api/swaps/requests`, `/api/swaps/redeem`

### ✅ Add New Item

- **Implemented**: Image upload, item creation with all fields
- **APIs**: `/api/upload/images`, `/api/items`

### ✅ Admin Role

- **Implemented**: Moderation, approval/rejection, admin panel
- **APIs**: `/api/admin/*`, item approval/rejection endpoints

---

## Complete API Reference

### 1. Authentication APIs

#### **GET /api/auth/me**

**Purpose**: Verify authentication and get current user
**Authentication**: Required (Bearer token)

**Response**:

```json
{
	"success": true,
	"data": {
		"user": {
			"id": "uuid",
			"email": "user@example.com",
			"name": "John Doe",
			"points": 150,
			"isAdmin": false
		}
	}
}
```

**Frontend Use**: Check if user is logged in, display user info in header

#### **POST /api/auth/logout**

**Purpose**: Clear authentication (client-side operation)
**Authentication**: Optional

**Response**:

```json
{
	"success": true,
	"message": "Logged out successfully"
}
```

**Frontend Use**: Logout functionality, clear stored tokens

---

### 2. User APIs

#### **GET /api/users/profile**

**Purpose**: Get detailed profile of authenticated user
**Authentication**: Required

**Response**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"email": "user@example.com",
		"name": "John Doe",
		"points": 150,
		"isAdmin": false,
		"createdAt": "2024-01-01T00:00:00Z",
		"stats": {
			"itemsListed": 12,
			"swapsInitiated": 5,
			"swapsReceived": 8
		}
	}
}
```

**Frontend Use**: User profile page, account settings

#### **GET /api/users/:id**

**Purpose**: Get public profile of any user
**Authentication**: Optional

**Response**:

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"name": "John Doe",
		"createdAt": "2024-01-01T00:00:00Z"
	}
}
```

**Frontend Use**: View other users' profiles from item listings

---

### 3. Upload APIs

#### **POST /api/upload/images**

**Purpose**: Upload multiple images to Cloudinary
**Authentication**: Required
**Content-Type**: multipart/form-data

**Request**:

```
FormData with:
- images: File[] (max 5 files, 10MB each)
```

**Response**:

```json
{
	"success": true,
	"data": {
		"urls": ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."],
		"count": 2,
		"message": "Successfully uploaded 2 image(s)"
	}
}
```

**Frontend Use**: Item creation/editing forms, drag-and-drop upload

---

### 4. Item APIs

#### **GET /api/items/constants**

**Purpose**: Get all available categories, types, sizes, conditions
**Authentication**: None

**Response**:

```json
{
	"success": true,
	"data": {
		"categories": ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"],
		"types": {
			"Tops": ["T-Shirt", "Shirt", "Blouse", "Sweater", "Hoodie"]
			// ... more types by category
		},
		"sizes": ["XS", "S", "M", "L", "XL", "XXL"],
		"conditions": ["New", "Like New", "Good", "Fair", "Poor"]
	}
}
```

**Frontend Use**: Dropdown options in forms and filters

#### **GET /api/items/featured**

**Purpose**: Get featured items for homepage
**Authentication**: None

**Response**:

```json
{
	"success": true,
	"data": [
		{
			"id": "uuid",
			"title": "Vintage Denim Jacket",
			"images": ["url1", "url2"],
			"size": "M",
			"user": {
				"id": "uuid",
				"name": "Jane Doe"
			}
		}
	]
}
```

**Frontend Use**: Homepage featured carousel

#### **GET /api/items**

**Purpose**: Browse available items with filters
**Authentication**: Optional

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `category`: Filter by category
- `type`: Filter by type
- `size`: Filter by size
- `condition`: Filter by condition
- `search`: Search in title/description
- `sortBy`: Sort field (createdAt, title)
- `sortOrder`: asc or desc

**Response**:

```json
{
	"success": true,
	"data": {
		"items": [
			{
				"id": "uuid",
				"title": "Designer Handbag",
				"description": "Barely used...",
				"category": "Accessories",
				"type": "Handbag",
				"size": "One Size",
				"condition": "Like New",
				"tags": ["designer", "leather"],
				"images": ["url1", "url2"],
				"status": "AVAILABLE",
				"createdAt": "2024-01-15T10:00:00Z",
				"user": {
					"id": "uuid",
					"name": "Sarah Smith"
				}
			}
		],
		"pagination": {
			"page": 1,
			"limit": 20,
			"total": 145,
			"pages": 8
		}
	}
}
```

**Frontend Use**: Browse/search page with filters and pagination

#### **POST /api/items**

**Purpose**: Create new item listing
**Authentication**: Required

**Request Body**:

```json
{
	"title": "Vintage Leather Boots",
	"description": "Classic style, great condition",
	"category": "Shoes",
	"type": "Boots",
	"size": "9",
	"condition": "Good",
	"tags": ["vintage", "leather"],
	"images": ["https://cloudinary.url1", "https://cloudinary.url2"]
}
```

**Response**:

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

**Frontend Use**: Add new item form

#### **GET /api/items/:id**

**Purpose**: Get detailed item information
**Authentication**: Optional (required for non-available items)

**Response**: Full item object with all fields
**Frontend Use**: Item detail page

#### **PUT /api/items/:id**

**Purpose**: Update item (owner only)
**Authentication**: Required
**Frontend Use**: Edit item form

#### **DELETE /api/items/:id**

**Purpose**: Delete item (owner or admin)
**Authentication**: Required
**Frontend Use**: Delete button on user's items

---

### 5. Swap APIs

#### **POST /api/swaps/requests**

**Purpose**: Create direct swap request
**Authentication**: Required

**Request Body**:

```json
{
	"itemId": "uuid-of-desired-item",
	"offeredItemId": "uuid-of-your-item"
}
```

**Response**:

```json
{
	"success": true,
	"data": {
		"id": "request-uuid",
		"status": "PENDING"
		// ... full request details
	},
	"message": "Swap request created successfully"
}
```

**Frontend Use**: "Request Swap" button on item detail page

#### **POST /api/swaps/redeem**

**Purpose**: Redeem item using points
**Authentication**: Required

**Request Body**:

```json
{
	"itemId": "uuid-of-desired-item"
}
```

**Frontend Use**: "Redeem with Points" button on item detail page

#### **GET /api/swaps/requests**

**Purpose**: List swap requests (sent and received)
**Authentication**: Required

**Query Parameters**:

- `type`: "sent" or "received"
- `status`: "pending", "accepted", "rejected", "cancelled"

**Frontend Use**: Swap requests management in dashboard

#### **POST /api/swaps/requests/:id/respond**

**Purpose**: Accept or reject swap request
**Authentication**: Required

**Request Body**:

```json
{
	"action": "accept" // or "reject"
}
```

**Frontend Use**: Accept/Reject buttons on received requests

#### **GET /api/swaps/history**

**Purpose**: Get completed swaps history
**Authentication**: Required

**Response**: List of completed swaps with item details
**Frontend Use**: Swap history section in dashboard

---

### 6. Points APIs

#### **GET /api/points/balance**

**Purpose**: Get current points balance
**Authentication**: Required

**Response**:

```json
{
	"success": true,
	"data": {
		"balance": 150
	}
}
```

**Frontend Use**: Display in header and dashboard

#### **GET /api/points/transactions**

**Purpose**: Get points transaction history
**Authentication**: Required

**Response**: List of all point transactions
**Frontend Use**: Points history in user dashboard

#### **GET /api/points/leaderboard**

**Purpose**: Get top users by points
**Authentication**: None

**Response**: Top 10 users with points
**Frontend Use**: Community leaderboard page

#### **GET /api/points/calculate/:itemId**

**Purpose**: Calculate points for an item
**Authentication**: None

**Response**:

```json
{
	"success": true,
	"data": {
		"points": 40,
		"condition": "Like New"
	}
}
```

**Frontend Use**: Show point value on item cards

---

### 7. Dashboard API

#### **GET /api/dashboard**

**Purpose**: Get comprehensive dashboard data
**Authentication**: Required

**Response**:

```json
{
	"success": true,
	"data": {
		"user": {
			/* user object */
		},
		"stats": {
			"totalItems": 12,
			"availableItems": 8,
			"pendingItems": 2,
			"swappedItems": 2,
			"totalSwapsCompleted": 5,
			"pendingSwapRequests": {
				"sent": 1,
				"received": 2
			}
		},
		"recentItems": [
			/* last 5 items */
		],
		"pendingSwapRequests": [
			/* pending requests */
		],
		"recentPointTransactions": [
			/* last 10 transactions */
		],
		"quickActions": {
			"hasItemsToModerate": false,
			"hasPendingRequests": true,
			"canListMoreItems": true
		}
	}
}
```

**Frontend Use**: Main dashboard page with all user data

---

### 8. Admin APIs

#### **GET /api/admin/stats**

**Purpose**: Platform overview for admins
**Authentication**: Required (Admin only)

**Response**:

```json
{
	"success": true,
	"data": {
		"users": { "total": 1250 },
		"items": {
			"total": 3420,
			"pending": 23,
			"approved": 3200,
			"rejected": 45,
			"available": 2950,
			"swapped": 250
		}
	}
}
```

**Frontend Use**: Admin dashboard overview

#### **GET /api/admin/items/pending**

**Purpose**: Get items awaiting approval
**Authentication**: Required (Admin only)

**Response**: Paginated list of pending items
**Frontend Use**: Admin moderation queue

#### **POST /api/items/:id/approve**

**Purpose**: Approve pending item
**Authentication**: Required (Admin only)
**Frontend Use**: Approve button in admin panel

#### **POST /api/items/:id/reject**

**Purpose**: Reject item with reason
**Authentication**: Required (Admin only)
**Frontend Use**: Reject button with reason input

---

## Frontend Implementation Phases

### Phase 1: Foundation & Authentication

#### Components to Build:

1. **App Shell**
   - Router setup (React Router)
   - Layout components (Header, Footer, Container)
   - Theme and styling setup

2. **Authentication Flow**
   - WorkOS AuthKit integration
   - Login/Signup components
   - Auth context/state management
   - Protected route wrapper
   - Token management

3. **Basic Navigation**
   - Public header (logo, browse, login)
   - Authenticated header (user menu, points, notifications)
   - Mobile responsive navigation

#### Key Features:

- User can sign up/login
- Persistent authentication
- Protected routes redirect to login
- User info in header

---

### Phase 2: Public Browse Experience

#### Components to Build:

1. **Landing Page**
   - Hero section with CTAs
   - Featured items carousel
   - How it works section

2. **Browse Items Page**
   - Item grid/list view
   - Filter sidebar (category, size, condition)
   - Search bar
   - Pagination
   - Sort options

3. **Item Card Component**
   - Image carousel preview
   - Title, size, condition badges
   - Points value display
   - User info
   - Quick action buttons

4. **Item Detail Page**
   - Full image gallery
   - Complete description
   - User information with link
   - Swap/Redeem buttons
   - Similar items section

#### Key Features:

- Browse without login
- Search and filter items
- View item details
- See point values

---

### Phase 3: User Dashboard & Profile

#### Components to Build:

1. **Dashboard Layout**
   - Stats overview cards
   - Recent activity feed
   - Quick action buttons

2. **My Items Section**
   - Listed items grid
   - Status badges (pending, available, swapped)
   - Edit/Delete actions
   - Item performance metrics

3. **Swap Management**
   - Sent requests tab
   - Received requests tab
   - Request cards with actions

4. **Points Section**
   - Current balance display
   - Transaction history
   - Points breakdown chart

5. **Profile Settings**
   - Account stats

#### Key Features:

- Complete dashboard overview
- Manage listed items
- Handle swap requests
- Track points

---

### Phase 4: Item Management

#### Components to Build:

1. **Add Item Form**
   - Multi-step wizard
   - Image upload with preview
   - Category cascading selects
   - Tag input
   - Form validation

2. **Edit Item Form**
   - Pre-populated form
   - Image management
   - Status display

3. **Image Upload Component**
   - Preview thumbnails
   - Error handling

#### Key Features:

- List new items
- Upload multiple images
- Edit existing items
- Delete items

---

### Phase 5: Swap & Points System

#### Components to Build:

1. **Swap Request Modal**
   - Select offered item
   - Preview both items
   - Confirm action

2. **Redeem Modal**
   - Points calculation
   - Balance check
   - Confirm redemption

3. **Request Management**
   - Accept/Reject interface
   - Request details view
   - Status tracking

4. **Points Display Components**
   - Balance widget

#### Key Features:

- Create swap requests
- Redeem with points
- Manage requests

---

### Phase 6: Admin Panel

#### Components to Build:

1. **Admin Dashboard**
   - Platform stats cards
   - Pending items list for approval
   - Item preview modal
   - Approve/Reject actions

2. **Admin Route Protection**
   - Admin-only wrapper
   - Role checking

#### Key Features:

- View platform stats
- Moderate pending items
- Manage all items
- Admin-only access

---

## Technical Stack Recommendations

### Core Framework

- **React 18+** with TypeScript
- **Vite** for build tooling
- **React Router v6** for routing

### State Management

- **TanStack Query** for server state
- **Zustand** for client state

### UI Framework

- **Tailwind CSS** for styling
- **ShadCN or **Radix UI\*\* for accessible components

### Forms & Validation

- **React Hook Form** for forms
- **Zod** for validation (matching backend)

### Additional Libraries

- **Axios** for API calls
- **Swiper** or **Embla** for carousels
- **sooner** for toast notifications

---

## Development Best Practices

### API Integration

1. Create typed API client
2. Use interceptors for auth headers
3. Handle errors consistently

### State Management

1. Separate server and client state
2. Use optimistic updates for better UX
3. Cache API responses appropriately
4. Invalidate queries on mutations

### Component Architecture

1. Use composition over inheritance
2. Create reusable UI components
3. Implement proper loading states
4. Handle errors at component level

### Performance

1. Lazy load routes and heavy components
2. Optimize images with proper formats
3. Implement virtual scrolling for long lists
4. Use React.memo for expensive components

---

### API Communication

1. Always send auth token in headers
2. Validate file uploads client-side
