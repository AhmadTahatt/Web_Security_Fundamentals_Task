# E-commerce REST API: Web Security Fundamentals

Student: Ahmad Tahat, University ID 20220336

Node.js, Express and Neon PostgreSQL. This version adds authentication, role
and ownership checks, input validation, security headers, CORS, rate limiting,
safe errors and security logging. All testing was done locally.

## Requirements

* Node.js 20 or newer, npm
* A Neon PostgreSQL database with the tables `users`, `categories`, `products`,
  `orders`, `order_items`, `payments`
* Postman

## Setup

1. Install packages:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your own values:
   ```
   PORT=3000
   DATABASE_URL=            # your Neon connection string
   JWT_SECRET=              # a long random string, 32+ characters
   JWT_EXPIRES_IN=1h
   ALLOWED_ORIGINS=http://localhost:3000
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MINUTES=15
   RATE_LIMIT_MAX=100
   LOGIN_RATE_LIMIT_MAX=5
   ```
   Never commit `.env`. It is listed in `.gitignore`.
3. Start the server:
   ```
   npm run dev
   ```
   It prints `Server is running on port 3000`.

## Test accounts

Registration always creates a customer. Create two accounts with
`POST /api/auth/register`, then promote one to admin in the Neon SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = '<your admin email>';
```

Log in again after that, because the old token still carries the old role.
Create one order for the customer so the ownership tests have data.

## Endpoints

| Method and path | Access |
|---|---|
| `POST /api/auth/register` | public |
| `POST /api/auth/login` | public, strict rate limit |
| `GET /api/auth/me` | any logged-in user |
| `GET /api/products`, `GET /api/products/:id` | public |
| `POST/PUT /api/products`, `PATCH /api/products/:id/deactivate` | admin |
| `GET /api/categories`, `GET /api/categories/:id` | public |
| `POST/PUT /api/categories` | admin |
| `GET /api/users` | admin |
| `GET /api/users/:id` | owner or admin |
| `PATCH /api/users/:id/status` | admin |
| `GET /api/orders` | own orders (admin: all) |
| `GET /api/orders/:id` | owner or admin |

Responses: `401` not logged in, `403` role not allowed, `404` not found (also
used for another user's order), `400` invalid input, `409` duplicate,
`429` too many requests.

## Run the tests

1. Import `Web_Security_Testing.postman_collection.json` into Postman.
2. Open the collection, then the **Variables** tab. Set `adminEmail`,
   `adminPassword`, `customerEmail`, `customerPassword` to your test accounts.
   Also set `customerUserId` (the customer's id), `adminUserId` and `otherOrderId`
   (the id of an order that belongs to another user). Leave `baseUrl` as
   `http://localhost:3000`.
3. Run the folders in order with the Collection Runner. The login requests save
   the tokens automatically.
4. Run the **12 Rate limit** folder last. It blocks logins from your computer
   for 15 minutes. Restart the server to reset the counter.

Expected results (mandatory tests):

| # | Test | Expected |
|---|---|---|
| 1 | Register a new user | 201 |
| 2 | Register a duplicate email | 409 |
| 3 | Login with correct data | 200 |
| 4 | Login with a wrong password | 401 |
| 5 | Protected route without a token | 401 |
| 6 | Protected route with an invalid token | 401 |
| 7 | Customer adds a product | 403 |
| 8 | Admin adds a product | 201 |
| 9 | Product with a negative price | 400 |
| 10 | Invalid email or broken JSON | 400 |
| 11 | Another user's data or order | 403 or 404 |
| 12 | Too many login attempts | 429 |
| 13 | Unknown endpoint | 404 |
| 14 | `password_hash` in results | not present |
| 15 | Helmet headers | present |

Screenshots are in `Auth_Security_Evidence/`, with `INDEX.csv` listing each file.

## Security features

| Area | Where |
|---|---|
| JWT login, bearer token check | `middleware/authenticate.js`, `controllers/authController.js` |
| Roles | `middleware/authorize.js` |
| Ownership (IDOR) | `usersController.getUserById`, `ordersController.js` |
| Input validation (Zod) | `validators/`, `middleware/validate.js` |
| Parameterized SQL | all controllers |
| Password hashing (bcrypt, cost 12) | `controllers/authController.js` |
| Helmet, CORS allow-list | `app.js` |
| Rate limiting | `middleware/rateLimiter.js` |
| Not-found and error handlers | `middleware/notFound.js`, `middleware/errorHandler.js` |
| Security logging | `utils/logger.js` (writes to `logs/security.log`, git-ignored) |

## Notes

* `SECURITY_REVIEW.md` lists the findings and the fixes.
* No secrets are stored in the repository. The log never records passwords,
  tokens or hashes.
