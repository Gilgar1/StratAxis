# StratAxis — Government Real Estate Scraper

## Targets
| Site | URL | Data Type |
|------|-----|-----------|
| **MINEPAT** | minepat.gov.cm | Economic reports, investment docs, development plans, SND30 |
| **MINTP** | mintp.cm | Public works projects, road/infrastructure tenders, documentation |
| **ARMP** | armp.cm | Public procurement notices (construction, BTP, infrastructure) |
| **Invest in Cameroon** | investincameroon.cm | Investment opportunities, infrastructure news |

## Date Range
2020 – 2026

## Outputs (→ `data/raw/`)
- `gov_re_docs_<timestamp>.csv` — Document index (titles, URLs, categories)
- `gov_re_numerical_<timestamp>.csv` — Extracted numerical data (amounts, percentages)
- `gov_re_pdfs/` — Downloaded PDF and document files

## Setup
```bash
pip install -r requirements.txt
```

## Run
```bash
python gov_real_estate_scraper.py
```

## Architecture
```
gov_real_estate_scraper.py
├── Generic page crawler (all 4 sites)
├── ARMP advanced search (keyword-based procurement queries)
├── Numerical data extractor (FCFA amounts, percentages)
├── File downloader (PDF, XLSX, CSV, DOC)
└── CSV export → data/raw/
```
