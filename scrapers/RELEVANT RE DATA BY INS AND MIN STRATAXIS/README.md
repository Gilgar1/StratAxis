# StratAxis - Cameroon Real Estate Intelligence Engine

## Overview

**StratAxis** is a production-grade web scraping system designed to become the **central real estate intelligence engine for Cameroon**. It collects comprehensive real estate, land, housing, urban development, infrastructure, and property-related data from official Cameroonian government institutions.

### Target Institutions

1. **Ministry of State Property, Surveys and Land Tenure** (MINDAF)
2. **Ministry of Housing and Urban Development** (MINHDU)
3. **National Institute of Statistics** (INS)
4. **Société Immobilière du Cameroun** (SIC)
5. **Mission for the Development and Equipment of Urban & Rural Land** (MAETUR)

### Date Range

**January 1, 2020 - December 31, 2026**

---

## Architecture

The system follows a modular, production-grade architecture:

```
strataxis/
├── config.py # Configuration & settings
├── crawler.py # Web crawling engine
├── parser.py # HTML parsing & data extraction
├── pdf_processor.py # PDF download & text extraction
├── exporter.py # CSV export & reporting
├── main.py # Main execution entry point
├── requirements.txt # Python dependencies
└── README.md # This file
```

---

## Data Collection Scope

The scraper collects ALL real estate intelligence data including:

### Primary Categories

- **Land**: Title announcements, cadastral data, land allocation, public land auctions
- **Housing**: Housing projects, government programs, residential development
- **Infrastructure**: Roads, bridges, utilities affecting land value
- **Development**: Urban development plans, master plans, zoning regulations
- **Statistics**: Population data, census, housing indicators, market statistics
- **Policy**: Laws, decrees, regulations affecting property and land
- **Market Data**: Pricing references, rental indicators, economic indicators
- **Construction**: Permits, procurement, building regulations

### Document Types

- PDF reports and publications
- HTML pages with structured data (tables)
- Press releases and announcements
- Statistical bulletins
- Policy documents
- Regulatory texts

---

## Installation & Setup

### Prerequisites

- **Python 3.8+**
- **Google Chrome** (for Selenium)
- **ChromeDriver** (automatically managed by webdriver-manager)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Verify Installation

```bash
python -c "import requests, bs4, selenium; print('All dependencies installed successfully')"
```

---

## Usage

### Basic Execution

To run the scraper with default settings:

```bash
python main.py
```

### What Happens When You Run It

1. **Initialization**: Sets up logging, creates output directories
2. **Crawling**: Visits each institution's website, respecting robots.txt
3. **Parsing**: Extracts structured and unstructured data
4. **PDF Processing**: Downloads and extracts text from PDFs
5. **Date Filtering**: Keeps only data from 2020-2026
6. **Deduplication**: Removes duplicate URLs
7. **Relevance Scoring**: Ranks data by real estate relevance
8. **Export**: Creates CSV file and summary report

### Output Structure

After execution, you'll find:

```
strataxis_data/
├── pdfs/ # All downloaded PDFs
│ ├── document_1.pdf
│ ├── document_2.pdf
│ └── ...
├── strataxis_real_estate_intelligence_2020_2026.csv # Master CSV file
├── summary_report.json # Collection statistics
└── scraper.log # Detailed execution log
```

---

## CSV Output Format

The master CSV contains the following columns:

| Column | Description |
|--------|-------------|
| `source_institution` | Which government institution the data came from |
| `title` | Title of the document or page |
| `publication_date` | Date of publication (YYYY-MM-DD) |
| `url` | Source URL |
| `document_type` | Type (pdf, html, press_release, report, etc.) |
| `category` | Classification (land, housing, infrastructure, etc.) |
| `region` | Cameroon region mentioned (if detected) |
| `extracted_structured_data` | Tables serialized as JSON string |
| `extracted_unstructured_text` | Clean text content (up to 10,000 chars) |
| `keywords_detected` | Comma-separated real estate keywords |
| `file_path` | Local path if PDF was downloaded |
| `crawl_timestamp` | When the data was collected |
| `relevance_score` | AI-calculated relevance score (0-100) |

