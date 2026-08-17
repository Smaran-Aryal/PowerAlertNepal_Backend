# PowerAlert Nepal — Backend

REST API for **PowerAlert Nepal**, a power-outage reporting and public alert
platform. Citizens can report outages and track their own reports; admins can
verify/resolve/reject reports, manage users, and publish maintenance notices
and announcements.

Frontend repo: `poweralert-nepal` (React + Vite).

## Tech stack

- **Node.js + Express 5** — HTTP API
- **MongoDB + Mongoose** — data store / ODM
- **JWT** — short-lived access token + long-lived refresh token (httpOnly cookie)
- **express-validator** — request validation
- **multer** — report image uploads (disk storage, magic-byte MIME sniffing)
- **bcrypt** — password hashing
- **cors**, **cookie-parser** — middleware

## Project structure

```
src/
├── app.js                 # Express app: middleware + route mounting
├── index.js                # Entry point — connects DB, starts server
├── config/
│   └── db.js                # Mongoose connection
├── models/
│   ├── User.model.js
│   ├── Report.model.js
│   ├── MaintenanceNotice.model.js
│   └── Announcement.model.js
├── routes/
│   ├── auth.routes.js       # /api/auth
│   ├── report.routes.js     # /api/reports  (citizen)
│   ├── public.routes.js     # /api/public   (no auth)
│   └── admin.routes.js      # /api/admin    (admin only)
├── controllers/            # request/response handling per resource
├── services/                # business logic used by controllers
├── validators/               # express-validator rule sets
├── middleware/
│   ├── auth.middleware.js     # verifies access token
│   ├── role.middleware.js     # requires a given role (e.g. "admin")
│   ├── ownership.middleware.js# citizen can only edit/delete their own reports
│   ├── upload.middleware.js   # multer config + image validation
│   ├── validate.middleware.js # runs express-validator rules
│   └── error.middleware.js    # centralized error handler
└── utils/
    └── generateTokens.js     # access/refresh token signing
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (local MongoDB or a MongoDB Atlas cluster)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file (see Environment variables below)
cp .env.example .env   # then fill in real values

# 3. Run in development (auto-restarts via nodemon)
npm run dev

# ...or run in production mode
npm start
```

The server starts on `http://localhost:<PORT>` (default `3000`).

## Environment variables

Create a `.env` file in the project root:

| Variable              | Description                                                              | Example                                  |
|------------------------|---------------------------------------------------------------------------|-------------------------------------------|
| `PORT`                 | Port the API listens on                                                  | `3000`                                    |
| `CORS_ORIGIN`          | Comma-separated list of allowed frontend origins (must send credentials) | `http://localhost:5173`                   |
| `MONGO_URI`            | MongoDB connection string                                                | `mongodb+srv://user:pass@cluster/dbname`  |
| `JWT_ACCESS_SECRET`    | Secret used to sign access tokens                                        | any long random string                    |
| `JWT_REFRESH_SECRET`   | Secret used to sign refresh tokens                                       | a **different** long random string        |
| `JWT_ACCESS_EXPIRE`    | Access token lifetime                                                    | `1d`                                      |
| `JWT_REFRESH_EXPIRE`   | Refresh token lifetime                                                   | `7d`                                      |

> **Never commit your real `.env`.** Use strong, unique values for
> `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in any deployed environment, and
> rotate them if they were ever pushed to a public repository.

## Available scripts

| Command       | Description                              |
|----------------|--------------------------------------------|
| `npm run dev`  | Start with nodemon (auto-restart on change) |
| `npm start`    | Start normally (production)                |

## Authentication

- On login/register, the API returns a short-lived **access token** in the
  JSON response body and sets a long-lived **refresh token** as an httpOnly
  cookie.
- Send the access token as `Authorization: Bearer <token>` on authenticated
  requests.
- Call `POST /api/auth/refresh` (browser sends the refresh cookie
  automatically) to get a new access token once the old one expires.
- The frontend must send requests with `credentials: include` (axios
  `withCredentials: true`) and `CORS_ORIGIN` must match the frontend's exact
  origin for the refresh cookie to work cross-origin.

## Uploaded images

Report images are stored on disk under `/uploads` and served statically at:

```
GET /media/uploads/<filename>
```

## API reference

Base URL: `http://localhost:3000`

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": { } }
```

### Auth — `/api/auth`

| Method | Endpoint     | Auth | Description                          |
|--------|---------------|------|----------------------------------------|
| POST   | `/register`   | —    | Create a citizen account               |
| POST   | `/login`      | —    | Log in, returns access token + refresh cookie |
| POST   | `/refresh`    | —    | Exchange refresh cookie for a new access token |
| GET    | `/me`         | ✅   | Get the current logged-in user's profile |
| POST   | `/logout`     | ✅   | Clear refresh cookie / end session      |

### Citizen reports — `/api/reports`

| Method | Endpoint | Auth | Description                                             |
|--------|-----------|------|-----------------------------------------------------------|
| POST   | `/`       | ✅   | Submit a new outage report (multipart, optional image)    |
| GET    | `/mine`   | ✅   | Get the current citizen's own reports (paginated)          |
| PUT    | `/:id`    | ✅   | Edit own report — only while status is `Pending`           |
| DELETE | `/:id`    | ✅   | Delete own report (ownership-checked)                      |

### Public — `/api/public` (no authentication required)

| Method | Endpoint          | Description                                                  |
|--------|--------------------|-----------------------------------------------------------------|
| GET    | `/reports`         | List reports (Rejected reports excluded by default), paginated  |
| GET    | `/reports/:id`     | Get a single report                                             |
| GET    | `/notices`         | List maintenance notices                                        |
| GET    | `/notices/:id`     | Get a single maintenance notice                                 |
| GET    | `/announcements`   | List **published** announcements only                           |
| GET    | `/announcements/:id` | Get a single published announcement                          |
| GET    | `/stats`           | Public outage statistics summary                                |

### Admin — `/api/admin` (requires `role: admin`)

| Method | Endpoint                      | Description                              |
|--------|---------------------------------|---------------------------------------------|
| GET    | `/stats`                        | Overview stats (totals by status, recent reports, etc.) |
| GET    | `/reports`                      | List all reports (any status), paginated  |
| GET    | `/reports/:id`                  | Get a single report                        |
| PATCH  | `/reports/:id/verify`           | Mark a report Verified                     |
| PATCH  | `/reports/:id/resolve`          | Mark a report Resolved                     |
| PATCH  | `/reports/:id/reject`           | Mark a report Rejected (with reason)       |
| DELETE | `/reports/:id`                  | Delete a report                            |
| GET    | `/users`                        | List all users                             |
| PATCH  | `/users/:id/deactivate`         | Deactivate a user account                  |
| POST   | `/notices`                      | Create a maintenance notice                |
| PUT    | `/notices/:id`                  | Update a maintenance notice                |
| DELETE | `/notices/:id`                  | Delete a maintenance notice                |
| GET    | `/announcements`                | List **all** announcements (published + draft) |
| GET    | `/announcements/:id`            | Get a single announcement (any status)     |
| POST   | `/announcements`                | Create an announcement                     |
| PUT    | `/announcements/:id`            | Update an announcement                     |
| DELETE | `/announcements/:id`            | Delete an announcement                     |

## License

Build for academic purpose 