<!--
  ASSUMPTIONS (adjust if wrong):
  - Repo name: grocery-backend
  - Other repo names: grocery_frontend_customer, grocery_frontend_store,
    grocery_frontend_rider, grocery_frontend_admin
  Swap the placeholder links below to match your actual GitHub URLs.
-->

# Fresh Grocery — Backend API

NestJS + TypeORM + PostgreSQL backend powering the Fresh Grocery platform: customer ordering, store/inventory management, rider delivery, and admin oversight.

## Related repositories

| App | Description |
|---|---|
| [grocery_frontend_customer](../../../grocery_frontend_customer) | Customer-facing shopping app (Flutter) |
| [grocery_frontend_store](../../../grocery_frontend_store) | Store/partner management app (Flutter) |
| [grocery_frontend_rider](../../../grocery_frontend_rider) | Rider delivery app (Flutter) |
| [grocery_frontend_admin](../../../grocery_frontend_admin) | Admin console (Flutter) |

## Features

- **Auth**: JWT-based login/register, role-based access (customer, store owner, rider, admin), email verification, admin approval flow for partners/riders, forgot/reset password, soft-delete on account removal
- **Catalog & orders**: products, stores, cart, order lifecycle (accepted → preparing → ready → picked up → on the way → delivered/cancelled), stock management, promotional discounts
- **Payments**: Stripe (PaymentIntent + webhook confirmation) and Cash on Delivery, admin-reconcilable payment records
- **Delivery**: rider assignment, live location tracking, simulated road-route delivery (OSRM), order cancellation with automatic stock restoration
- **Admin**: platform stats, user/role management, store and order oversight, promotions CRUD
- **Notifications**: in-app notifications for order updates, approvals, and admin alerts

## Tech stack

- NestJS (TypeScript)
- TypeORM + PostgreSQL
- Passport JWT
- Stripe SDK
- Nodemailer (via `@nestjs-modules/mailer`)

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or accessible remotely
- A Stripe account (test/sandbox keys)

### Setup

```bash
git clone https://github.com/<your-username>/grocery-backend.git
cd grocery-backend
npm install
```

### Environment variables

Create a `.env` file in the project root:

```dotenv
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=grocery

# Auth
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (used for verification + password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Adjust the DB variable names above to match whatever `TypeOrmModule.forRoot(...)` config actually reads in your project.

### Run

```bash
npm run start:dev
```

Server starts on `http://localhost:3000` by default.

### Testing Stripe locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe login
stripe listen --forward-to localhost:3000/payments/webhook
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart the server.

## Project structure

```
src/
├── auth/            # login, register, JWT strategy, guards
├── users/            # user CRUD
├── orders/           # order lifecycle, rider assignment, delivery simulation
├── payments/         # Stripe + COD payment handling
├── promotions/        # discount codes/campaigns
├── admin/            # admin-only stats and management endpoints
├── notifications/       # in-app notifications
└── common/           # shared enums, decorators, guards
```

## License

Private project — not licensed for redistribution.