---

## Configuration

### Modifying Target Date Range

Edit `config.py`:

```python
START_DATE = datetime(2020, 1, 1)
END_DATE = datetime(2026, 12, 31)
```

### Adjusting Crawl Settings

Edit `config.py`:

```python
CRAWL_SETTINGS = {
 "max_depth": 5, # How deep to crawl
 "politeness_delay": 2, # Seconds between requests
 "timeout": 30, # Request timeout
 "max_pages_per_site": 1000, # Safety limit
}
```

### Adding Keywords

Add custom keywords to `config.py`:

```python
KEYWORDS = {
 "custom_category": ["keyword1", "keyword2", "mot-clé"],
 # ...
}
```

---

## Intelligence Features

### 1. Keyword Detection Engine

The system detects **100+ French and English keywords** across categories:
- Land & Property
- Development & Infrastructure
- Economic & Market
- Administrative
- Statistics & Data

### 2. Automatic Categorization

Content is automatically classified into:
- Land
- Housing
- Infrastructure
- Statistics
- Policy
- Market Data
- Development
- Regulation

### 3. Relevance Scoring

Each record receives a relevance score based on:
- **Title Match** (3.0x weight)
- **Keyword Density** (2.0x weight)
- **Structured Data Presence** (1.5x weight)
- **PDF Format** (1.2x weight)
- **Recency** (1.0x weight)

### 4. Regional Detection

Automatically identifies mentions of:
- Adamaoua, Centre, East, Far North, Littoral, North, Northwest, West, South, Southwest
- Major cities: Douala, Yaoundé

---

## Technical Features

### Web Crawling

- [OK] **Dual Mode**: Static pages (requests) + Dynamic pages (Selenium)
- [OK] **Robots.txt Compliance**: Respects crawling rules
- [OK] **Rate Limiting**: Polite 2-second delays between requests
- [OK] **URL Normalization**: Prevents duplicate crawling
- [OK] **Error Handling**: Graceful failure with retry logic

### Data Extraction

- [OK] **Table Extraction**: Converts HTML tables to structured JSON
- [OK] **Text Cleaning**: Removes navigation, scripts, ads
- [OK] **Date Detection**: Multiple date format recognition
- [OK] **PDF Processing**: Multi-library support (PyMuPDF, pdfminer, PyPDF2)

### Data Quality

- [OK] **Date Range Filtering**: Strict 2020-2026 enforcement
- [OK] **Deduplication**: URL-based duplicate removal
- [OK] **Relevance Filtering**: Minimum score threshold
- [OK] **UTF-8 Encoding**: Excel-compatible CSV output

---

## Performance & Scalability

### Expected Performance

- **Crawl Speed**: ~30-50 pages/minute (with politeness delay)
- **PDF Processing**: ~5-10 PDFs/minute
- **Memory Usage**: ~500MB-2GB depending on page complexity
- **Storage**: ~1GB per 1,000 documents (including PDFs)

### Optimization Tips

1. **Increase Parallelism**: Modify code to use threading (advanced)
2. **Reduce Politeness Delay**: Lower to 1 second if allowed
3. **Limit PDF Size**: Adjust `max_pdf_size_mb` in config
4. **Selective Crawling**: Disable Selenium for faster static crawling

---

## Error Handling

The system handles:

- **Network Errors**: Automatic retry with exponential backoff
- **Invalid HTML**: Graceful parsing fallback
- **PDF Extraction Failures**: Logs error, continues execution
- **Missing Dates**: Includes documents without dates
- **Robots.txt Blocking**: Skips blocked pages, logs warning

All errors are logged to `strataxis_data/scraper.log`.

---

## Summary Report

After each run, `summary_report.json` provides:

