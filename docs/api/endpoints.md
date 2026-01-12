# StratAxis API Endpoints

## Authentication
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate user and return JWT tokens.
- `POST /api/auth/refresh`: Refresh access token.
- `POST /api/auth/logout`: Invalidate user session.
- `POST /api/auth/forgot-password`: Request password reset.
- `POST /api/auth/reset-password`: Reset password using token.

## Properties
- `GET /api/properties`: List properties with filtering & pagination.
- `GET /api/properties/{id}`: Get detailed information for a specific property.
- `GET /api/properties/search`: Full-text search across properties.

## Listings
- `GET /api/listings`: Get aggregated property listings/snapshots.

## Analytics
- `GET /api/analytics/overview`: High-level market statistics.
- `GET /api/analytics/trends`: Historical price and volume trends.
- `GET /api/analytics/neighborhoods`: Neighborhood ranking and comparison.

## Predictions
- `GET /api/predictions/price`: Predict property price based on features (FREE_USER+).
- `GET /api/predictions/trend`: Forecast future price trends (PAID_USER+).

## Bookings (PAID_USER+)
- `POST /api/bookings`: Create a new consultation booking.
- `GET /api/bookings`: List user's bookings.
- `GET /api/bookings/{id}`: Get booking details.
- `PUT /api/bookings/{id}`: Update booking details.
- `DELETE /api/bookings/{id}`: Cancel a booking.

## Admin (ADMIN)
- `GET /api/admin/users`: Manage system users.
- `PUT /api/admin/users/{id}/role`: Update user roles.
- `GET /api/admin/data-sources`: Monitor data sources.
- `POST /api/admin/data-sources/trigger`: Manually trigger data pipeline.
- `POST /api/admin/models/retrain`: Trigger ML model retraining.
- `GET /api/admin/stats`: System-wide usage and quality statistics.
