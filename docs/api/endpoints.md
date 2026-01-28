# StratAxis API Endpoints Documentation

**Version:** 1.0.0  
**Base URL:** `/api`  
**Authentication:** JWT Bearer Token (where specified)

---

## 1. Authentication Endpoints

### POST `/api/auth/register`
**Description:** Create a new user account  
**Auth Required:** No  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+237123456789"
}
```
**Response:** `201 CREATED`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "FREE_USER",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST `/api/auth/login`
**Description:** Authenticate and receive JWT tokens  
**Auth Required:** No  
**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```
**Response:** `200 OK`
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhb...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhb...",
  "token_type": "bearer"
}
```

### POST `/api/auth/refresh`
**Description:** Refresh access token  
**Auth Required:** Refresh Token  

### POST `/api/auth/logout`
**Description:** Logout (client-side token deletion)  
**Auth Required:** Yes  

### POST `/api/auth/forgot-password`
**Description:** Request password reset (stub)  
**Auth Required:** No  

### POST `/api/auth/reset-password`
**Description:** Reset password with token (stub)  
**Auth Required:** No  

---

## 2. Property Endpoints

### GET `/api/properties`
**Description:** List properties with advanced filtering, pagination, and sorting  
**Auth Required:** No  
**Query Parameters:**
- `skip` (int, default: 0): Pagination offset
- `limit` (int, default: 50, max: 100): Number of results
- `city` (enum: Yaoundé, Douala): Filter by city
- `property_type` (enum: apartment, house, land, commercial): Filter by type
- `min_price` (float): Minimum price filter
- `max_price` (float): Maximum price filter
- `min_size` (float): Minimum size in m²
- `max_size` (float): Maximum size in m²
- `neighborhood` (string): Filter by neighborhood (partial match)
- `validation_status` (enum, default: validated): Filter by status
- `sort_by` (enum: price, size, date_added, price_per_m2, created_at): Sort field
- `sort_order` (enum: asc, desc, default: desc): Sort direction

**Response:** `200 OK`
```json
{
  "total": 1250,
  "skip": 0,
  "limit": 50,
  "items": [
    {
      "id": "uuid",
      "title": "Modern 3BR Apartment in Bastos",
      "city": "Yaoundé",
      "neighborhood": "Bastos",
      "property_type": "apartment",
      "price": 45000000,
      "size": 150,
      "price_per_m2": 300000,
      "bedrooms": 3,
      "bathrooms": 2,
      "quality_score": 92.5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/properties/{id}`
**Description:** Get detailed property information  
**Auth Required:** No  
**Response:** `200 OK` - Single PropertyRead object

### GET `/api/properties/search`
**Description:** Full-text search across properties  
**Auth Required:** No  
**Query Parameters:**
- `q` (string, required, min_length: 3): Search query
- `skip`, `limit`: Pagination

**Response:** `200 OK` - Paginated search results

### GET `/api/properties/nearby`
**Description:** Geospatial search for nearby properties  
**Auth Required:** No  
**Query Parameters:**
- `latitude` (float, required): Center latitude
- `longitude` (float, required): Center longitude
- `radius_km` (float, default: 5.0, max: 50): Search radius in km
- `limit` (int, default: 20): Max results

**Response:** `200 OK`
```json
{
  "center": {"latitude": 3.8480, "longitude": 11.5021},
  "radius_km": 5.0,
  "count": 15,
  "items": [...]
}
```

---

## 3. Listing Endpoints

### GET `/api/listings`
**Description:** Get aggregated property data (time-series snapshots)  
**Auth Required:** No (Public)  
**Query Parameters:**
- `city` (string): Filter by city
- `property_type` (string): Filter by type
- `neighborhood` (string): Filter by neighborhood
- `period` (enum: daily, weekly, monthly, default: monthly): Aggregation period
- `start_date` (date): Filter from date
- `end_date` (date): Filter to date
- `limit` (int, max: 200): Results limit

**Response:** `200 OK` - Array of ListingRead objects

### GET `/api/listings/summary`
**Description:** Quick summary statistics from listings  
**Auth Required:** No  
**Query Parameters:**
- `city`, `property_type`: Optional filters

**Response:** `200 OK`
```json
{
  "city": "Yaoundé",
  "data_points": 12,
  "total_properties": 8500,
  "avg_price": 35000000,
  "avg_price_per_m2": 250000,
  "trend": "up",
  "trend_percentage": 8.5
}
```

---

## 4. Analytics Endpoints

### GET `/api/analytics/overview`
**Description:** Comprehensive market overview with statistics  
**Auth Required:** No  
**Query Parameters:**
- `city` (PropertyCity): Optional city filter
- `property_type` (PropertyType): Optional type filter
- `start_date`, `end_date`: Date range filters

**Response:** `200 OK`
```json
{
  "total_properties": 15000,
  "by_city": [
    {
      "city": "Yaoundé",
      "count": 8500,
      "by_type": [
        {"property_type": "apartment", "count": 4200},
        {"property_type": "house", "count": 3100}
      ]
    }
  ],
  "avg_price_per_m2_by_city": {"Yaoundé": 280000, "Douala": 310000},
  "avg_price_per_m2_by_type": {"apartment": 250000, "house": 320000},
  "price_distribution": {
    "min": 5000000,
    "max": 500000000,
    "avg": 42000000,
    "median": 35000000,
    "q1": 22000000,
    "q3": 58000000
  }
}
```

### GET `/api/analytics/trends`
**Description:** Historical trends for prices and volumes  
**Auth Required:** No  
**Query Parameters:**
- `city` (string): Filter by city
- `property_type` (string): Filter by type
- `period_type` (enum: monthly, quarterly, default: monthly): Period aggregation
- `limit` (int, default: 12, max: 24): Number of periods
- `compare_cities` (bool, default: false): Enable Yaoundé vs Douala comparison

**Response:** `200 OK`
```json
{
  "city": "Yaoundé",
  "period_type": "monthly",
  "data_points": [
    {
      "period": "2024-01",
      "avg_price": 38000000,
      "avg_price_per_m2": 270000,
      "property_count": 450,
      "trend_direction": "up",
      "trend_percentage": 5.2
    }
  ],
  "comparison": {
    "Yaoundé": [...],
    "Douala": [...]
  }
}
```

### GET `/api/analytics/neighborhoods`
**Description:** Neighborhood-level analytics and rankings  
**Auth Required:** No  
**Query Parameters:**
- `city` (PropertyCity, required): City to analyze
- `property_type` (PropertyType): Optional type filter
- `top_n` (int, default: 10, max: 50): Number of top neighborhoods

**Response:** `200 OK`
```json
{
  "city": "Yaoundé",
  "neighborhoods": [
    {
      "neighborhood": "Bastos",
      "avg_price": 85000000,
      "avg_price_per_m2": 450000,
      "property_count": 120,
      "property_types": ["apartment", "house"]
    }
  ],
  "top_by_price": [...],
  "top_by_volume": [...]
}
```

---

## 5. Prediction Endpoints

### POST `/api/predictions/price`
**Description:** Predict property price using ML model (STUB)  
**Auth Required:** No  
**Request Body:**
```json
{
  "city": "Yaoundé",
  "property_type": "apartment",
  "size": 120,
  "neighborhood": "Bastos",
  "bedrooms": 3,
  "bathrooms": 2
}
```

**Response:** `200 OK`
```json
{
  "predicted_price": 42500000,
  "predicted_price_per_m2": 354166.67,
  "confidence_interval_lower": 36125000,
  "confidence_interval_upper": 48875000,
  "confidence_score": 0.78,
  "feature_importance": [
    {"feature": "size", "importance": 0.35},
    {"feature": "city", "importance": 0.25}
  ],
  "model_version": "v1.0.0-stub",
  "prediction_date": "2024-01-28T09:00:00Z"
}
```

### POST `/api/predictions/trend`
**Description:** Forecast future price trends (STUB)  
**Auth Required:** No  
**Request Body:**
```json
{
  "city": "Yaoundé",
  "property_type": "apartment",
  "time_horizon": 6,
  "neighborhood": "Bastos"
}
```

**Response:** `200 OK`
```json
{
  "city": "Yaoundé",
  "property_type": "apartment",
  "time_horizon": 6,
  "current_avg_price": 40000000,
  "current_avg_price_per_m2": 300000,
  "trend_direction": "up",
  "trend_percentage": 9.0,
  "forecasts": [
    {
      "month": "2024-02",
      "forecasted_price": 40600000,
      "forecasted_price_per_m2": 304500,
      "confidence_lower": 36540000,
      "confidence_upper": 44660000
    }
  ],
  "confidence_score": 0.72,
  "model_version": "v1.0.0-stub"
}
```

### GET `/api/predictions/health`
**Description:** Check prediction service status  
**Auth Required:** No  

---

## 6. Booking Endpoints

**RBAC:** PAID_USER and ADMIN only (except where noted)

### POST `/api/bookings`
**Description:** Create new consultation booking  
**Auth Required:** Yes (PAID_USER+)  
**Request Body:**
```json
{
  "consultation_type": "market_analysis",
  "preferred_date": "2024-02-15",
  "preferred_time": "14:00",
  "notes": "Interested in buying apartment in Bastos"
}
```

**Response:** `201 CREATED` - BookingRead object

### GET `/api/bookings`
**Description:** List current user's bookings  
**Auth Required:** Yes  

### GET `/api/bookings/admin`
**Description:** List all bookings (admin view)  
**Auth Required:** Yes (ADMIN)  
**Query Parameters:**
- `status_filter` (BookingStatus): Filter by status

### GET `/api/bookings/{id}`
**Description:** Get booking details  
**Auth Required:** Yes (owner or ADMIN)  

### PUT `/api/bookings/{id}`
**Description:** Update booking (pending bookings only for users)  
**Auth Required:** Yes (owner or ADMIN)  
**Request Body:** BookingUpdate (partial)

### DELETE `/api/bookings/{id}`
**Description:** Cancel booking (soft delete)  
**Auth Required:** Yes (owner or ADMIN)  
**Response:** `204 NO CONTENT`

### PUT `/api/bookings/{id}/status`
**Description:** Update booking status (admin only)  
**Auth Required:** Yes (ADMIN)  
**Query Parameters:**
- `new_status` (BookingStatus, required)
- `admin_notes` (string): Optional notes

---

## 7. Admin Endpoints

**RBAC:** All endpoints require ADMIN role

### GET `/api/admin/users`
**Description:** List all users with pagination  
**Query Parameters:**
- `skip`, `limit`: Pagination
- `role` (UserRole): Filter by role

### PUT `/api/admin/users/{id}/role`
**Description:** Change user role  
**Request Body:**
```json
{
  "role": "PAID_USER"
}
```

### DELETE `/api/admin/users/{id}`
**Description:** Deactivate user account  
**Response:** `200 OK`

### GET `/api/admin/data-sources`
**Description:** List all configured data sources  

### POST `/api/admin/data-sources`
**Description:** Add new data source  
**Request Body:**
```json
{
  "name": "CamerounRealEstate",
  "type": "scraper",
  "source_url": "https://example.cm",
  "is_active": true,
  "config": {"selector": ".property-item"}
}
```

### PUT `/api/admin/data-sources/{id}`
**Description:** Update data source configuration  

### POST `/api/admin/data-sources/{id}/trigger`
**Description:** Manually trigger data pipeline for source  
**Response:** `200 OK`
```json
{
  "message": "Data pipeline triggered successfully",
  "source_id": "uuid",
  "triggered_at": "2024-01-28T10:00:00Z"
}
```

### GET `/api/admin/models`
**Description:** List all ML models with metrics  

### POST `/api/admin/models/retrain`
**Description:** Trigger ML model retraining  
**Query Parameters:**
- `model_type` (ModelType, required): Model to retrain

### GET `/api/admin/stats`
**Description:** Comprehensive system statistics  
**Response:** `200 OK`
```json
{
  "total_users": 1250,
  "users_by_role": {
    "FREE_USER": 1000,
    "PAID_USER": 200,
    "ADMIN": 50
  },
  "total_properties": 15000,
  "validated_properties": 13500,
  "pending_properties": 1200,
  "rejected_properties": 300,
  "total_bookings": 450,
  "pending_bookings": 25,
  "confirmed_bookings": 150,
  "active_data_sources": 5,
  "active_ml_models": 2,
  "avg_property_quality_score": 87.5,
  "last_updated": "2024-01-28T10:00:00Z"
}
```

---

## 8. Utilities

### GET `/api/health`
**Description:** Service health check  
**Auth Required:** No  
**Rate Limit:** 5/minute  
**Response:** `200 OK`
```json
{
  "status": "online",
  "project": "StratAxis",
  "environment": "production",
  "timestamp": 1706437200.0
}
```

---

## Status Codes

- `200 OK`: Request successful
- `201 CREATED`: Resource created successfully
- `204 NO CONTENT`: Successful deletion
- `400 BAD REQUEST`: Invalid request data
- `401 UNAUTHORIZED`: Authentication required or failed
- `403 FORBIDDEN`: Insufficient permissions (RBAC)
- `404 NOT FOUND`: Resource not found
- `409 CONFLICT`: Duplicate or conflicting resource
- `429 TOO MANY REQUESTS`: Rate limit exceeded
- `500 INTERNAL SERVER ERROR`: Server error

---

## Rate Limiting

- Default: 100 requests/minute per IP
- Health endpoint: 5 requests/minute
- Prediction endpoints: More restrictive (configured via slowapi)

## Caching

- Prediction results: 24h TTL (in-memory for MVP)
- Public endpoints: Recommended client-side caching with ETags

## Notes

1. **Stub Implementations:**
   - Prediction endpoints use mock ML models
   - Email notifications are logged but not sent
   - Geospatial queries simplified for MVP

2. **Production Readiness:**
   - Implement Redis for caching and rate limiting
   - Connect ML models from data-pipeline
   - Configure proper email service
   - Use PostGIS ST_DWithin for geospatial queries

3. **Security:**
   - All endpoints use HTTPS in production
   - JWT tokens expire per configuration
   - RBAC strictly enforced via dependencies
   - Input validation via Pydantic schemas
