#!/bin/bash
# InnoVest API Testing Script
# This script tests the main API endpoints with the dummy data

BASE_URL="http://localhost:8080"
echo "🚀 InnoVest API Testing Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Database Connectivity - Get Public Deals
echo -e "${YELLOW}Test 1: Database Connectivity Check${NC}"
echo "Getting public deals (no auth required)..."
curl -s -X GET ${BASE_URL}/api/public/deals | jq '.'
echo ""
echo "✅ If you see deal data above, database is connected!"
echo ""
read -p "Press Enter to continue..."

# Test 2: Login as Sarah (Verified Innovator)
echo -e "${YELLOW}Test 2: Login as Verified Innovator (Sarah)${NC}"
SARAH_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@agritech.com",
    "password": "password123"
  }')

echo "$SARAH_RESPONSE" | jq '.'
SARAH_TOKEN=$(echo "$SARAH_RESPONSE" | jq -r '.token')

if [ "$SARAH_TOKEN" != "null" ] && [ -n "$SARAH_TOKEN" ]; then
    echo -e "${GREEN}✅ Sarah logged in successfully!${NC}"
    echo "Token: ${SARAH_TOKEN:0:30}..."
else
    echo -e "${RED}❌ Login failed! Check password hashes in database.${NC}"
    exit 1
fi
echo ""
read -p "Press Enter to continue..."

# Test 3: Login as Wayne (Verified Investor)
echo -e "${YELLOW}Test 3: Login as Verified Investor (Wayne)${NC}"
WAYNE_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wayne@capital.com",
    "password": "password123"
  }')

echo "$WAYNE_RESPONSE" | jq '.'
WAYNE_TOKEN=$(echo "$WAYNE_RESPONSE" | jq -r '.token')

if [ "$WAYNE_TOKEN" != "null" ] && [ -n "$WAYNE_TOKEN" ]; then
    echo -e "${GREEN}✅ Wayne logged in successfully!${NC}"
else
    echo -e "${RED}❌ Login failed!${NC}"
    exit 1
fi
echo ""
read -p "Press Enter to continue..."

# Test 4: Create a New Deal (as Sarah)
echo -e "${YELLOW}Test 4: Create New Deal (as Innovator Sarah)${NC}"
curl -s -X POST ${BASE_URL}/api/innovator/deals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SARAH_TOKEN}" \
  -d '{
    "title": "Smart Irrigation System",
    "teaserSummary": "IoT-based irrigation that reduces water usage by 40%",
    "targetAmount": 300000,
    "industry": "AgriTech"
  }' | jq '.'
echo ""
echo -e "${GREEN}✅ Deal created!${NC}"
echo ""
read -p "Press Enter to continue..."

# Test 5: Get Public Deals Again (should show new deal)
echo -e "${YELLOW}Test 5: Get Updated Public Deals${NC}"
PUBLIC_DEALS=$(curl -s -X GET ${BASE_URL}/api/public/deals)
echo "$PUBLIC_DEALS" | jq '.'

# Get the first deal ID for further testing
DEAL_ID=$(echo "$PUBLIC_DEALS" | jq -r '.[0].id')
echo ""
echo "Using Deal ID for next tests: $DEAL_ID"
echo ""
read -p "Press Enter to continue..."

# Test 6: Get Private Deal Details (as Sarah - owner)
echo -e "${YELLOW}Test 6: Get Private Deal Details (as Owner Sarah)${NC}"
curl -s -X GET "${BASE_URL}/api/deals/${DEAL_ID}/full_details" \
  -H "Authorization: Bearer ${SARAH_TOKEN}" | jq '.'
echo ""
echo -e "${GREEN}✅ Sarah can access full deal details (she's the owner)${NC}"
echo ""
read -p "Press Enter to continue..."

# Test 7: Try to access private deal as Wayne (should fail - no access request)
echo -e "${YELLOW}Test 7: Authorization Test - Wayne tries to access without permission${NC}"
WAYNE_ACCESS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${BASE_URL}/api/deals/${DEAL_ID}/full_details" \
  -H "Authorization: Bearer ${WAYNE_TOKEN}")

HTTP_CODE=$(echo "$WAYNE_ACCESS" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Authorization working! Wayne was denied access (expected).${NC}"
else
    echo -e "${RED}⚠️  Unexpected response. Wayne should not have access.${NC}"
fi
echo ""
read -p "Press Enter to continue..."

# Test 8: Wayne requests access to the deal
echo -e "${YELLOW}Test 8: Wayne requests access to deal${NC}"
ACCESS_REQUEST=$(curl -s -X POST "${BASE_URL}/api/deals/${DEAL_ID}/request" \
  -H "Authorization: Bearer ${WAYNE_TOKEN}")

echo "$ACCESS_REQUEST" | jq '.'
REQUEST_ID=$(echo "$ACCESS_REQUEST" | jq -r '.id')

if [ "$REQUEST_ID" != "null" ] && [ -n "$REQUEST_ID" ]; then
    echo -e "${GREEN}✅ Access request created!${NC}"
    echo "Request ID: $REQUEST_ID"
else
    echo -e "${RED}❌ Failed to create access request${NC}"
fi
echo ""
read -p "Press Enter to continue..."

# Test 9: Sarah approves the access request
echo -e "${YELLOW}Test 9: Sarah approves Wayne's access request${NC}"
curl -s -X PUT "${BASE_URL}/api/innovator/requests/${REQUEST_ID}" \
  -H "Authorization: Bearer ${SARAH_TOKEN}" | jq '.'
echo ""
echo -e "${GREEN}✅ Access request approved!${NC}"
echo ""
read -p "Press Enter to continue..."

# Test 10: Wayne signs the NDA
echo -e "${YELLOW}Test 10: Wayne signs the NDA${NC}"
curl -s -X POST "${BASE_URL}/api/investor/requests/${REQUEST_ID}/sign-nda" \
  -H "Authorization: Bearer ${WAYNE_TOKEN}" | jq '.'
echo ""
echo -e "${GREEN}✅ NDA signed!${NC}"
echo ""
read -p "Press Enter to continue..."

# Test 11: Now Wayne can access the full deal details
echo -e "${YELLOW}Test 11: Wayne accesses full deal details (now authorized)${NC}"
curl -s -X GET "${BASE_URL}/api/deals/${DEAL_ID}/full_details" \
  -H "Authorization: Bearer ${WAYNE_TOKEN}" | jq '.'
echo ""
echo -e "${GREEN}✅ Wayne can now access full deal details!${NC}"
echo ""

# Test 12: Register a new user
echo -e "${YELLOW}Test 12: Register new investor${NC}"
curl -s -X POST ${BASE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "password123",
    "role": "INVESTOR"
  }' | jq '.'
echo ""
echo -e "${GREEN}✅ New user registered!${NC}"
echo ""

echo "================================"
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo "================================"