```json
{
 "total_records": 1543,
 "pdf_count": 287,
 "records_with_tables": 456,
 "records_with_dates": 1102,
 "average_relevance_score": 8.3,
 "date_range": {
 "earliest": "2020-01-15",
 "latest": "2026-11-30"
 },
 "by_institution": {
 "Ministry of Housing and Urban Development": 412,
 "National Institute of Statistics": 389,
 ...
 },
 "by_category": {
 "housing": 503,
 "statistics": 387,
 "land": 256,
 ...
 },
 "top_keywords": {
 "logement": 1243,
 "terrain": 987,
 "prix": 876,
 ...
 }
}
```

---

## Troubleshooting

### Issue: Selenium/ChromeDriver Not Found

**Solution**:
```bash
pip install webdriver-manager
```

The system automatically downloads ChromeDriver.

### Issue: PDF Extraction Fails

**Solution**: Install all PDF libraries:
```bash
pip install PyMuPDF pdfminer.six PyPDF2
```

### Issue: Memory Error on Large Sites

**Solution**: Reduce `max_pages_per_site` in config.py:
```python
"max_pages_per_site": 200,
```

### Issue: Blocked by Website

**Solution**: Check `scraper.log` for robots.txt violations. Some sites may block automated access.

---

## Advanced Usage

### Running for a Single Institution

Modify `main.py` to select specific institutions:

```python
# In main.py, replace the loop with:
for institution_name, institution_info in INSTITUTIONS.items():
 if "Housing" in institution_name: # Only MINHDU
 records = scrape_institution(...)
```

### Exporting to Other Formats

The system can be extended to export to:
- **JSON**: Add JSON export in `exporter.py`
- **Database**: Add SQLite/PostgreSQL connector
- **Excel**: Use `pandas.to_excel()`

### Scheduling Regular Scrapes

Use Windows Task Scheduler or cron:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/strataxis && python main.py
```

---

## Logging

The system provides detailed logging at multiple levels:

- **DEBUG**: All operations, useful for debugging
- **INFO**: High-level progress updates
- **WARNING**: Recoverable issues (missing dates, blocked URLs)
- **ERROR**: Failures requiring attention

View logs:
```bash
tail -f strataxis_data/scraper.log
```

---

## Legal & Ethical Considerations

This scraper is designed for:
- [OK] **Public Data**: Only accesses publicly available government data
- [OK] **Research & Education**: For real estate intelligence and analysis
- [OK] **Respectful Crawling**: Honors robots.txt and rate limits

[WARN] **Important**:
- Do not use for commercial purposes without permission
- Respect website terms of service
- Do not overwhelm servers with requests
- Verify data accuracy before making decisions

---

## Contributing

To extend StratAxis:

1. **Add New Institutions**: Update `INSTITUTIONS` in `config.py`
2. **Add Keywords**: Expand `KEYWORDS` dictionary
3. **Improve Parsers**: Enhance `parser.py` for specific site structures
4. **Add Export Formats**: Extend `exporter.py`

---

## Support

For issues or questions:

1. Check `scraper.log` for detailed error messages
2. Review this README for configuration options
3. Verify all dependencies are installed
4. Check internet connectivity to target websites

---

## License

This project is for educational and research purposes. Ensure compliance with local data protection and web scraping laws.

---

## Project Vision

**StratAxis** aims to become Cameroon's definitive real estate intelligence platform by:

1. **Centralizing Data**: Aggregating fragmented government data
2. **Enabling Analysis**: Providing structured data for market research
3. **Democratizing Information**: Making public data accessible
4. **Supporting Development**: Informing urban planning and investment

---

## Credits

**Developed for StratAxis - Cameroon's Central Real Estate Intelligence Platform**

**Version**: 1.0.0 
**Date**: February 2026 
**Status**: Production-Ready

---

## Quick Start Checklist

- [ ] Install Python 3.8+
- [ ] Install Chrome browser
- [ ] Run `pip install -r requirements.txt`
- [ ] Run `python main.py`
- [ ] Check `strataxis_data/` for results
- [ ] Review `summary_report.json` for statistics
- [ ] Open CSV in Excel or analysis tool

**Ready to power Cameroon's real estate intelligence! **
