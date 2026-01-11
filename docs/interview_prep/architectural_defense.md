# Architectural Defense Document
**Project: InnoLink ("Tinder for Startups")**

> **Disclaimer:** This document is generated based on a static analysis of your codebase (Spring Boot Backend, React Frontend, PostgreSQL DB, Azure Deployment). Use this to defend your design choices in a technical interview.

---

## 1. High-Level Architecture & Flow

### System Design
*   **Architecture Pattern:** **N-Tier Monolithic** architecture (Client-Server).
    *   **Tier 1 (Presentation):** React SPA (Single Page Application) running on browser/Azure Static Web Apps.
    *   **Tier 2 (Logic):** Spring Boot Backend (REST API) hosted on Azure App Service.
    *   **Tier 3 (Data):** PostgreSQL Database with `pgvector` extension for AI features.
    *   **Infrastructure:** Containerized using Docker.
*   **Why not Microservices?**: "For this stage of the startup (MVP to Series A), a Monolith reduces operational overhead (deployment complexity, inter-service latency, distributed tracing) and allows faster velocity. I structured it with clear package boundaries (`com.innovest.domain`, `.service`, `.controller`) so it can be easily split into services (e.g., extracting an `AuthService`) later if needed."

### Data Flow Example: "Investor Requests Access to a Deal"
1.  **UI (React):** User clicks "Request Access" in `DealRoom.jsx`.
2.  **Frontend Logic:** `api.post('/deals/{id}/request')` is triggered. The **Axios Interceptor** (`AuthContext.jsx`) automatically injects the JWT `Authorization: Bearer <token>` header.
3.  **API Gateway/Controller:** Request hits `AccessRequestController` (mapped via `DealController` or similar). Spring Security filter chain validates the JWT first.
4.  **Service Layer:** `DealService.requestAccess()` is called.
    *   **Validation:** Checks if deal exists, if user is an Investor, if request already exists.
    *   **Transaction:** `@Transactional` ensures atomicity.
5.  **Database:** `AccessRequest` entity is saved to the `access_requests` table.
6.  **Response:** 200 OK with the updated status returning to Frontend. UI updates from "Request Access" to "Pending".

### Whiteboard Diagram Description
*   **Left:** "React Frontend" box. Arrow labeled "JSON/HTTPS" pointing right.
*   **Center:** "Spring Boot API" box. Inside it, draw layers: `Controller` -> `Service` -> `Repository`.
*   **Right:** "PostgreSQL" cylinder.
*   **Bottom:** "Azure Blob Storage" bucket (connected to Service layer).
*   **Security Wrapper:** Draw a box around the backend called "Spring Security / JWT Filter".

---

## 2. Database & Data Modeling

### Schema Analysis
*   **Normalization:** Your schema is largely **3rd Normal Form (3NF)**.
    *   *Proof:* Repeating groups (like document lists) are moved to their own table (`deal_documents`). Columns depend only on the primary key.
*   **Entity Mappings:**
    *   `users` table: Central identity.
    *   `deals`: Foreign Key (`innovator_id`) -> `users`.
*   **Polymorphism (Strategy):**
    *   *Observation:* You have `innovator_profiles` and `investor_profiles` linked 1:1 to `users`. This is "Table-Per-Type" inheritance modeling handled manually.
    *   *Why?* It keeps the `users` table clean (just auth data) while allowing vastly different profile fields for investors vs innovators without NULLable columns cluttering one table.

### Key Relationships
1.  **Many-to-Many with Attributes:** The relationship between **Deals** and **Investors** is *Not* a simple `@ManyToMany`.
    *   *Code Evidence:* `AccessRequest.java` entity.
    *   *Explanation:* "An investor doesn't just 'have' a deal. The relationship has state (`status`, `nda_signed`, `signed_at`). Therefore, I promoted the relationship to a first-class Entity (`AccessRequest`) that links `User` and `Deal`."

### Performance & Indexing
*   **Current Indexes:** `setup.sql` defines indexes on `deals(industry)`, `deals(status)`, and `access_requests(investor_id)`.
*   **Where to add Indexes (Interview Gold):**
    *   *Scenario:* "If we have 1M documents, searching text will be slow."
    *   *You Added:* `setup_rag.sql` creates an **HNSW Index** (`embeddings_embedding_idx`) on the `embedding` vector column. This enables Approximate Nearest Neighbor (ANN) search, critical for your RAG feature scalability.

---

## 3. Backend Engineering & Design Patterns

### Design Patterns Used
1.  **Strategy Pattern:** `StorageService` interface.
    *   *Files:* `StorageService.java`, `AzureBlobStorageService.java`, `FileSystemStorageService.java`.
    *   *Explanation:* "I used an interface for file storage. This allows me to swap implementation strategies (Local FS for dev, Azure Blob for prod) using Spring's `@Profile` annotation without changing a single line of business logic in `DealService`."
2.  **Repository Pattern:** `DealRepository` extends `JpaRepository`. Abstracts data access logic.
3.  **DTO (Data Transfer Object):** `DealDTO`, `PublicDealDTO`.
    *   *File:* `DealMapper.java` (inferred) or manual mapping in Controller.
    *   *Why?* "To decouple the internal database entity from the external API contract. I don't want to expose my internal `User` entity (with password hash) to the frontend."

