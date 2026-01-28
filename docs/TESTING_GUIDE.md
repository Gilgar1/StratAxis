# Phase 4 API Testing Guide

This guide provides ready-to-use curl commands and expected responses for testing all Phase 4 endpoints.

## Prerequisites

1. Start the backend server:
   ```bash
   cd backend
   uvicorn src.main:app --reload --port 8000
   ```

2. Ensure database is running and populated with test data

3. Set environment variables (or use defaults)

---

## 1. Authentication

### Register a New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+237123456789"
  }'
```

**Expected:** 201 Created with user object (role: FREE_USER)

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser@example.com&password=SecurePassword123!"
```

**Expected:** 200 OK with `access_token` and `refresh_token`

**Save the token:**
```bash
export TOKEN="<your_access_token_here>"
```

---

## 2. Properties API

### List Properties (No Auth Required)
```bash
curl http://localhost:8000/api/properties?limit=5
```

### List Properties with Filters
```bash
curl "http://localhost:8000/api/properties?city=Yaoundé&property_type=apartment&min_price=10000000&max_price=50000000&sort_by=price&sort_order=asc&limit=10"
```

### Search Properties
```bash
curl "http://localhost:8000/api/properties/search?q=Bastos&limit=5"
```

### Get Nearby Properties (Geospatial)
```bash
curl "http://localhost:8000/api/properties/nearby?latitude=3.848&longitude=11.502&radius_km=5&limit=10"
```

### Get Single Property
```bash
# Replace <property_id> with actual UUID
curl http://localhost:8000/api/properties/<property_id>
```

---

## 3. Listings API (Public)

### Get Aggregated Listings
```bash
curl "http://localhost:8000/api/listings?city=Yaoundé&period=monthly&limit=12"
```

### Get Listings Summary
```bash
curl "http://localhost:8000/api/listings/summary?city=Douala&property_type=apartment"
```

---

## 4. Analytics API (Public)

### Get Analytics Overview
```bash
curl http://localhost:8000/api/analytics/overview
```

### Get Overview with Filters
```bash
curl "http://localhost:8000/api/analytics/overview?city=Yaoundé&property_type=house"
```

### Get Trends
```bash
curl "http://localhost:8000/api/analytics/trends?period_type=monthly&limit=12"
```

### Get Trends with City Comparison
```bash
curl "http://localhost:8000/api/analytics/trends?property_type=apartment&compare_cities=true&limit=6"
```

### Get Neighborhood Analytics
```bash
curl "http://localhost:8000/api/analytics/neighborhoods?city=Yaoundé&top_n=10"
```

---

## 5. Predictions API (Public)

### Predict Property Price
```bash
curl -X POST http://localhost:8000/api/predictions/price \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Yaoundé",
    "property_type": "apartment",
    "size": 120,
    "neighborhood": "Bastos",
    "bedrooms": 3,
    "bathrooms": 2
  }'
```

**Expected:** Price prediction with confidence intervals

### Forecast Price Trend
```bash
curl -X POST http://localhost:8000/api/predictions/trend \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Douala",
    "property_type": "house",
    "time_horizon": 6
  }'
```

**Expected:** 6-month forecast with trend direction

### Check Prediction Service Health
```bash
curl http://localhost:8000/api/predictions/health
```

---

## 6. Bookings API (PAID_USER+ Required)

**Note:** First, promote your user to PAID_USER role using admin endpoint (see Admin section)

### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_type": "market_analysis",
    "preferred_date": "2024-02-15",
    "preferred_time": "14:00",
    "notes": "Interested in market analysis for Bastos area"
  }'
```

**Expected:** 201 Created (if PAID_USER) or 403 Forbidden (if FREE_USER)

### List My Bookings
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/bookings
```

### Get Booking Details
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/bookings/<booking_id>
```

### Update Booking
```bash
curl -X PUT http://localhost:8000/api/bookings/<booking_id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_date": "2024-02-20",
    "preferred_time": "10:00",
    "notes": "Changed date due to conflict"
  }'
```

### Cancel Booking
```bash
curl -X DELETE http://localhost:8000/api/bookings/<booking_id> \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 204 No Content

---

## 7. Admin API (ADMIN Required)

**Note:** Create an admin user or promote existing user to ADMIN role

### List All Users
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8000/api/admin/users?limit=20"
```

### List Users by Role
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8000/api/admin/users?role=PAID_USER"
```

### Change User Role
```bash
curl -X PUT http://localhost:8000/api/admin/users/<user_id>/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "PAID_USER"
  }'
```

