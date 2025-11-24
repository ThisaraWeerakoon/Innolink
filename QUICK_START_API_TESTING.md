# Quick Start - API Testing

## ⚠️ IMPORTANT: Fix Password Hashes First!

Your SQL script has plain text passwords, but the application uses BCrypt. You need to update the database first.

### Step 1: Update Database Passwords

Run this SQL script to fix the passwords:

```bash
psql -U your_username -d your_database -f fix_passwords.sql
```

Or manually run in your PostgreSQL client:

```sql
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye1p1JE.vJvFY3.N0Hf4h4PlDr4XkQKye'
WHERE email IN (
    'admin@innovest.com',
    'sarah@agritech.com',
    'mike@fintech.io',
    'wayne@capital.com',
    'newbie@invest.com'
);
```

**All test users will now have password: `password123`**

---

## ✅ Step 2: Run the Automated Test Script

The easiest way to test all endpoints:

```bash
./test_api.sh
```

This will test:
- ✅ Database connectivity
- ✅ User authentication
- ✅ Deal creation
- ✅ Access control
- ✅ Complete access request workflow (request → approve → sign NDA → access)
- ✅ User registration

**Requirements:** `curl` and `jq` must be installed. Install jq with: `brew install jq`

---

## 📋 Manual Testing (Quick Commands)

### 1. Test Database Connection

```bash
curl http://localhost:8080/api/public/deals | jq '.'
```

### 2. Login as Sarah (Innovator)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah@agritech.com", "password": "password123"}' | jq '.'
```

Save the token from the response!

### 3. Login as Wayne (Investor)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "wayne@capital.com", "password": "password123"}' | jq '.'
```

### 4. Get Deal Details (as authorized user)

Replace `YOUR_TOKEN` and `DEAL_ID`:

```bash
curl -X GET "http://localhost:8080/api/deals/DEAL_ID/full_details" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

---

## 🗂️ Test User Credentials

After running `fix_passwords.sql`:

| Email | Password | Role | Verified |
|-------|----------|------|----------|
| `admin@innovest.com` | `password123` | ADMIN | ✅ |
| `sarah@agritech.com` | `password123` | INNOVATOR | ✅ |
| `mike@fintech.io` | `password123` | INNOVATOR | ❌ |
| `wayne@capital.com` | `password123` | INVESTOR | ✅ |
| `newbie@invest.com` | `password123` | INVESTOR | ❌ |

---

## 📖 Full Documentation

See [API_TESTING_GUIDE.md](/.gemini/antigravity/brain/e5fa76ff-02e7-4d08-9427-6401de8be557/API_TESTING_GUIDE.md) for comprehensive API documentation with all endpoints and scenarios.
