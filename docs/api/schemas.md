# Database Schemas

## User
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| email | String | Unique, Indexed |
| password | String | Hashed (Bcrypt) |
| role | Enum | FREE_USER, PAID_USER, ADMIN |
| ... | ... | ... |

## Property
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| title | String | Indexed for search |
| city | String | Yaoundé, Douala |
| neighborhood | String | |
| location | Geography | Point (PostGIS) |
| property_type | String | apartment, house, land, commercial |
| price | Numeric | |
| size | Numeric | m² |
| price_per_m2 | Numeric | Computed |
| validation_status| Enum | pending, validated, rejected |
| ... | ... | ... |

## ML Model
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| name | String | e.g., price_prediction_v1 |
| version | String | Semantic versioning |
| type | String | price_prediction, trend_forecast |
| metrics | JSONB | MSE, MAE, R2 |
| ... | ... | ... |
