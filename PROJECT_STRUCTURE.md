# System Architecture Reference

This document serves as a comprehensive guide to the project structure, architectural patterns, and technology stack of the **Node.js App Template**. It is designed to provide context for both developers and AI agents.

## 📁 Directory Tree

```text
.
├── docs                        # Project documentation (Guides, API docs)
├── scripts                     # Development utility scripts
│   ├── templates               # Boilerplate templates for module generation
│   └── generate-module.ts      # CLI tool to scaffold new modules
├── src                         # Source code
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # Entry point (Server initialization & graceful shutdown)
│   ├── common                  # Shared resources
│   │   ├── constants           # Global constants (e.g., Response Codes)
│   │   ├── middleware          # Global and shared middlewares
│   │   └── utils               # Helper functions and utilities
│   ├── config                  # Configuration management (Env, Logger, DB)
│   ├── infrastructure          # External service integrations
│   │   ├── audit               # Audit logging service
│   │   ├── database            # Database client and schema (Drizzle ORM)
│   │   ├── messaging           # Message broker integrations
│   │   ├── queue               # Task queue integrations
│   │   └── workflow            # Workflow engine integrations
│   ├── loaders                 # App initialization logic (Express, DB)
│   ├── modules                 # Feature-based modular business logic
│   └── routes                  # Central API route registration
├── drizzle.config.ts           # Drizzle ORM configuration
├── eslint.config.mjs           # ESLint configuration
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🏗️ Architectural Pattern: Feature Modules

The project is organized into autonomous **Modules** located in `src/modules`. Each module follows a versioned structure and a strict **Layered Architecture**.

### 🧩 Module File Responsibilities

| File | Responsibility | Role in Architecture |
| :--- | :--- | :--- |
| **`[module].module.ts`** | Assembly & Wiring | The **Composition Root**. Handles instantiation and **Dependency Injection**. |
| **`[module].controller.ts`** | Request Handling | Parses HTTP requests, calls UseCases, and sends API responses. |
| **`[module].routes.ts`** | Routing & Docs | Defines API endpoints and attaches Swagger documentation. |
| **`[module].repository.ts`** | Data Access | Encapsulates Drizzle ORM logic to interact with the database. |
| **`[module].validation.ts`** | Schema Definition | Defines Joi schemas for validating request bodies and params. |
| **`[module].dto.ts`** | Type Definitions | Defines TypeScript interfaces for data passed across layers. |
| **`usecase/[action].usecase.ts`** | Business Logic | The core domain logic. Isolated from framework-specific code. |

### 💉 Dependency Injection (`module.ts`)

The `module.ts` file is critical as it implements the Dependency Injection pattern without a heavy framework. It manually wires up the hierarchy:
1.  **Repository** is instantiated (often as a singleton).
2.  **UseCase** is instantiated, accepting the Repository as a constructor argument.
3.  **Controller** is instantiated, accepting the UseCase(s) as constructor arguments.
4.  **Routes** are built, accepting the Controller to map endpoints to methods.

This ensures that business logic (UseCases) can be easily mocked for unit testing by passing a mock Repository.

## 🚀 Application Lifecycle

### 1. Entry Point (`src/server.ts`)
- Initializes core infrastructure (Database).
- Creates the Express application via `createApp()`.
- Starts the HTTP server.
- Handles graceful shutdown (`SIGTERM`, `SIGINT`).

### 2. App Setup (`src/app.ts`)
- Instantiates Express.
- Delegates middleware and route setup to `loaders/express.loader.ts`.

### 3. Loaders (`src/loaders/`)
- **`express.loader.ts`**: Configures global middleware (CORS, Parser, Logging, Security) and registers the main router.
- **`db.loader.ts`**: Manages the database connection lifecycle.

## 🛠️ Developer Tools

### 📦 Module Generator
To ensure architectural consistency, use the custom generator script located in `scripts/generate-module.ts`.

**Usage:**
```bash
npm run generate:module <module_name> [v1|v2|...]
```

**What it does:**
- Validates the module name for alphanumeric consistency.
- Creates the standardized folder structure in `src/modules`.
- Scaffolds all 7 boilerplate files using templates.
- Correctly formats class names (PascalCase) and property names (camelCase).
- Provides the registration snippet to add to your main router.

## 📦 Dependency Summary

Mapped from `package.json`:

| Library | Purpose |
| :--- | :--- |
| **express** | Web framework for building APIs. |
| **drizzle-orm** | Type-safe database interactions. |
| **pg** | PostgreSQL client. |
| **pino** | Scalable logging for production. |
| **joi** | Request body and parameter validation. |
| **jsonwebtoken** | JWT-based authentication. |
| **bcryptjs** | Password hashing and security. |
| **cors** / **cookie-parser** | Standard web security and utility middleware. |
| **csrf-csrf** | CSRF protection for sensitive routes. |
| **swagger-ui-express** | Interactive API documentation. |
| **tsx / ts-node-dev** | TypeScript execution and development hot-reloading. |
