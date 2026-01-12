#!/bin/bash

# StratAxis Deployment Script
echo "Starting deployment..."

# 1. Update code
git pull origin main

# 2. Update Backend
cd backend
pip install -r requirements.txt
pm2 restart strataxis-backend

# 3. Update Frontend
cd ../frontend
npm install
npm run build
# Copy to nginx root
# cp -r build/* /var/www/strataxis-frontend/

# 4. Update Pipeline
cd ../data-pipeline
pip install -r requirements.txt

echo "Deployment completed successfully."
