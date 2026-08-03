# SQL Detective

A black-and-white mystery game where players investigate fictional crimes by writing real SQL queries.

Query the evidence. Solve the case.

## Tech stack

- **Frontend:** React, TypeScript, Vite, CSS, Vitest
- **Backend:** Java 21, Spring Boot 3, Maven, Spring JDBC
- **Database:** PostgreSQL, Flyway

## Prerequisites

- Node.js 20+
- Java 21+
- Docker (for PostgreSQL and backend integration tests)

## Local setup

### 1. Environment

```bash
cp .env.example .env
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

API health check: [http://localhost:8080/api/health](http://localhost:8080/api/health)

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

## Useful commands

| Area | Command | Purpose |
| --- | --- | --- |
| Frontend | `npm run typecheck` | TypeScript check |
| Frontend | `npm test` | Vitest |
| Frontend | `npm run build` | Production build |
| Backend | `./mvnw test` | JUnit 5 + Testcontainers |
| Backend | `./mvnw package` | Build JAR |

## Case 01 API

- `GET /api/cases/blackwood`
- `GET /api/challenges`
- `GET /api/challenges/{levelNumber}`
- `GET /api/schema/tables`
- `GET /api/schema/tables/{tableName}`
