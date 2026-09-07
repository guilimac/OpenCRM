# OpenCRM - Enterprise CRM Platform

A robust, enterprise-ready Customer Relationship Management web application engineered with modern architectural standards:
- **Backend**: NestJS adhering strictly to **Hexagonal Architecture (Ports and Adapters)**.
- **Database**: MySQL 8.4 normalized relational schema with indexing strategies for high-frequency queries.
- **Cache & Throttling**: Redis 7 for cache-aside reads, token family lifecycle/revocation, and distributed rate limiting.
- **Security**: JWT stateless access tokens with refresh token rotation and breach detection, argon2/bcrypt password hashing, RBAC & ABAC policy guards.
- **Frontend**: Angular 22 application following **Domain-Driven Design (DDD)** principles, Angular Material 3 theming, NgRx SignalStore, WCAG 2.1 AA accessibility, and Progressive Web App (PWA) readiness.
- **Currency**: Multi-currency support with **Brazilian Real (BRL)** as the default primary currency.

---

## Repository Structure (Polyrepo Layout)

```text
OpenCRM/
├── backend/                  # NestJS Hexagonal Application
│   ├── src/
│   │   ├── core/             # Pure Domain & Application layers (Framework agnostic)
│   │   │   ├── domain/       # Aggregates, Entities, Value Objects, Domain Events, Ports
│   │   │   └── application/  # Use Cases, Command/Query Handlers, DTOs
│   │   └── infrastructure/   # Adapters (REST, TypeORM MySQL, Redis, Auth)
│   ├── test/                 # Integration and E2E test suites
│   ├── Dockerfile            # Multi-stage production container
│   └── package.json
│
├── frontend/                 # Angular 22 DDD Application
│   ├── src/app/
│   │   ├── core/             # Auth interceptors, guards, global services
│   │   ├── shared/           # Reusable UI components (Material 3), pipes, directives
│   │   └── domains/          # Bounded Contexts (customer, opportunity, interaction)
│   ├── Dockerfile            # Multi-stage Nginx container
│   └── package.json
│
├── docker-compose.yml        # Local development orchestration (MySQL, Redis, Backend, Frontend)
├── .env.example              # Environment variables template
└── README.md
```

---

## Quick Start

### 1. Start Infrastructure (Docker Compose)
```bash
docker compose up -d mysql redis
```

### 2. Run Backend
```bash
cd backend
cp ../.env.example .env
npm install
npm run start:dev
```
API runs at `http://localhost:3000`  
Swagger Documentation: `http://localhost:3000/api/docs`

### 3. Run Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:4200`
