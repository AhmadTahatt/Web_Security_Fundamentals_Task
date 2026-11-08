# SECURITY_REVIEW.md

**Project:** E-commerce REST API (Node.js, Express, Neon PostgreSQL)
**Student:** Ahmad Tahat (ID 20220336)
**Scope:** Local project only. No real systems were tested.
**Reviewed version:** first commit, "Complete e-commerce API", before any security change.

## Summary

The original API worked, but it had no authentication, no authorization and no
hardening. Anyone who could reach it could read every user, create an
administrator and change products. Queries were already parameterized, which is
the one strong point. Fourteen findings are listed below, with the fix applied
and the evidence file that proves it.

Severity scale: Critical, High, Medium, Low.

## Findings

| # | Issue | Where | Risk | Severity | Fix applied | Evidence |
|---|-------|-------|------|----------|-------------|----------|
| 1 | No authentication on any route | `routes/usersRoutes.js`, `productsRoutes.js`, `categoriesRoutes.js` | Anyone can list users and change data | Critical | JWT login, `authenticate` middleware on protected routes | A/01, A/02, B/26, B/27 |
| 2 | Role accepted from the request body | `usersController.createUser`, `POST /api/users` | Anyone can create an `admin` account (privilege escalation) | Critical | Public `POST /api/users` removed. `/api/auth/register` has no `role` field, rejects unknown keys and always stores `customer` | A/03, B/22 |
| 3 | No role checks on admin actions | users, products and categories write routes | A normal user could add or disable products and users | High | `authorize("admin")` returns 403 | C/32, C/36, C/35 |
| 4 | Broken object-level access (IDOR) | `GET /api/users/:id`, orders | A user could read another user's data or order | High | Owner or admin check. Orders are filtered by `user_id` in the query. Another user's order returns 404 | C/45, C/46, C/50, C/51 |
| 5 | Open CORS (`cors()` with no options) | `app.js` | Any website can call the API from a browser | Medium | Allow-list from `ALLOWED_ORIGINS`, fixed methods and headers | A/04, D/42, D/43 |
| 6 | No security headers, `X-Powered-By` exposed | `app.js` | Clickjacking, MIME sniffing, version disclosure | Medium | Helmet before the routes | D/40, F/69 |
| 7 | No rate limiting | `app.js` | Brute force and abuse | High | General limiter and a strict login limiter, both return 429 | A/06, D/44 |
| 8 | Database TLS certificate not verified | `config/database.js` (`rejectUnauthorized: false`) | Man-in-the-middle on the database connection | High | Set `rejectUnauthorized: true` so the server certificate is verified | A/08 |
| 9 | Unlimited JSON body size | `app.js` (`express.json()`) | Memory exhaustion with large bodies | Low | `express.json({ limit: "10kb" })` | code |
| 10 | Weak input rules on some fields | controllers | Bad data reaches the database | Medium | Zod schemas for body and ID parameters, uniform 400 response | E/55 to E/63, A/11* |
| 11 | No security logging | whole project | Attacks and admin actions leave no trace | Medium | `utils/logger.js` records failed logins, denied access and admin actions without secrets | G/53 to G/53g |
| 12 | HTML stored in free-text fields | product `description` | Stored XSS if a front end renders it as HTML | Low | Length limits, stored and returned as plain text in JSON, `nosniff` and CSP from Helmet. A front end must render text, never HTML | F/68, F/69 |
| 13 | `.env.example` held a connection-string template | `.env.example` | Encourages real values in a tracked file | Low | Names only, empty values | file |
| 14 | Inactive products returned by the public list | `GET /api/products` | Information about items that are off sale | Low | Public list now uses `WHERE is_active = TRUE` in `productsController.getProducts` | C/34 |

### Checked and found acceptable

* All SQL uses parameters (`$1`, `$2`). No user input is concatenated into SQL.
  A text ID and SQL text in a field are rejected with 400 before the query
  (E/54, E/62, E/63).
* Passwords are hashed with bcrypt, cost factor 12. The database holds no plain
  passwords (F/64) and no response contains `password_hash` (F/65).
* `.env` is git-ignored, not tracked and never appears in git history (A/09).
* Errors return a short message with no stack trace or SQL (D/41, D/66, D/67).

## Before and after: one example

**Before** (`POST /api/users`, first commit): the body `{"role":"admin", ...}`
created an administrator without any login (A/03).

**After** (`POST /api/auth/register`): the same body returns
`400 Validation failed` because `role` is an unknown key (B/22). The server
always stores `customer`. Admins exist only because the database was changed
directly (C/30).

## Open items

* Tokens are valid for one hour. There is no refresh or revoke list.
  Acceptable for this scope.
* The rate-limit counter is in memory, so it resets on restart and is not
  shared between several servers. Use a shared store in production.