### SOLID Principles
*   **Single Responsibility Principle (SRP) [Followed]:** `RagIngestionService` (seen in recent tasks) handles *only* ingestion logic, while `DealService` handles business rules.
*   **Dependency Inversion Principle (DIP) [Followed]:** `DealService` depends on the `StorageService` *interface*, not the specific `AzureBlobStorageService` class.
*   **Open/Closed [Violated/Critique]:** In `DealService`, the `uploadPitchDeck` method has logic mixed for saving metadata AND triggering RAG. If we add 5 more post-upload steps (email, notification, analytics), this method keeps growing.
    *   *Better approach:* Use Spring Events (`ApplicationEventPublisher`). Publish `DocumentUploadedEvent` and have listeners handle RAG, Email, etc.

### Security
*   **Mechanism:** JWT (JSON Web Tokens). Stateless.
*   **Files:** `SecurityConfig.java`, `JwtAuthenticationFilter.java`.
*   **Authorization:**
    *   **RBAC:** `hasRole('ADMIN')` in controllers.
    *   **Resource-Level Auth:** In `DealService.getPrivateDeal(dealId, userId)`, you explicitly check: `if (deal.innovator.id == userId || accessRequest.isApproved)`. This prevents "IDOR" (Insecure Direct Object Reference) attacks where user A tries to access user B's deal by guessing the ID.

---

## 4. Frontend Architecture (React)

### State Management
*   **Context API:** `AuthContext.jsx`.
    *   *Why?* "User session is global. I didn't need the complexity of Redux for just auth state."
*   **Local State:** `useState` in `DealRoom.jsx` for fetching deal-specific data.

### Performance
*   **Lazy Loading:** Vite does code splitting by default.
*   **Optimistic UI:** (Not explicitly seen, but good to mention if you have it) Updating the "Like" or "Request" button immediately before the API returns.
*   **Rerender Optimization:** Using `key` props correctly in lists (`{deal.documents.map(doc => <div key={doc.id} ...>)}`) prevents React from trashing the DOM unnecessarily.

### Component Structure
*   **Smart Component:** `DealRoom.jsx`. It contains the `useEffect` hook to fetch data, handles loading states, and contains business logic (checking access status).
*   **Dumb (Presentational) Component:** Components like buttons or layout wrappers that just receive props and render HTML.

---

## 5. Cloud & DevOps (Azure)

### Infrastructure
*   **Deployment:** CI/CD via **GitHub Actions** (`deploy-backend.yml`).
    *   **Build:** Maven -> JAR -> Docker Build.
    *   **Registry:** Docker Hub.
    *   **Run:** Azure Web App for Containers pulls the image.
*   **Configuration:** Environment variables (`SPRING_PROFILES_ACTIVE=prod`, `DB_URL`) are injected via Azure App Service configuration, keeping secrets out of code (`12-Factor App` principle).

### Scalability
*   **User Spike (10k users):**
    *   **Fail Point 1:** Database connections. PostgreSQL has a max connection limit.
        *   *Fix:* Add **PgBouncer** (connection pooling) or upgrade Azure SQL tier.
    *   **Fail Point 2:** Vector Search (CPU intensive).
        *   *Fix:* Move `RagSearchService` to a separate microservice or Serverless Function so heavy AI searches don't slow down the main login/api threads.
    *   **Scaling the API:** Easy. Since the backend is **Stateless** (JWT), we can just spin up 5 more instances of the Docker container (Horizontal Scaling) behind a Load Balancer.

---

## 6. The "Grill Me" Section (Difficult Questions)
*Be prepared to answer these.*

**Q1: "I see you used `@Transactional` in your Service layer. valid. But what happens if the `storageService.uploadFile()` (which calls Azure) takes 30 seconds and then the database save fails?"**
*   **The Trap:** You are holding a database transaction open while making a slow network call to Azure. This kills DB performance (blocking connections).
*   **The Defense:** "You are right. That is a potential bottleneck. Ideally, I should upload the file *outside* the transaction, get the URL, and *then* open the transaction to save the metadata. I kept it simple for consistency, but for high scale, I would decouple them."

**Q2: "Why do you cast vectors to `varchar` in your debug endpoint (`SELECT cast(embedding...)`)? Isn't that inefficient?"**
*   **The Defense:** "That corresponds *only* to a `/debug` endpoint I built to visually verify the RAG pipeline. It is **not** used in production search logic. The production logic uses the native `pgvector` operators (cosine similarity) which are highly optimized."

**Q3: "In `DealService.getPrivateDeal`, you create a `hasAccess` boolean and check multiple conditions manually. Why not use Spring Security's `@PreAuthorize` annotations?"**
*   **The Defense:** "@PreAuthorize works great for Roles (Admin vs User), but it struggles with complex *Resource-Level* logic (e.g., 'User must have a record in `AccessRequest` table with status APPROVED linked to this specific `dealId`'). Writing that in SpEL (Spring Expression Language) inside an annotation is messy and hard to debug. I prefer explicit Java logic in the service layer for complex business rules."
