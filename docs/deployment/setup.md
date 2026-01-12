# Deployment Setup Guide

## Prerequisites
- Ubuntu 22.04 LTS
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ with PostGIS
- Nginx
- PM2

## Step-by-Step Installation
1. **Clone Repository**
   ```bash
   git clone <repo-url>
   cd strataxis
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   pm2 start "uvicorn src.main:app" --name strataxis-backend
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve with Nginx
   ```

4. **Data Pipeline Setup**
   ```bash
   cd data-pipeline
   pip install -r requirements.txt
   ```

5. **Nginx Configuration**
   - Copy `infrastructure/nginx/nginx.conf` to `/etc/nginx/sites-available/strataxis`
   - Link to `sites-enabled` and reload Nginx.