### Deactivate User
```bash
curl -X DELETE http://localhost:8000/api/admin/users/<user_id> \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### List Data Sources
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/admin/data-sources
```

### Create Data Source
```bash
curl -X POST http://localhost:8000/api/admin/data-sources \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestScraper",
    "type": "scraper",
    "source_url": "https://example.cm",
    "is_active": true,
    "config": {"selector": ".property"}
  }'
```

### Trigger Data Pipeline
```bash
curl -X POST http://localhost:8000/api/admin/data-sources/<source_id>/trigger \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### List ML Models
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/admin/models
```

### Trigger Model Retraining
```bash
curl -X POST "http://localhost:8000/api/admin/models/retrain?model_type=price_prediction" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get System Statistics
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/admin/stats
```

**Expected:** Comprehensive system stats (users, properties, bookings, quality metrics)

### List All Bookings (Admin View)
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/admin/bookings?status_filter=pending
```

### Update Booking Status
```bash
curl -X PUT "http://localhost:8000/api/bookings/<booking_id>/status?new_status=confirmed" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 8. Health Check

```bash
curl http://localhost:8000/api/health
```

**Expected:** Service status and metadata

---

## Testing Workflow

### Complete Test Sequence

1. **Setup:**
   ```bash
   # Start server
   cd backend
   uvicorn src.main:app --reload
   ```

2. **Create Users:**
   ```bash
   # Register FREE user
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"free@test.com","password":"Pass123!","first_name":"Free","last_name":"User"}'
   
   # Register ADMIN user (or use scripts/seed_users.py if available)
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"Admin123!","first_name":"Admin","last_name":"User"}'
   ```

3. **Promote to Admin (Direct DB or via existing admin):**
   ```sql
   -- In PostgreSQL
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
   ```

4. **Login as Admin:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@test.com&password=Admin123!"
   
   # Save token
   export ADMIN_TOKEN="<access_token>"
   ```

5. **Promote User to PAID_USER:**
   ```bash
   # Get user ID from /api/admin/users
   curl -X PUT http://localhost:8000/api/admin/users/<user_id>/role \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role":"PAID_USER"}'
   ```

6. **Login as PAID_USER:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=free@test.com&password=Pass123!"
   
   export TOKEN="<access_token>"
   ```

7. **Test Booking Creation:**
   ```bash
   curl -X POST http://localhost:8000/api/bookings \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "consultation_type":"market_analysis",
       "preferred_date":"2024-03-01",
       "preferred_time":"14:00",
       "notes":"Test booking"
     }'
   ```

8. **Test Analytics (Public):**
   ```bash
   curl http://localhost:8000/api/analytics/overview
   curl http://localhost:8000/api/analytics/trends?limit=6
   curl "http://localhost:8000/api/analytics/neighborhoods?city=Yaoundé"
   ```

9. **Test Predictions (Public):**
   ```bash
   curl -X POST http://localhost:8000/api/predictions/price \
     -H "Content-Type: application/json" \
     -d '{"city":"Yaoundé","property_type":"apartment","size":100,"bedrooms":2}'
   ```

10. **Verify Admin Functions:**
    ```bash
    curl -H "Authorization: Bearer $ADMIN_TOKEN" \
      http://localhost:8000/api/admin/stats
    ```

---

## Common Issues

### 1. 401 Unauthorized
- Ensure token is included: `-H "Authorization: Bearer $TOKEN"`
- Check token hasn't expired (default: configured in env)
- Re-login to get fresh token

### 2. 403 Forbidden (RBAC)
- Verify user role matches endpoint requirement
- Use admin endpoint to promote user if needed

### 3. 404 Not Found (Resource)
- Check UUID format is correct
- Verify resource exists in database

### 4. 422 Validation Error
- Check request body matches schema
- Ensure required fields are present
- Verify data types (dates, enums, numbers)

### 5. 500 Internal Server Error
- Check backend logs: `uvicorn src.main:app --reload --log-level debug`
- Verify database connection
- Check for missing environment variables

---

## Interactive Testing (Swagger UI)

Visit: http://localhost:8000/api/docs

This provides an interactive API explorer with:
- All endpoints documented
- Try-it-now functionality
- Schema validation
- Response examples

---

## Postman Collection

You can import these curl commands into Postman:
1. Open Postman
2. Click Import → Raw Text
3. Paste curl commands
4. Postman will create a collection automatically

---

## Expected Database State for Testing

Ensure you have:
- At least 10-20 properties in various cities
- Properties with different validation statuses
- At least one listing entry per city/type combination
- Test users with different roles

**Run data pipeline or seed scripts if database is empty.**

---

**Happy Testing! 🚀**
