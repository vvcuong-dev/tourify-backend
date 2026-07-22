🧳 Tourify — Backend API

[🇻🇳 Tiếng Việt](https://github.com/vvcuong-dev/tourify-backend/blob/main/Readme.vi.md)

An online tour booking system that lets customers search and book tours **without needing an account**, while administrators manage all content (tours, categories, orders...) through a JWT-protected area. Built with Node.js 22, NestJS 11, TypeScript, Prisma 7, and MySQL, with ZaloPay payment integration.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database](#️-database)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Key Design Decisions](#-key-design-decisions)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [License](#-license)

## ✨ Features

### Customers (no account required)

- **Browse & search tours** — by category, city/location, price range, departure date
- **View tour and category details** — via SEO-friendly slugs, with breadcrumb and page title
- **List cities/locations** — used to filter tours
- **Client-side cart** — the cart is kept on the frontend (localStorage); the backend only recalculates price and checks stock at checkout time to prevent price mismatches
- **Book a tour (guest checkout)** — enter details (full name, email, phone, note) with no account needed
- **Payment** — Cash, Bank Transfer, or ZaloPay (redirect + callback automatically updates status)
- **Order lookup** — by order code + email

### Administrators (login required)

- **Auth** — register, login, refresh token, logout, change password, change email
- **Profile** — view/update own profile, change avatar (Cloudinary)
- **Admin account management** — CRUD, status updates (ACTIVE/PENDING/INACTIVE/BANNED)
- **Category management** — tree structure (parent/children), image upload, position ordering, bulk enable/disable, soft delete
- **Tour management** — CRUD, avatar + multiple image uploads, schedule management, pricing & stock per passenger type, bulk enable/disable, soft delete
- **Order management** — list, view details, update order status (INITIAL → DONE / CANCEL)

## 🛠️ Tech Stack

| Layer           | Technology                                                            |
| --------------- | --------------------------------------------------------------------- |
| Runtime         | Node.js 22                                                            |
| Language        | TypeScript 5.9                                                        |
| Framework       | NestJS 11 (on top of Express)                                         |
| Database        | MySQL 9 (via Docker)                                                  |
| ORM             | Prisma 7 (`@prisma/adapter-mariadb`)                                  |
| Cache / Session | Redis 8                                                               |
| Auth            | JWT (`@nestjs/jwt`, `passport-jwt`) + bcrypt                          |
| Validation      | class-validator, class-transformer                                    |
| Image upload    | Cloudinary                                                            |
| Payment         | ZaloPay (sandbox)                                                     |
| Docs            | Swagger (`@nestjs/swagger`)                                           |
| Package Mgr     | pnpm                                                                  |
| Testing         | Jest, Supertest _(to be added later — no unit tests in the repo yet)_ |

## 🏗️ Architecture

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                     NestJS App                      │
│                                                     │
│    Controller -> Service -> Repository (Prisma)     │
│    (Admin / *-Client, JwtAuthGuard where needed)    │
│                                                     │
│            Service layer also talks to:             │
│    Redis (cache) - Cloudinary (upload) - ZaloPay    │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────┐   ┌───────────────┐
│   MySQL 9     │   │   Redis 8     │
│   (Docker)    │   │   (Docker)    │
└───────────────┘   └───────────────┘
```

The core business modules (`tour`, `category`, `order`) each have **two separate controllers/services**: one for **admin** (`@Controller('admin/...')` + `@UseGuards(JwtAuthGuard)`, full CRUD) and one for **client** (`*-client`, `@Controller('...')` without the `admin` prefix, public, read-only or limited actions like placing a booking). `cart`, `city`, and `payment` each have a single controller and are all public.

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+
- pnpm

### 1. Start the infrastructure (MySQL + phpMyAdmin + Redis)

MySQL, phpMyAdmin, and Redis are defined in a single `docker-compose.yml` at the project root:

```bash
docker compose up -d
```

This starts:

- **MySQL** — `localhost:3307`
- **phpMyAdmin** — `http://localhost:8080`
- **Redis** — `localhost:6379`

### 2. Install & run the backend

```bash
cd tourify-backend

# 1. Install dependencies
pnpm install

# 2. Create the environment file
cp .env.example .env
# → edit the values as needed (see Environment Variables)

# 3. Run migrations
pnpm prisma migrate dev

# 4. (optional) Regenerate the Prisma Client
pnpm prisma generate

# 5. Start the dev server (hot reload)
pnpm start:dev
```

The API will run at `http://localhost:3000` and Swagger docs at `http://localhost:3000/api` _(depending on the path configured in `main.ts`)_.

### ⚠️ Note when testing ZaloPay payments (local)

ZaloPay needs to call back to your server, so when running locally you **must expose it via ngrok** (or an equivalent tunnel):

```bash
ngrok http 3000
```

Then update the `DOMAIN_WEBSITE` variable in `.env` with the new ngrok domain (it changes every time you restart the free ngrok plan), and restart the server for the ZaloPay callback to work correctly.

## 🔧 Environment Variables

Create a `.env` file from `.env.example`:

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database (Prisma)
DATABASE_URL="mysql://root:<password>@localhost:3307/tourify"

# JWT
JWT_ACCESS_SECRET="<random-secret>"
JWT_REFRESH_SECRET="<random-secret>"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary
CLOUDINARY_NAME="<cloud-name>"
CLOUDINARY_API_KEY="<api-key>"
CLOUDINARY_API_SECRET="<api-secret>"

# ZaloPay (sandbox)
ZALOPAY_APP_ID=2554
ZALOPAY_KEY1="<key1>"
ZALOPAY_KEY2="<key2>"
ZALOPAY_ENDPOINT="https://sb-openapi.zalopay.vn/v2/create"
DOMAIN_WEBSITE="https://<your-ngrok-domain>.ngrok-free.app"
```

⚠️ **Important:** never commit a real `.env` file (with secrets) to Git — only commit `.env.example` with placeholder values. `DOMAIN_WEBSITE` needs to be updated every time the ngrok domain changes.

## 🗃️ Database

### Tables (8 total)

| Table            | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `users`          | Admin accounts (customers don't have accounts)                     |
| `categories`     | Tour categories, tree structure (self-referencing parent/children) |
| `cities`         | Cities / locations                                                 |
| `tours`          | Tour info: pricing, stock, schedule, status                        |
| `tour_images`    | Tour images (multiple per tour, stored on Cloudinary)              |
| `tour_locations` | Many-to-many relation between `tours` and `cities`                 |
| `orders`         | Tour bookings (guest checkout — customer info stored directly)     |
| `order_items`    | Line items per booking (price snapshot at booking time)            |

### Key relationships

- `Category` is self-referencing (`parent` / `children`) to form a category tree
- `Tour` belongs to one `Category`, has many `TourImage`, and links to many `City` via `TourLocation`
- `Order` has many `OrderItem`; each `OrderItem` **stores a snapshot** of price and quantity per passenger type (adult/children/baby) at booking time — independent of later `Tour` price changes
- Soft delete (`deleted`, `deletedBy`) applies to `Category`, `Tour`, `User`

### Enums

| Enum             | Values                            |
| ---------------- | --------------------------------- |
| `UserStatus`     | ACTIVE, PENDING, INACTIVE, BANNED |
| `CategoryStatus` | ACTIVE, INACTIVE                  |
| `TourStatus`     | ACTIVE, INACTIVE                  |
| `OrderStatus`    | INITIAL, DONE, CANCEL             |
| `PaymentMethod`  | CASH, ZALOPAY, BANK_TRANSFER      |
| `PaymentStatus`  | UNPAID, PAID                      |

### Migrations

```bash
pnpm prisma migrate dev --name <migration_name>
```

## 📡 API Endpoints

**31 endpoints** in total, split between the **Admin** area (`/admin/...`, JWT required) and **Public** area (no `/admin` prefix, serves anonymous visitors).

### Auth (`/admin/auth`) — 6 endpoints

| Method | Endpoint                      | Access | Description                |
| ------ | ----------------------------- | ------ | -------------------------- |
| POST   | `/admin/auth/register`        | Public | Register an admin account  |
| POST   | `/admin/auth/login`           | Public | Log in, returns a JWT pair |
| POST   | `/admin/auth/refresh-token`   | Public | Refresh the access token   |
| POST   | `/admin/auth/logout`          | Auth   | Log out                    |
| PATCH  | `/admin/auth/change-password` | Auth   | Change password            |
| PATCH  | `/admin/auth/change-email`    | Auth   | Change email               |

### Users (`/admin/users`) — Auth — 8 endpoints

| Method | Endpoint               | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| GET    | `/admin/users/profile` | Get own profile                       |
| PATCH  | `/admin/users/profile` | Update own profile                    |
| POST   | `/admin/users/avatar`  | Change own avatar (Cloudinary upload) |
| GET    | `/admin/users`         | List users (paginated, filterable)    |
| GET    | `/admin/users/:id`     | Get user details                      |
| POST   | `/admin/users`         | Create a new user                     |
| PATCH  | `/admin/users/:id`     | Update a user                         |
| DELETE | `/admin/users/:id`     | Soft-delete a user                    |

### Categories

**Admin (`/admin/categories`) — Auth — 7 endpoints**

| Method | Endpoint                         | Description                         |
| ------ | -------------------------------- | ----------------------------------- |
| GET    | `/admin/categories`              | List categories (filter, paginated) |
| GET    | `/admin/categories/tree`         | Get categories as a tree            |
| GET    | `/admin/categories/:id`          | Get category details by id          |
| POST   | `/admin/categories`              | Create a category                   |
| POST   | `/admin/categories/:id/image`    | Upload category image               |
| PATCH  | `/admin/categories/change-multi` | Bulk status update                  |
| PATCH  | `/admin/categories/:id`          | Update a category                   |
| DELETE | `/admin/categories/:id`          | Soft-delete a category              |

**Client (`/categories`) — Public — 1 endpoint**

| Method | Endpoint            | Description                  |
| ------ | ------------------- | ---------------------------- |
| GET    | `/categories/:slug` | Get category details by slug |

### Cities (`/cities`) — Public — 1 endpoint

| Method | Endpoint  | Description               |
| ------ | --------- | ------------------------- |
| GET    | `/cities` | List all cities/locations |

### Tours

**Admin (`/admin/tours`) — Auth — 9 endpoints**

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/admin/tours`                     | List tours (filter, paginated) |
| GET    | `/admin/tours/:id`                 | Get tour details by id         |
| POST   | `/admin/tours`                     | Create a tour                  |
| PATCH  | `/admin/tours/change-multi`        | Bulk status update             |
| PATCH  | `/admin/tours/:id`                 | Update a tour                  |
| DELETE | `/admin/tours/:id`                 | Soft-delete a tour             |
| POST   | `/admin/tours/:id/avatar`          | Upload tour avatar image       |
| POST   | `/admin/tours/:id/images`          | Upload multiple tour images    |
| DELETE | `/admin/tours/:id/images/:imageId` | Delete a tour image            |

**Client (`/tours`) — Public — 2 endpoints**

| Method | Endpoint        | Description                                             |
| ------ | --------------- | ------------------------------------------------------- |
| GET    | `/tours/search` | Public tour search (filter by category, city, price...) |
| GET    | `/tours/:slug`  | Get tour details by slug, with breadcrumb + city list   |

### Cart (`/cart`) — Public — 1 endpoint

| Method | Endpoint       | Description                                                                          |
| ------ | -------------- | ------------------------------------------------------------------------------------ |
| POST   | `/cart/detail` | Accepts a list of items (tourId, quantity...), returns computed cart pricing details |

### Orders

**Client (`/orders`) — Public — 2 endpoints**

| Method | Endpoint                    | Description                            |
| ------ | --------------------------- | -------------------------------------- |
| POST   | `/orders`                   | Create a new order (guest checkout)    |
| GET    | `/orders?orderCode=&email=` | Look up an order by order code + email |

**Admin (`/admin/orders`) — Auth — 3 endpoints**

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/admin/orders`     | List orders (filter, paginated) |
| GET    | `/admin/orders/:id` | Get order details               |
| PATCH  | `/admin/orders/:id` | Update order status             |

### Payment (`/payment`) — Public — 2 endpoints

| Method | Endpoint                    | Description                                                  |
| ------ | --------------------------- | ------------------------------------------------------------ |
| POST   | `/payment/zalopay/create`   | Create a ZaloPay transaction, returns a payment link         |
| POST   | `/payment/zalopay/callback` | ZaloPay webhook that updates payment status (`data` + `mac`) |

## 🔐 Authentication & Authorization

```
Admin login → Access Token (15 min) + Refresh Token (7 days)
                │
                ▼
  Access Token expires → Call /admin/auth/refresh-token → New Access Token
                │
                ▼
     Logout → Call /admin/auth/logout → Access token invalidated
```

- **Access Token:** short-lived (15 min), sent via the `Authorization: Bearer <token>` header
- **Refresh Token:** long-lived (7 days)
- **JwtAuthGuard** (`common/guards/jwt-auth.guard.ts`) is applied per controller (`@UseGuards(JwtAuthGuard)`) to all routes under `/admin/...`; the `*-client` controllers (`categories`, `tours`, `orders`, `cart`, `payment`, `cities`) don't use this guard since they serve anonymous visitors
- There's no multi-tier role system (OWNER/CASHIER/...) like in some other systems — `User` currently only represents **admin accounts**, distinguished by `status` rather than a dedicated `role` field

## 🎯 Key Design Decisions

| Decision                                                | Rationale                                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Customers don't need an account                         | Reduces friction when booking — increases conversion rate                                          |
| `Order` stores customer info directly (no FK to `User`) | Since there's no customer account, `User` is admin-only                                            |
| Cart lives on the frontend (localStorage)               | Simplifies the backend; the backend is the source of truth for price & stock only at checkout time |
| `OrderItem` snapshots price at booking time             | Prevents mismatches if `Tour` prices change after a customer has booked                            |
| Split Admin / Client controllers (`*-client`)           | Clearly separates public routes from routes requiring auth, avoiding access-control confusion      |
| Self-referencing category tree                          | Supports flexible parent/child categories                                                          |
| Soft delete (`deleted` flag)                            | Preserves historical data instead of hard-deleting from the DB                                     |
| ZaloPay requires a public domain (ngrok in dev)         | Payment callbacks require a server reachable from the internet                                     |

## 📁 Project Structure

```
tourify-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/                 # Shared DTOs, guards, exceptions, enums, types
│   ├── configs/                # App, database, jwt, redis, cloudinary, zalopay config
│   ├── constants/               # Constants (cache keys, error codes, upload...)
│   ├── generated/prisma/        # Generated Prisma Client
│   ├── modules/
│   │   ├── auth/                # Login, register, refresh token
│   │   ├── user/                # Admin account management
│   │   ├── category/            # Categories (admin + client)
│   │   ├── city/                # Cities/locations (public, read-only)
│   │   ├── tour/                # Tours (admin + client)
│   │   ├── cart/                # Cart price calculation
│   │   ├── order/                # Orders (admin + client)
│   │   ├── payment/              # ZaloPay
│   │   ├── cloudinary/           # Image upload
│   │   ├── redis/                # Cache service
│   │   └── token/                # Refresh token management
│   ├── passports/                # Passport JWT strategy
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── models/                # Model definitions (split per file)
│   │   ├── enums/                  # Enum definitions (split per file)
│   │   └── migrations/
│   └── utils/                     # Helpers: slug, order-code, password, multer...
├── docker-compose.yml           # MySQL + phpMyAdmin + Redis
├── .env.example
├── package.json
└── tsconfig.json
```

## 📜 Scripts

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm start:dev`          | Start the dev server with hot reload |
| `pnpm build`              | Build to `dist/`                     |
| `pnpm start:prod`         | Run the built production bundle      |
| `pnpm lint`               | Check & auto-fix ESLint issues       |
| `pnpm format`             | Format code with Prettier            |
| `pnpm prisma migrate dev` | Run migrations                       |
| `pnpm prisma generate`    | Regenerate the Prisma Client         |
| `pnpm prisma studio`      | Open the data browser/editor UI      |

> `pnpm test` isn't fully configured yet since the `*.spec.ts` files were temporarily removed — will be added back once unit tests are written.

## 🐳 Docker

```
services:
  mysql        → localhost:3307  (root / 123456)
  phpmyadmin   → http://localhost:8080
  redis        → localhost:6379
```

```bash
docker compose up -d          # start all services
docker compose down           # stop all services
docker compose down -v        # stop and wipe volumes (reset data)
```

## 📄 License

UNLICENSED
