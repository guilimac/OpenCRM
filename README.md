<p align="center">
  <img src="frontend/public/images/opencrm-logo.png" alt="OpenCRM Logo" width="140" />
</p>

<h1 align="center">OpenCRM - Enterprise CRM Platform</h1>

<p align="center">
  <strong>Modern, Secure & Scalable Customer Relationship Management Platform</strong><br>
  Built with NestJS Hexagonal Architecture & Angular 22 Domain-Driven Design
</p>

<p align="center">
  <img src="frontend/public/images/dashboard-thumbnail.jpg" alt="OpenCRM Dashboard Mockup" width="100%" />
</p>

---

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

## Data Architecture & Entity-Relationship Diagram (ERD)

The OpenCRM database is designed with a multi-tenant, normalized relational schema in MySQL 8.4. Every domain entity is partitioned by `org_id` for multi-tenant isolation, supports soft deletion (`deleted_at`), and includes indexing strategies for high-frequency queries.

```mermaid
erDiagram
    USERS ||--o{ CUSTOMERS : "assigned to"
    USERS ||--o{ OPPORTUNITIES : "owns"
    USERS ||--o{ INTERACTIONS : "conducts"
    CUSTOMERS ||--o{ CONTACTS : "has"
    CUSTOMERS ||--o{ OPPORTUNITIES : "originates"
    CUSTOMERS ||--o{ INTERACTIONS : "records"
    CUSTOMERS ||--o{ CUSTOMER_LIST_MEMBERS : "belongs to"
    CUSTOMER_LISTS ||--o{ CUSTOMER_LIST_MEMBERS : "contains"
    CONTACTS ||--o{ INTERACTIONS : "participates in"
    OPPORTUNITIES ||--o{ INTERACTIONS : "associated with"

    USERS {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string email "varchar(255) Unique per tenant"
        string password_hash "varchar(255)"
        string first_name "varchar(100)"
        string last_name "varchar(100)"
        string role "enum: SUPERADMIN, ADMIN, MANAGER, SALES_REP, SUPPORT_AGENT"
        boolean is_active "default true"
        timestamp last_login_at "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete audit"
    }

    CUSTOMERS {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string assigned_owner_id FK "char(36) -> USERS(id)"
        string company_name "varchar(200)"
        string industry "varchar(100) nullable"
        string website "varchar(255) nullable"
        string status "enum: LEAD, PROSPECT, ACTIVE_CUSTOMER, CHURNED, INACTIVE"
        decimal annual_revenue "decimal(15,2) nullable"
        int employee_count "unsigned int nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete audit"
    }

    CONTACTS {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string customer_id FK "char(36) -> CUSTOMERS(id) CASCADE"
        string first_name "varchar(100)"
        string last_name "varchar(100)"
        string title "varchar(100) nullable"
        string email "varchar(255)"
        string phone "varchar(50) nullable"
        boolean is_primary "default false"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete audit"
    }

    OPPORTUNITIES {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string customer_id FK "char(36) -> CUSTOMERS(id)"
        string owner_id FK "char(36) -> USERS(id)"
        string title "varchar(200)"
        decimal amount "decimal(15,2)"
        string currency "char(3) default BRL"
        decimal exchange_rate_to_brl "decimal(12,6) default 1.0"
        string stage "enum: DISCOVERY, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST"
        int probability "tinyint (0-100)"
        date expected_close_date
        timestamp closed_at "nullable"
        string loss_reason "varchar(255) nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete audit"
    }

    INTERACTIONS {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string user_id FK "char(36) -> USERS(id)"
        string customer_id FK "char(36) -> CUSTOMERS(id)"
        string contact_id FK "char(36) -> CONTACTS(id) nullable"
        string opportunity_id FK "char(36) -> OPPORTUNITIES(id) nullable"
        string type "enum: NOTE, CALL, EMAIL, MEETING, TASK"
        string subject "varchar(255)"
        string description "text nullable"
        string outcome "varchar(100) nullable"
        timestamp scheduled_at "nullable"
        timestamp completed_at "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete audit"
    }

    CUSTOMER_LISTS {
        string id PK "char(36) UUID"
        string org_id "char(36) Tenant UUID"
        string name "varchar(150)"
        string description "text nullable"
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMER_LIST_MEMBERS {
        string list_id PK,FK "char(36) -> CUSTOMER_LISTS(id) CASCADE"
        string customer_id PK,FK "char(36) -> CUSTOMERS(id) CASCADE"
        timestamp created_at
    }
```

### Key Relationships & Data Integrity

1. **Multi-Tenancy**: Every business entity contains an `org_id` partition key ensuring tenant boundary isolation.
2. **Customer & Contacts (1:N)**: A customer account can have multiple point-of-contacts with exactly one designated as `is_primary`. Deleting a customer cascades to its contacts.
3. **Customer Lists (N:M)**: Dynamic and static segmented groups of customers for mass mailing and marketing campaigns, connected through the `customer_list_members` junction table.
4. **Sales Pipeline & Opportunities (1:N)**: Deals originate from customer accounts, are assigned to a sales representative owner, and support multi-currency conversion with BRL as baseline.
5. **Customer Interactions Timeline (Polymorphic Association)**: Records calls, notes, direct commercial emails (with file attachments), and mass campaigns. Associated with a Customer, optional Contact, and optional Opportunity.

<p align="center">
  <img src="frontend/public/images/features-thumbnail.jpg" alt="OpenCRM Connected Architecture Modules" width="100%" />
</p>

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
