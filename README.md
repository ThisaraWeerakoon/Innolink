# InnoVest Backend

Backend service for InnoVest, a matchmaking platform connecting Accredited Investors with Startups.

## Tech Stack
- Java 17
- Spring Boot 3.2.3
- PostgreSQL
- Spring Security (JWT)
- Maven

## Getting Started

1.  **Database Setup**:
    - Ensure PostgreSQL is running.
    - Create a database named `innovest`.
    - Run the SQL scripts to create tables.

2.  **Build**:
    ```bash
    mvn clean install
    ```

3.  **Run**:
    ```bash
    mvn spring-boot:run
    ```
