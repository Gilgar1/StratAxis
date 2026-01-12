# StratAxis

StratAxis is a real estate analytics and price prediction platform focused on the Cameroonian market (initially Yaoundé and Douala). It combines automated data scraping, document OCR processing, and machine learning to provide actionable insights for property buyers, sellers, and investors.

## Features

- **Data Harvesting**: Automated scraping from Cameroonian real estate sites.
- **OCR Engine**: Extraction of structured data from official government land registry PDFs.
- **Market Analytics**: Dynamic charts and tables showing price trends and neighborhood comparisons.
- **Price Prediction**: AI-powered tool to estimate property value based on historical data.
- **Consultation Booking**: Premium service for detailed market analysis and investment advice.

## Tech Stack

- **Frontend**: React, TailwindCSS, Chart.js.
- **Backend**: FastAPI (Python), SQLModel, PostgreSQL (PostGIS).
- **Data Pipeline**: Pandas, Scikit-learn, BeautifulSoup, Tesseract OCR.

## Project Structure

- `/backend`: FastAPI REST API service.
- `/frontend`: React dashboard and user interface.
- `/data-pipeline`: Scripts for scraping, OCR, and ML training.
- `/infrastructure`: Nginx, Docker, and deployment scripts.

## Getting Started

Refer to `docs/deployment/setup.md` for detailed installation and deployment instructions.

## License

This project is part of a BSc Software Engineering final year defense and is also a production MVP.
