<!--
  ASSUMPTIONS (adjust if wrong):
  - Repo name: grocery-backend
  - Other repo names: grocery_frontend_customer, grocery_frontend_store,
    grocery_frontend_rider, grocery_frontend_admin
  Swap the placeholder links below to match your actual GitHub URLs.
-->
# Fresh Grocery — Backend API

NestJS + TypeORM + PostgreSQL backend powering the Fresh Grocery platform: customer ordering, store/inventory management, rider delivery, real-time chat/calling, push notifications, and admin oversight.

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
- **Chat**: per-order messaging between customer and rider, polled by both clients
- **Voice calling**: call signaling (ringing/accept/decline/end) with real-time audio via **Agora**, including server-side RTC token generation
- **Push notifications**: order updates, chat messages, and incoming-call wake-ups delivered via **Firebase Cloud Messaging** (FCM), with device token registration per user
- **Admin**: platform stats, user/role management, store and order oversight, promotions CRUD
- **In-app notifications**: persisted notification history alongside push delivery

## Tech stack

- NestJS (TypeScript)
- TypeORM + PostgreSQL
- Passport JWT
- Stripe SDK
- Nodemailer (via `@nestjs-modules/mailer`)
- `firebase-admin` (modular API) for push notifications
- `agora-token` for server-side Agora RTC token generation

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or accessible remotely
- A Stripe account (test/sandbox keys)
- A Firebase project (see [Push notifications](#push-notifications-firebase) below)
- An Agora project (see [Voice calling](#voice-calling-agora) below)

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

# Firebase (push notifications)
FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json

# Agora (voice calling)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

Adjust the DB variable names above to match whatever `TypeOrmModule.forRoot(...)` config actually reads in your project.

### Push notifications (Firebase)

1. [Firebase Console](https://console.firebase.google.com) → create/select a project
2. Add an **Android app** for each Flutter client (customer, rider) under its exact package name → download `google-services.json` into each client project
3. Add an **iOS app** similarly if targeting iOS → download `GoogleService-Info.plist`, plus upload an **APNs Authentication Key** under Cloud Messaging settings
4. **Project Settings → Service Accounts → Generate new private key** → save the downloaded JSON as `secrets/firebase-service-account.json` (path must match `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`)
5. Add `secrets/` to `.gitignore` — this file is a live credential and must never be committed

Client apps register their device token via `POST /notifications/device-token` on sign-in; the backend uses it to push order updates, chat messages, and incoming-call alerts.

### Voice calling (Agora)

1. [console.agora.io](https://console.agora.io) → create a project → copy the **App ID** and **App Certificate** into `.env`
2. The backend generates a short-lived RTC token per call participant (`AgoraTokenService`); no further setup needed beyond the two env vars
3. Both Flutter clients must be launched with the **same** `--dart-define=AGORA_APP_ID=...` value as configured here

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

## Project structure

```
src/
├── auth/ # login, register, JWT strategy, guards
├── users/ # user CRUD
├── orders/ # order lifecycle, rider assignment, delivery simulation
├── payments/ # Stripe + COD payment handling
├── promotions/ # discount codes/campaigns
├── admin/ # admin-only stats and management endpoints
├── notifications/ # in-app notifications + FCM device token registration/push
├── firebase/ # Firebase Admin SDK wrapper (push sending)
├── calls/ # call signaling + Agora RTC token generation
├── messages/ # per-order chat
└── common/ # shared enums, decorators, guards
```

## License

Private project — not licensed for redistribution.
