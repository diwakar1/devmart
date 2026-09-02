# DevMart — Running the Application

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for database via Docker)
- [MySQL](https://dev.mysql.com/downloads/) (if running database locally without Docker)

---

## 1. Install Dependencies

Run once from the project root:

```bash
npm run install:all
```

This installs dependencies for the root, `shared`, `backend`, and `frontend` workspaces.

---

## 2. Environment Setup

### Backend `.env`

Create `backend/.env` (copy from `backend/.env.example` if available) with:

```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
DB_ROOT_PASSWORD=<your_root_password>
DB_CONNECTION_LIMIT=10

JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

COOKIE_SECRET=<your_cookie_secret>
CORS_ORIGIN=http://localhost:4200
FRONTEND_URL=http://localhost:4200
```

### Root `.env` (Docker only)

Create `.env` in the project root (used by Docker Compose):

```env
DB_ROOT_PASSWORD=<your_root_password>
DB_ROOT_USER=<your_root_user>
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
```

---

## 3. Database Setup

### Option A — Using Docker (recommended, no local MySQL needed)

> Make sure Docker Desktop is running.

```bash
docker-compose up -d
```

This starts:
- **MySQL 8.0** on port `3306` — with schema and seed data loaded automatically
- **phpMyAdmin** on port `8080`

To stop:
```bash
docker-compose down
```

To stop and remove all data (clean slate):
```bash
docker-compose down -v
```

---

### Option B — Using your local MySQL (no Docker)

1. Make sure MySQL is running on your machine (port 3306)
2. Create the database and user:

```sql
CREATE DATABASE <your_db_name>;
CREATE USER '<your_db_user>'@'localhost' IDENTIFIED BY '<your_db_password>';
GRANT ALL PRIVILEGES ON <your_db_name>.* TO '<your_db_user>'@'localhost';
FLUSH PRIVILEGES;
```

3. Load the schema and seed data:

```bash
mysql -u root -p <your_db_name> < database/schema.sql
mysql -u root -p <your_db_name> < database/seed-data.sql
mysql -u root -p <your_db_name> < database/additional-seeds.sql
```

4. In `backend/.env`, set:
```env
DB_HOST=localhost
```

> **Note:** If both local MySQL and Docker MySQL are running, they will conflict on port 3306.
> Either stop local MySQL first (`net stop MySQL80`) or change the Docker port mapping in `docker-compose.yml` to `"3307:3306"`.

---

## 4. phpMyAdmin

Only available when using Docker (Option A).

- **URL:** http://localhost:8080
- **Username:** value of `DB_ROOT_USER` in root `.env`
- **Password:** value of `DB_ROOT_PASSWORD` in root `.env`

---

## 5. Running the Application

### Run everything together (recommended)

From the project root:

```bash
npm run dev
```

This starts `shared` (watch mode), `backend`, and `frontend` concurrently.

### Run individually

```bash
# Backend only (runs on http://localhost:5000)
npm run dev:backend

# Frontend only (runs on http://localhost:4200)
npm run dev:frontend

# Shared types in watch mode
npm run dev:shared
```

---

## 6. Application URLs

| Service      | URL                          |
|-------------|-------------------------------|
| Frontend    | http://localhost:4200          |
| Backend API | http://localhost:5000/api/v1   |
| phpMyAdmin  | http://localhost:8080          |
| MySQL       | localhost:3306                 |

---

## 7. Build for Production

```bash
npm run build
```

Builds `shared`, `backend` (TypeScript → JS), and `frontend` (Angular).

To start the compiled backend:
```bash
npm run start:backend
```
