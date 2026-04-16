# Node.js REST API Architecture & Standards Guide

This document serves as the single source of truth for the project's architecture, coding standards, and usage patterns. It is intended for both human developers and AI coding assistants to ensure consistency across the codebase.

---

## 🏗 Project Architecture

The project follows a **Layered Architecture** with a clear separation of concerns.

### 📁 Directory Structure

- **`src/`**: Source code of the application.
  - **`app.ts`**: Express application factory.
  - **`server.ts`**: Entry point that starts the HTTP server.
  - **`loaders/`**: Initialization logic (Express, Database, etc.).
    - `express.loader.ts`: Configures global middleware, routes, and error handlers.
  - **`modules/`**: Domain-driven modules (e.g., `user`, `auth`).
    - `v1/`: Versioning for each module.
      - `user.controller.ts`: Handles incoming HTTP requests and responses.
      - `user.routes.ts`: Defines API endpoints and maps them to controllers.
      - `user.validation.ts`: Joi schemas for request validation.
      - `user.dto.ts`: Data Transfer Objects (interfaces).
      - `repository/`: Data access logic (Database queries).
      - `usecase/`: Business logic (Service layer).
  - **`common/`**: Shared code used across the application.
    - **`middleware/`**: Global or shared Express middleware.
    - **`utils/`**: Utility classes and helper functions.
    - **`constants/`**: Shared constants like response codes.
  - **`infrastructure/`**: Core infrastructure implementations.
    - `database/`: DB connection and ORM config (Drizzle/Prisma).
    - `messaging/`: Message broker logic (RabbitMQ).
    - `queue/`: Background task processing (BullMQ).
    - `workflow/`: Workflow engine logic (Camunda).
  - **`routes/`**: Main router that aggregates all module routes.
  - **`config/`**: Environment variable and logger configuration.

---

## 📡 API Response Standards

All API responses must follow a consistent JSON structure to ensure predictable behavior for frontend clients and automated tools.

### 📝 Response Object Structure

```json
{
  "statusCode": 200,          // HTTP Status Code (Number)
  "code": "SUCCESS",           // Predefined Response Code (String)
  "status": "success",         // "success" or "error" (String)
  "message": "Operation...",   // Human-readable message (String)
  "data": { ... }              // Payload (Always present, {} or [] if empty)
}
```

### 🛠 Using `ApiResponse` Utility

Always use the `src/common/utils/api-response.ts` utility to send responses from controllers or middleware.

#### 🟢 Success Responses
```typescript
ApiResponse.success(res, {
  data: user,
  message: 'User created successfully',
  statusCode: 201, // Optional, default 200
  code: ResponseCode.CREATED // Optional, default SUCCESS
});
```

#### 🔴 Error Responses
```typescript
ApiResponse.error(res, {
  message: 'Invalid credentials',
  statusCode: 401, // Optional, default 500
  code: ResponseCode.UNAUTHORIZED, // Optional, default INTERNAL_SERVER_ERROR
  data: { attemptsRemaining: 3 } // Optional extra info
});
```

---

## 🚦 Execution Flow & Middleware

### Global Middleware Chain (in order)
1. Request Parsing (`express.json`, `express.urlencoded`).
2. CORS (`cors`).
3. Request Context (`requestContextMiddleware`): Generates `requestId` and stores context in `AsyncLocalStorage`.
4. Logging (`loggingMiddleware`): Logs incoming requests and response times.
5. API Encryption (`encryptionMiddleware`): Handles transparent request decryption and response encryption (if enabled).
6. Routes: Version-prefixed routes.
7. 404 Handler: Catches unknown routes and returns a structured "NOT_FOUND" response.
8. Error Handler (`errorMiddleware`): Catches all exceptions and returns a structured "INTERNAL_SERVER_ERROR".

### Request Validation
Use the `validate` middleware located in `src/common/middleware/validation.middleware.ts` with Joi schemas.

```typescript
router.post('/', validate(createUserSchema), controller.createUser);
```

## 🔐 API Encryption Layer

The application features a built-in encryption layer for request and response bodies using **AES-256-CBC**.

### Configuration
- **`ENCRYPT`**: Set to `true` to enable global encryption.
- **`ENCRYPTION_KEY`**: A secure string used as the master key (hashed to 32 bytes internally).

### How it Works
1.  **Incoming Requests**: If encryption is enabled, the middleware looks for a `data` field in the request body (e.g., `{ "data": "iv:encrypted_text" }`). It decrypts the content and replaces `req.body` with the decrypted JSON object.
2.  **Outgoing Responses**: If encryption is enabled, all successful responses (except specifically excluded ones) are automatically encrypted. The response will have a custom header `x-api-encrypted: true` and a body format of `{ "data": "iv:encrypted_text" }`.

### 🛠 Using the Crypto Utility
While the middleware handles most cases automatically, you can use the `CryptoUtil` directly:
```typescript
import { CryptoUtil } from '../common/utils/crypto.util';

const encrypted = CryptoUtil.encrypt('secret data');
const decrypted = CryptoUtil.decrypt(encrypted);
```

---

## 🔧 AI Agent Instructions

When working on this codebase as an AI Agent:

1.  **Strict Typing**: Always use TypeScript and define interfaces for DTOs and Data payloads.
2.  **Standard Responses**: Never use `res.json()` directly. Always use `ApiResponse.success` or `ApiResponse.error`.
3.  **Error Handling**: Use `try-catch` blocks in controllers and pass errors to `next(error)`.
4.  **Consistency**: Ensure that all new modules follow the same internal structure (Controller -> UseCase -> Repository).
5.  **Documentation**: If you change the core architecture or response standards, update this guide immediately.

---

## 📌 Standardized Response Codes (`ResponseCode`)

Common codes found in `src/common/constants/response-codes.ts`:
- `SUCCESS`, `CREATED`, `BAD_REQUEST`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`, `CONFLICT`.
