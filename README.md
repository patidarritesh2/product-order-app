# Product & Order Manager (Angular 18 + Node 22 + MongoDB + MySQL)

| Layer | Tech |
|-------|------|
| Frontend | Angular 18 (standalone components, signals, reactive forms, functional interceptor/guard) |
| Backend | Node.js 22, Express 4 |
| Products | MongoDB (Mongoose) |
| Users & Orders | MySQL 8 (mysql2), passwords hashed with bcrypt, JWT auth |
| 3rd-party API | [Open-Meteo](https://open-meteo.com) weather (no API key), proxied through the backend |

## Prerequisites
- Node.js 22+
- MongoDB and MySQL running locally — or just run `docker compose up -d` in this folder.

## Setup & run

```bash
# 1. databases (optional, if you don't have them installed)
docker compose up -d

# 2. backend
cd backend
cp .env.example .env        # adjust MySQL password / JWT_SECRET if needed
npm install
npm run dev                 # http://localhost:3000  (creates the MySQL DB + tables automatically)

# 3. frontend (new terminal)
cd frontend
npm install
npm start                   # http://localhost:4200  (proxies /api -> localhost:3000)
```

Open http://localhost:4200, register a user, then use Products / Orders / Dashboard.

## Tests
```bash
cd backend  && npm test     
cd frontend && npm test     
```

## API
All routes except `/api/auth/*` and `/api/health` need `Authorization: Bearer <token>`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | `{username, password}` → `{token, user}` (409 if taken) |
| POST | /api/auth/login | `{username, password}` → `{token, user}` |
| GET | /api/auth/me | current user |
| GET/POST | /api/products | list / create `{name, price, description}` |
| GET/PUT/DELETE | /api/products/:id | read / replace / delete |
| POST | /api/orders | create `{productIds: [...]}` → 201 |
| GET | /api/orders | list the caller's orders |
| GET/PUT/DELETE | /api/orders/:id | read / update `{productIds}` / delete (204) |
| GET | /api/weather?lat=&lon= | current weather (default Pune) |

Status codes: 400 validation, 401 auth, 404 not found, 409 duplicate, 502/504 weather upstream.

## Design notes
- **Order.totalAmount is computed server-side** from the product prices in MongoDB (clients can't tamper with it). `productIds` is a JSON column in MySQL and may contain the same id twice (quantity 2).
- Orders are scoped to the logged-in user; another user's order returns 404.
- `userId` is a real foreign key to `users(id)`.
- Passwords: bcrypt (12 rounds), never returned by the API; login uses a generic error message and a constant-time dummy compare for unknown users.
- Product state in Angular lives in `ProductService` (signals); components only read it and call its methods.

## Project structure
```
backend/src   config/ db/ models/ schemas/ middleware/ controllers/ routes/ app.js server.js
backend/tests auth / orders / weather tests
frontend/src/app  core/ (services, interceptor, guard, models)  pages/ (login, register, dashboard, products, orders)
```
