# StratAxis Project Structure

```
RELEVANT RE DATA BY INS AND MIN STRATAXIS/
│
├── config.py # Configuration & settings
│ ├── Target institutions (MINDAF, MINHDU, INS, SIC, MAETUR)
│ ├── Date range (2020-2026)
│ ├── Real estate keywords (100+ French/English)
│ ├── Crawl settings (rate limiting, timeouts)
│ ├── PDF processing settings
│ └── Logging configuration
│
├── crawler.py # Web crawling engine
│ ├── Static page crawling (requests + BeautifulSoup)
│ ├── Dynamic page crawling (Selenium + Chrome)
│ ├── Robots.txt compliance
│ ├── Rate limiting & politeness delays
│ ├── URL normalization & deduplication
│ ├── Automatic date extraction
│ └── Error handling & retries
│
├── parser.py # HTML parsing & data extraction
│ ├── HTML table extraction -> JSON
│ ├── Clean text extraction
│ ├── Keyword detection (multilingual)
│ ├── Category classification
│ ├── Regional detection
│ ├── PDF link extraction
│ └── Relevance scoring algorithm
│
├── pdf_processor.py # PDF download & text extraction
│ ├── PDF download with size limits
│ ├── Multi-library text extraction:
│ │ ├── PyMuPDF (preferred)
│ │ ├── pdfminer.six (fallback)
│ │ └── PyPDF2 (fallback)
│ ├── PDF metadata extraction
│ ├── Table extraction (basic)
│ └── Date detection from PDF metadata
│
├── exporter.py # Data export & reporting
│ ├── CSV export with UTF-8 encoding
│ ├── Structured data serialization (tables -> JSON)
│ ├── Document type classification
│ ├── Summary report generation
│ └── Statistics calculation
│
├── main.py # Main execution entry point
│ ├── Orchestrates all modules
│ ├── Institution-by-institution scraping
│ ├── Date range filtering
│ ├── Deduplication logic
│ ├── Progress logging
│ └── Final export & reporting
│
├── requirements.txt # Python dependencies
│ ├── beautifulsoup4==4.12.3
│ ├── requests==2.31.0
│ ├── selenium==4.16.0
│ ├── PyPDF2==3.0.1
│ ├── pdfminer.six==20221105
│ ├── PyMuPDF==1.23.8
│ └── pandas==2.2.0
│
├── verify_setup.py # Setup verification script
│ ├── Python version check
│ ├── Package installation verification
│ ├── Selenium/ChromeDriver test
│ └── Module import verification
│
├── README.md # Comprehensive documentation
│ ├── Overview & objectives
│ ├── Installation instructions
│ ├── Usage guide
│ ├── Configuration options
│ ├── Technical architecture
│ ├── Troubleshooting
│ └── Advanced usage
│
├── QUICKSTART.md # Quick start guide
│ ├── 5-minute setup
│ ├── Common customizations
│ ├── Data analysis examples
│ └── Troubleshooting tips
│
├── install.bat # Windows installation script
│ ├── Python version check
│ ├── Automatic dependency installation
│ └── Setup verification
│
├── ▶ run_scraper.bat # Windows run script
│ └── One-click scraper execution
│
├── .gitignore # Git ignore rules
│ └── Excludes output data, cache, logs
│
└── strataxis_data/ # Output directory (created on first run)
 │
 ├── strataxis_real_estate_intelligence_2020_2026.csv
 │ │ Main CSV file with all collected data
 │ │ Columns:
 │ │ ├── source_institution
 │ │ ├── title
 │ │ ├── publication_date
 │ │ ├── url
 │ │ ├── document_type
 │ │ ├── category
 │ │ ├── region
 │ │ ├── extracted_structured_data (JSON)
 │ │ ├── extracted_unstructured_text
 │ │ ├── keywords_detected
 │ │ ├── file_path
 │ │ ├── crawl_timestamp
 │ │ └── relevance_score
 │
 ├── pdfs/ # Downloaded PDF files
 │ ├── document_1.pdf
 │ ├── document_2.pdf
 │ ├── ...
 │ └── document_N.pdf
 │
 ├── summary_report.json # Collection statistics
 │ ├── total_records
 │ ├── pdf_count
 │ ├── records_with_tables
 │ ├── records_with_dates
 │ ├── average_relevance_score
 │ ├── date_range
 │ ├── by_institution (breakdown)
 │ ├── by_category (breakdown)
 │ ├── by_document_type (breakdown)
 │ ├── by_region (breakdown)
 │ └── top_keywords (frequency)
 │
 └── scraper.log # Detailed execution log
 ├── INFO: Progress updates
 ├── DEBUG: Detailed operations
 ├── WARNING: Recoverable issues
 └── ERROR: Failures
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STRATAXIS ENGINE │
└─────────────────────────────────────────────────────────────────┘

1. INITIALIZATION (main.py)
 ├── Load config
 ├── Setup logging
 └── Initialize components

2. CRAWLING (crawler.py)
 ├── For each institution:
 │ ├── Check robots.txt
 │ ├── Fetch pages (static or dynamic)
 │ ├── Extract links
 │ └── Build page queue
 └── Return crawled pages

3. PARSING (parser.py)
 ├── For each page:
 │ ├── Extract title
 │ ├── Extract tables -> JSON
 │ ├── Extract clean text
 │ ├── Detect keywords
 │ ├── Classify category
 │ ├── Detect region
 │ ├── Calculate relevance
 │ └── Extract PDF links
 └── Return parsed data

4. PDF PROCESSING (pdf_processor.py)
 ├── For each PDF link:
 │ ├── Download PDF
 │ ├── Extract text
 │ ├── Extract metadata
 │ └── Save to pdfs/
 └── Return PDF data

5. FILTERING (main.py)
 ├── Filter by date (2020-2026)
 ├── Remove duplicates (by URL)
 └── Sort by relevance

6. EXPORT (exporter.py)
 ├── Serialize tables to JSON
 ├── Format data for CSV
 ├── Write CSV file
 └── Generate summary report

7. COMPLETION
 ├── Log statistics
 └── Display summary
```

