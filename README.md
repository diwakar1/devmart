# DevMart — Running the Application

## Project Structure

```
DevMart/
├── backend/        Express.js + TypeScript REST API  (port 5000)
├── frontend/       Angular application               (port 4200)
├── shared/         Shared DTOs, enums, models
├── database/       SQL schema & seed files
├── docker-compose.yml
├── .env            Root env file (Docker Compose vars)
└── backend/.env    Backend runtime env file
```

---

## Prerequisites

| Tool | Version | Required for |
|---|---|---|
| Node.js | ≥ 18 | Backend & Frontend |
| npm | ≥ 9 | Package management |
| Docker Desktop | latest | MySQL + phpMyAdmin containers |
| Angular CLI | ≥ 17 | Frontend (optional, root scripts handle it) |

---

## Environment Files

### Root `.env` (used by Docker Compose)

Located at `DevMart/.env`:

```env
DB_ROOT_PASSWORD=root
DB_ROOT_USER=root
DB_USER=devmart_user
DB_PASSWORD=DevMart@2026#Secure
DB_NAME=devmart
```

### Backend `.env` (used by the Node.js server)

Located at `DevMart/backend/.env`:

```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=devmart_user
DB_PASSWORD="DevMart@2026#Secure"
DB_NAME=devmart

JWT_SECRET=<your_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

COOKIE_SECRET=<your_cookie_secret>
CORS_ORIGIN=http://localhost:4200
```

> Both files must exist before starting the application.

---

## 1. Install Dependencies

Run once from the project root:

```bash
npm run install:all
```

This installs packages for the root, `shared`, `backend`, and `frontend` workspaces.

---

## 2. Running the Database

### Option A — Using Docker (recommended, no local MySQL needed)

```bash
docker-compose up -d
```

- Starts a **MySQL 8.0** container (`devmart-db`) on port **3306**
- Starts a **phpMyAdmin** container (`devmart-phpmyadmin`) on port **8080**
- Automatically loads schema and seed data from the `database/` folder on first run

Stop the containers:

```bash
docker-compose down
```

Stop and remove all data (full reset):

```bash
docker-compose down -v
```

---

### Option B — You Already Have MySQL Running Locally (port 3306 conflict)

If MySQL is already installed and running on your machine, Docker will fail to bind port 3306.

**Choose one of these approaches:**

#### B1. Stop local MySQL, then use Docker

```bash
# Windows (MySQL 8.0 service)
net stop MySQL80

# Then start Docker containers normally
docker-compose up -d
```

To restart local MySQL later:

```bash
net start MySQL80
```

---

#### B2. Keep local MySQL and skip Docker

1. Create the database and user in your local MySQL:

```sql
CREATE DATABASE devmart;
CREATE USER 'devmart_user'@'localhost' IDENTIFIED BY 'DevMart@2026#Secure';
GRANT ALL PRIVILEGES ON devmart.* TO 'devmart_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Import the schema and seed data:

```bash
mysql -u root -p devmart < database/schema.sql
mysql -u root -p devmart < database/seed-data.sql
mysql -u root -p devmart < database/additional-seeds.sql
```

3. Update `backend/.env` to point to localhost:

```env
DB_HOST=localhost
DB_PORT=3306
```

4. Skip `docker-compose up` — just run the backend directly.

---

#### B3. Run both (local MySQL + Docker on a different port)

Change the Docker MySQL port in `docker-compose.yml`:

```yaml
ports:
  - "3307:3306"   # host port 3307 → container port 3306
```

Then update `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
```

---

## 3. Accessing phpMyAdmin

phpMyAdmin is only available when using Docker (Option A or B3).

**URL:** http://localhost:8080

**Login credentials:**

| Field | Value |
|---|---|
| Server | mysql (auto-set) |
| Username | `root` |
| Password | value of `DB_ROOT_PASSWORD` in `.env` (default: `root`) |

---

## 4. Running the Full Application

### Development mode (all services in one command)

From the project root:

```bash
npm run dev
```

This concurrently starts:
- `shared` — TypeScript watch mode (compiles shared models)
- `backend` — Nodemon dev server on **http://localhost:5000**
- `frontend` — Angular dev server on **http://localhost:4200** (with API proxy)

---

### Running services individually

```bash
# Shared models (watch mode)
npm run dev:shared

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

---

## 5. Building for Production

```bash
npm run build
```

Builds `shared`, `backend`, and `frontend` in the correct order.

Start the backend production server:

```bash
npm run start:backend
```

---

## 6. API

- **Base URL:** `http://localhost:5000/api/v1`
- The Angular frontend proxies `/api` requests to `http://localhost:5000` automatically in development (see `frontend/proxy.conf.json`)

---

## 7. Quick Reference

| Command | What it does |
|---|---|
| `npm run install:all` | Install all workspace dependencies |
| `npm run dev` | Start all services (shared + backend + frontend) |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build all for production |
| `npm run clean` | Remove all dist folders |
| `docker-compose up -d` | Start MySQL + phpMyAdmin in background |
| `docker-compose down` | Stop containers |
| `docker-compose down -v` | Stop containers and delete all DB data |
| `docker-compose restart` | Restart containers |
| `docker ps` | List running containers |
| `docker logs devmart-db` | View MySQL container logs |
| `docker logs devmart-phpmyadmin` | View phpMyAdmin container logs |
