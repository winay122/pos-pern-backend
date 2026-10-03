# ViRa POS — Backend API Service

A robust, production-ready Point of Sale (POS) backend service powering multi-tenant retail operations. Built with **Node.js (ES Modules)**, **Express**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

## 🚀 Features & Stack

### Core Technologies
- **Runtime**: Node.js (ES Module Support)
- **Framework**: Express.js
- **Language**: TypeScript (`v5.7`)
- **Database & ORM**: PostgreSQL via Prisma ORM (`v5.22`)
- **Authentication**: JWT (Access + Refresh tokens) & `bcryptjs` password encryption
- **Validation**: Strict runtime payload validation via `Zod`
- **Logging**: Structured, high-performance logging via `Pino` & `Pino-Pretty`
- **Security**: Helmet HTTP headers, CORS origin controls, Express Rate Limiting, and Gzip compression

---

## 📁 Project Architecture

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema definitions & Prisma models
│   └── seed.ts              # Initial database seed script (Admin & sample store)
├── src/
│   ├── config/              # Environment vars, constants, and JWT configs
│   ├── middleware/          # Auth guard, error handling, rate limiting
│   ├── modules/             # Business Domain Modules
│   │   ├── admin/           # Super Admin management APIs
│   │   ├── auth/            # Shop owner & Admin authentication
│   │   ├── product/         # Product catalog & barcode lookup
│   │   ├── sale/            # Sales transactions, receipts & billing
│   │   ├── shop/            # Shop profile & multi-store setup
│   │   ├── stock/           # Inventory tracking & low stock alerts
│   │   └── sync/            # Offline transaction sync engine
│   ├── types/               # Custom TypeScript interface declarations
│   ├── utils/               # Pino logger, response helpers, JWT signers
│   ├── app.ts               # Express app configuration & middleware pipeline
│   └── server.ts            # Entrypoint HTTP listener
├── .env.example             # Environment configuration template
├── package.json
└── tsconfig.json
```

---

## 📊 Database Schema Summary (Prisma ORM)

| Model | Table | Description |
|---|---|---|
| **`Admin`** | `admins` | Super Administrator credentials and access |
| **`Shop`** | `shops` | Registered retail stores (General Store, Clothing, Cosmetics, etc.) |
| **`Product`** | `products` | Product catalog items linked to shop & barcodes |
| **`Stock`** | `stocks` | Inventory quantities and low-stock threshold triggers |
| **`Sale`** | `sales` | Sales transactions supporting CASH, UPI, CREDIT & offline UUID sync |
| **`SaleItem`** | `sale_items` | Individual line items attached to a sale |
| **`OtpRequest`** | `otp_requests` | Phone verification & password reset OTP entries |

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`+
- **PostgreSQL**: `v14.x`+ (or local SQLite database for development)
- **npm**: `v9.x`+

### 1. Installation

Navigate into the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5500

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_db?schema=public"

# JWT Token Secrets
JWT_ACCESS_SECRET="your_access_token_secret"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="your_refresh_token_secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Allowed CORS Origins
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"

# Seed Credentials
ADMIN_INITIAL_EMAIL="admin@virapos.com"
ADMIN_INITIAL_PASSWORD="Admin@123"
```

### 3. Database Migration & Initialization

Generate Prisma client files and run database migrations:

```bash
# Generate Prisma Client types
npm run prisma:generate

# Execute database migrations
npm run prisma:migrate

# Seed database with initial Admin user
npm run prisma:seed
```

---

## 📜 Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload (`tsx watch`) |
| `npm run build` | Generate Prisma client and compile TypeScript to `dist/` |
| `npm run start` | Run compiled production server (`node dist/server.js`) |
| `npm run prisma:generate` | Re-generate Prisma Client types |
| `npm run prisma:migrate` | Apply dev schema migrations |
| `npm run prisma:deploy` | Apply production schema migrations |
| `npm run prisma:seed` | Seed initial database data |
| `npm run prisma:studio` | Launch Prisma Studio GUI database manager |

---

## 🔌 API Route Overview (`/api/v1`)

### Authentication (`/api/v1/auth`)
- `POST /login` — Authenticate Shop Owner / Admin
- `POST /refresh-token` — Obtain new access token via refresh token
- `GET /me` — Fetch currently authenticated user profile

### Products (`/api/v1/products`)
- `GET /` — List products for current shop (supports search & pagination)
- `GET /barcode/:code` — Quick product lookup by barcode
- `POST /` — Add new product catalog item
- `PUT /:id` — Update product details & pricing
- `DELETE /:id` — Remove product

### Inventory (`/api/v1/stock`)
- `GET /` — Retrieve current inventory stock levels
- `PUT /:productId` — Adjust product stock quantity & low stock alert threshold

### Sales & Billing (`/api/v1/sales`)
- `POST /` — Process new sales transaction (Cash, UPI, Credit)
- `GET /` — Retrieve sales history and invoices
- `GET /:id` — Retrieve receipt details for a specific sale

### Offline Synchronization (`/api/v1/sync`)
- `POST /` — Push queued offline client sales transactions (idempotent sync via client UUIDs)

---

## 📄 License

ISC License — Built for ViRa POS Workspace.