---

## Module Responsibilities

| Module | Primary Function | Key Features |
|--------|------------------|--------------|
| **config.py** | Configuration | 100+ keywords, 5 institutions, crawl settings |
| **crawler.py** | Web crawling | Static/dynamic, robots.txt, rate limiting |
| **parser.py** | Data extraction | Tables, text, keywords, classification |
| **pdf_processor.py** | PDF handling | Download, text extraction, metadata |
| **exporter.py** | Data output | CSV export, summary reports |
| **main.py** | Orchestration | Workflow coordination, filtering |

---

## Key Technologies

- **BeautifulSoup4**: HTML parsing
- **Requests**: HTTP requests for static pages
- **Selenium**: Dynamic JavaScript-rendered pages
- **PyMuPDF/pdfminer/PyPDF2**: PDF text extraction
- **Pandas**: Data handling (optional for analysis)
- **urllib**: URL parsing and robots.txt
- **logging**: Comprehensive logging system

---

## Output Data Model

### CSV Schema

```python
{
 "source_institution": str, # Institution name
 "title": str, # Document title
 "publication_date": date, # YYYY-MM-DD
 "url": str, # Source URL
 "document_type": str, # pdf, html, report, etc.
 "category": str, # land, housing, infrastructure, etc.
 "region": str, # Cameroon region (if detected)
 "extracted_structured_data": str, # JSON-serialized tables
 "extracted_unstructured_text": str, # Clean text (max 10k chars)
 "keywords_detected": str, # Comma-separated keywords
 "file_path": str, # Local PDF path (if applicable)
 "crawl_timestamp": datetime, # When collected
 "relevance_score": float # 0-100 relevance score
}
```

---

## Execution Modes

### Standard Mode
```bash
python main.py
```
Full scraping of all institutions

### Verification Mode
```bash
python verify_setup.py
```
Check setup without scraping

### Windows Quick Run
```batch
run_scraper.bat
```
One-click execution

---

## Performance Characteristics

- **Scalability**: Handles 1,000+ pages per institution
- **Reliability**: Retry logic, error handling, graceful degradation
- **Efficiency**: Deduplication, relevance filtering, incremental crawling
- **Politeness**: 2-second delays, robots.txt compliance
- **Storage**: ~1GB per 1,000 documents (including PDFs)

---

## Intelligence Layer

### Keyword Detection
- **100+ keywords** in French and English
- **9 categories**: land, housing, infrastructure, statistics, policy, market_data, development, regulation, general
- **Multilingual**: Handles both French and English content

### Relevance Scoring
```python
score = (
 title_keywords × 3.0 +
 keyword_density × 2.0 +
 has_tables × 1.5 +
 is_pdf × 1.2 +
 recency_bonus × 1.0
)
```

### Auto-Classification
- **Document Type**: pdf, html, press_release, report, announcement
- **Category**: Based on keyword frequency analysis
- **Region**: Pattern matching for 10 Cameroon regions

---

## [OK] Production-Ready Features

[OK] **Modular Architecture**: Easy to extend and maintain
[OK] **Comprehensive Logging**: Debug, info, warning, error levels
[OK] **Error Handling**: Graceful failures, retries, fallbacks
[OK] **Data Quality**: Deduplication, filtering, validation
[OK] **Documentation**: README, Quick Start, inline comments
[OK] **Setup Tools**: Verification script, installation scripts
[OK] **Output Formats**: CSV (Excel-compatible), JSON reports

---

**Version**: 1.0.0 
**Status**: Production-Ready 
**Target**: Cameroon Real Estate Intelligence 
**Date Range**: 2020-2026 
**Created**: February 2026
