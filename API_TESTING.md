# API Testing Guide

This guide provides the details for testing the InnoVest Backend APIs. You can use Postman or cURL to send these requests.

**Base URL:** `http://localhost:8080`

## 1. Authentication

### Register a User
*   **Method:** `POST`
*   **URL:** `/api/auth/register`
*   **Body (JSON):**
    ```json
    {
        "email": "innovator@example.com",
        "password": "password123",
        "role": "INNOVATOR"
    }
    ```
    *(Roles: `INNOVATOR`, `INVESTOR`, `ADMIN`)*

### Login
*   **Method:** `POST`
*   **URL:** `/api/auth/login`
*   **Body (JSON):**
    ```json
    {
        "email": "sarah@agritech.com",
        "password": "password123"
    }
    ```
*   **Response:** Returns the `User` object. **Copy the `id` (UUID) from the response.** You will need it for other requests.

---

## 2. Deals

### Create a Deal (Innovator Only)
*   **Method:** `POST`
*   **URL:** `/api/innovator/deals?userId={innovator_user_id}`
*   **Params:** `userId` (The UUID of the logged-in Innovator)
*   **Body (JSON):**
    ```json
    {
        "title": "NextGen AgriTech",
        "teaserSummary": "Revolutionizing farming with AI",
        "targetAmount": 500000.0,
        "industry": "Agriculture"
    }
    ```

### Get Public Deals
*   **Method:** `GET`
*   **URL:** `/api/public/deals`
*   **Response:** List of public deal details.

### Get Private Deal Details (Requires Access)
*   **Method:** `GET`
*   **URL:** `/api/deals/{deal_id}/full_details?userId={user_id}`
*   **Params:** `userId` (The UUID of the user)
*   **Note:** Innovators can see their own deals. Investors need an approved request and signed NDA.

---

## 3. Access Requests (Investors)

### Request Access to a Deal
*   **Method:** `POST`
*   **URL:** `/api/deals/{deal_id}/request?userId={investor_user_id}`
*   **Params:** `userId` (The UUID of the Investor)

### Approve Access Request (Innovator Only)
*   **Method:** `PUT`
*   **URL:** `/api/innovator/requests/{request_id}?userId={innovator_user_id}`
*   **Params:** `userId` (The UUID of the Innovator who owns the deal)

### Sign NDA (Investor Only)
*   **Method:** `POST`
*   **URL:** `/api/investor/requests/{request_id}/sign-nda?userId={investor_user_id}`
*   **Params:** `userId` (The UUID of the Investor)

---

## 4. Documents

### Download Document
*   **Method:** `GET`
*   **URL:** `/api/documents/{document_id}/download?userId={user_id}`
*   **Params:** `userId` (The UUID of the user)
*   **Note:** Returns a PDF file.
