# POS Application Backend API

A high-performance, modular Point of Sale (POS) backend built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM**.

---

## 🚀 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL / SQLite via Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Validation**: Zod schema validation
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, Compression, Pino Logger

---

## 📁 Project Architecture

```
backend/
├── prisma/
│   ├── schema.prisma        # Prisma database schema definition
│   └── seed.ts              # Database seeding script
├── src/
│   ├── config/              # Environment & application configurations
│   ├── middleware/          # Auth, error handling, rate limiters
│   ├── modules/             # Feature modules
│   │   ├── admin/           # Super Admin management
│   │   ├── auth/            # User authentication & sessions
│   │   ├── product/         # Catalog & product management
│   │   ├── sale/            # Sales transactions & checkout
│   │   ├── shop/            # Multi-shop & store management
│   │   ├── stock/           # Inventory & stock tracking
│   │   └── sync/            # Offline-first sync endpoints
│   ├── types/               # TypeScript interface & type declarations
│   ├── utils/               # Logger, token helpers, async handlers
│   ├── app.ts               # Express application initialization
│   └── server.ts            # Entry point server listener
├── .env.example             # Template for environment variables
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v18.x` or `v20.x`+
- **npm**: `v9.x`+

### 1. Installation

Navigate into the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Example `.env` config:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_key"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database Migration & Seeding

Generate Prisma client and apply database migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts dev server with live reload (`tsx watch`) |
| `npm run build` | Generates Prisma client and compiles TypeScript to `dist/` |
| `npm run start` | Runs compiled production server (`node dist/server.js`) |
| `npm run prisma:generate` | Generates Prisma Client types |
| `npm run prisma:migrate` | Runs database migrations in development |
| `npm run prisma:deploy` | Applies pending migrations in production |
| `npm run prisma:seed` | Runs database seed script |
| `npm run prisma:studio` | Opens interactive Prisma Studio GUI |

---

## 🛡️ Key Features & Endpoints

- **Authentication (`/api/v1/auth`)**: Login, Token Refresh, User Info
- **Super Admin (`/api/v1/admin`)**: Store provisioning, user roles
- **Shop Management (`/api/v1/shops`)**: Manage store details and settings
- **Products (`/api/v1/products`)**: CRUD operations, barcodes, categories
- **Sales & Billing (`/api/v1/sales`)**: Process orders, receipts, invoice generation
- **Inventory & Stock (`/api/v1/stock`)**: Stock counts, low-stock alerts
- **Offline Sync (`/api/v1/sync`)**: Bidirectional sync engine for offline-capable frontends

---

## 📄 License

ISC License
