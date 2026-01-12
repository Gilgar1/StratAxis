# Environment Variables

## Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string (`postgresql+asyncpg://...`)
- `JWT_SECRET`: Random 32+ character string
- `FRONTEND_URL`: URL of the frontend for CORS
- `ENVIRONMENT`: `development` or `production`

## Frontend (.env.production)
- `REACT_APP_API_URL`: Backend API base URL (e.g., `https://api.strataxis.com`)

## Data Pipeline (config.yaml)
- `database.url`: SQLAlchemy connection string
- `ocr.tesseract_path`: Path to Tesseract executable
