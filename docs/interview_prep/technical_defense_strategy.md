# Technical Defense Strategy (Principal Engineer Level)
**Project: InnoLink**

> **Objective:** This document performs a ruthless technical audit of your codebase to prepare you for rigorous engineering interviews (LSEG, WSO2, Synergen, etc.). Use this to demonstrate deep knowledge of *what* you built and *why*.

---

## 1. Architecture & Design Decisions

### Pattern: Layered Monolith with Async Offloading
*   **Identification:** It is a **Layered Monolith**.
    *   *Evidence:* `controller`, `service`, `repository` packages are co-located in one JAR.
    *   *Why not Microservices?* "Given the team size (1 developer) and domain complexity (CRUD + Document Search), the operational overhead of microservices (distributed tracing, network latency, consistency) outweighed the benefits. A Monolith provides **ACID integrity** by default."
*   **Coupling & Cohesion**:
    *   **High Cohesion (Good):** `RagIngestionService.java`. It does one thing: processes PDFs and vectorizes them. It doesn't know about HTTP or User Auth.
    *   **Tight Coupling (Bad):** `DealService.java` is coupled to `RagIngestionService`. The `uploadPitchDeck` method explicitly calls `ragIngestionService.ingestPitchDeck()`.
    *   *Improvement:* "I should have used **Spring Events** (`applicationEventPublisher.publishEvent(new DocumentUploadedEvent())`) to decouple them. This would allow the RAG service to just listen for events, making the system extensible."

### Diagram Description
*   **Load Balancer:** Azure App Service Load Balancer (Layer 7).
*   **Reverse Proxy:** In production, Azure handles SSL termination. In code, `SecurityConfig.java` acts as the software firewall.

---

## 2. Java Internals & Concurrency

### Concurrency & Thread Safety
*   **Singleton Beans:** All your Services (`DealService`, `RagIngestionService`) are **Spring Singletons**.
    *   *Thread Safety:* They are stateless (no instance fields holding request data), making them thread-safe.
*   **Async Processing:**
    *   *File:* `RagIngestionService.java` user `@Async` on `ingestPitchDeck`.
    *   *The Trap:* "By default, `@Async` uses a `SimpleAsyncTaskExecutor` which spawns a new thread for *every* task. If 1,000 users upload files simultaneously, I will OOM (Out of Memory) the server."
    *   *The Fix:* "Define a custom `ThreadPoolTaskExecutor` bean with a fixed pool size (e.g., 10 threads) to apply backpressure."

### Memory Management
*   **Stream Handling:**
    *   *File:* `RagIngestionService.java`.
    *   *Observation:* You used `try (InputStream inputStream = ...)` (Try-with-Resources).
    *   *Defense:* "This is critical because `InputStream` holds a file descriptor. If not closed, we leak OS handles, eventually causing 'Too many open files' error."

---

## 3. Database & Transaction Management

### N+1 Query Problem (Critical Trap)
*   *File:* `Deal.java`
*   *The Flaw:* `private java.util.List<DealDocument> documents;` uses `FetchType.EAGER` (Line 46).
*   *The Impact:* "Every time I load a `Deal`, Hibernate indiscriminately joins and loads all 50+ documents associated with it, even if I just needed the `title`. If I fetch a list of 100 deals, I might be pulling 5,000 document rows."
*   *The Defense:* "I chose EAGER for MVP simplicity. In production, I would change this to `LAZY` and use a `JOIN FETCH` query in the Repository (`@Query("SELECT d FROM Deal d JOIN FETCH d.documents")`) specifically when I need the documents."

### ACID & Transactions
*   *File:* `DealService.java` - `uploadPitchDeck` method.
*   *The Flaw:* You perform the Azure Upload (IO operation) *inside* the `@Transactional` method.
*   *Why is this bad?* "Database transactions hold a connection from the pool. If Azure takes 5 seconds to upload, that DB connection is blocked for 5 seconds. If 50 users upload, the DB pool is exhausted, and *read* operations (like Login) will start timing out."
*   *The Fix:* "Perform the upload *before* entering the transactional boundary."

---

## 4. API & Network Communication

### REST Design
*   *File:* `DealController.java`.
*   *Stateless:* The API is stateless. No `HttpSession` is used.
*   *Auth:* `Bearer Token` (JWT).
    *   *Why?* "Cookies are vulnerable to CSRF. Tokens are easier for mobile apps and cross-domain setups."

### HTTP Status Codes
*   *Observation:* You largely use `ResponseEntity.ok()` (200) or exceptions (500).
*   *Critique:* `uploadPitchDeck` returns `200 OK`. It *should* return `202 Accepted` since the RAG processing happens asynchronously in the background.

---

## 5. Frontend Optimization (React)

### State Management
*   *File:* `AuthContext.jsx`.
*   *Prop Drilling:* You avoided it by using Context API (`useAuth`).
*   *Risk:* `localStorage` usage.
    *   *Trap:* "You store the JWT in `localStorage`. This is vulnerable to XSS (Cross-Site Scripting). If an attacker injects a script, they can read `localStorage.getItem('token')`."
    *   *Defense:* "True. For high security (Banking/Fintech), I would store the token in an **HttpOnly Cookie** which JavaScript cannot read."

### Performance
*   *Memoization:* `DealRoom.jsx` re-renders every time the parent re-renders.
    *   *Fix:* Use `React.memo(DealCard)` for the list items so they don't re-render if their props haven't changed.

---

## 6. Security & DevOps

### OWASP Top 10
*   **Injection:** `DealController.java` uses `entityManager.createNativeQuery`.
    *   *Risk:* If you concatenated strings (`"SELECT... " + input`), it would be SQL Injection.
    *   *Defense:* "I use Parameterized Queries (or relying on JPA which handles it), ensuring inputs are escaped."
*   **Broken Access Control:** `DealService.getPrivateDeal` forces a check: `if (!innovator.equals(user) && !hasAccess) throw Exception`. This prevents IDOR.

### Docker & DevOps
*   *File:* `Dockerfile`.
*   *Optimization:* It is a **Multi-Stage Build**.
    *   *Why?* "Stage 1 (Maven) has all the build tools and is huge (600MB). Stage 2 (JRE) effectively discards the Maven bloat, resulting in a tiny (<150MB) runtime image. This reduces attack surface and saves bandwidth."

---

## 7. The "Grill Me" Simulation

**Q1: "You marked `documents` as `EAGER` fetch. If we have 10,000 deals, calling `findAll()` will crash the heap. How do you fix this without changing the generic `findAll()` method?"**
*   **Answer:** "I would define a **Projection** interface (e.g., `DealSummaryView`) that only contains the fields I need (Title, ID) and use that in the Repository. Alternatively, I can use an **EntityGraph** to override the EAGER fetch strategy at runtime for that specific query."

**Q2: "In `RagIngestionService`, what happens if the PDF parsing throws a RuntimeException? Does the `ingestPitchDeck` method retry?"**
*   **Answer:** "No. Since it's `@Async` and void return, the exception is lost (logged to console but not caught by caller). The transaction in `DealService` committed long before this async method finished. To fix this, I need a 'Dead Letter Queue' or a `status` field in the DB (e.g., `RAG_FAILED`) that I update in a `catch` block so the user knows it failed."

**Q3: "Your `AuthContext` uses an Axios interceptor to attach tokens. What happens if the token expires while the user is filling out a long form?"**
*   **Answer:** "Currently, the request would fail with `403/401`. The user loses their data. A robust solution would differ: The interceptor should catch the 401 error, use a 'Refresh Token' to get a new Access Token silently, retry the failed request, and only logout if the Refresh Token is also expired."
