# 🌸 Flora — Flower Boutique

Full-stack web project built as part of the "Практикум сучасних методологій розробки" course.

## Project Structure

```
flora/
├── index.html          ← Main page
├── css/
│   └── style.css       ← All styles (mobile-first, responsive)
├── js/
│   └── main.js         ← JavaScript (slider, modals, fetch API)
├── images/             ← Project images
└── backend/            ← Node.js + Express + PostgreSQL API
    ├── server.js
    ├── app.js
    ├── .env.example
    ├── db/
    │   ├── db.js       ← PostgreSQL connection pool
    │   └── init.js     ← DB schema + seed script
    ├── routes/
    │   ├── bouquets.js
    │   └── orders.js
    ├── controllers/
    │   ├── bouquetsController.js
    │   └── ordersController.js
    └── middlewares/
        └── errorHandler.js
```

## Frontend

Open `index.html` in a browser or use Live Server (VS Code extension).

**Features:**
- Responsive design: Mobile / Tablet / Desktop
- Sticky header with smooth scroll navigation
- Bestsellers slider with autoplay + touch swipe
- Bouquets grid with "Show More" pagination
- Product Details modal
- Order modal with form validation
- Toast notifications
- Scroll reveal animations

## Backend

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Initialize database (creates tables & seeds data)
npm run db:init

# 4. Start the server
npm run dev
```

### API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/bouquets | Get bouquets (pagination + filters) |
| GET | /api/bouquets/:id | Get single bouquet |
| POST | /api/bouquets | Create bouquet |
| PUT | /api/bouquets/:id | Update bouquet |
| DELETE | /api/bouquets/:id | Delete bouquet |
| POST | /api/orders | Place order |
| GET | /api/orders | List all orders |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/health | Health check |

### Swagger Documentation

After starting the server, open:  
**http://localhost:3001/api-docs**

### Query Parameters for GET /api/bouquets

| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 8) |
| search | string | Search by name or description |
| category | string | Filter by category |
| bestseller | boolean | Filter bestsellers only |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |

**Example:**
```
GET /api/bouquets?page=1&limit=8&search=rose&minPrice=30&maxPrice=60
```

## Tech Stack

**Frontend:** HTML5 · CSS3 · Vanilla JS  
**Backend:** Node.js · Express · PostgreSQL · Swagger  
**Tools:** modern-normalize · Google Fonts (Playfair Display, Inter)
