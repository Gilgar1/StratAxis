# StratAxis Scraper Results -- Full Breakdown

## Overview

The scraper ran for approximately 12.5 hours (from 2026-02-17 16:23 to 2026-02-18 04:58) and completed successfully. Below is a detailed summary of all results produced.

---

## Output Files and Locations

| File | Location | Size |
|------|----------|------|
| Master CSV | `strataxis_data/strataxis_real_estate_intelligence_2020_2026.csv` | 3.5 MB (~18,927 lines) |
| Summary Report | `strataxis_data/summary_report.json` | 1.6 KB |
| Downloaded PDFs | `strataxis_data/pdfs/` | 1,503 MB (1.5 GB) -- 594 files |
| Full Log | `strataxis_data/scraper.log` | 2.15 MB |

---

## Data Collected

**803 total unique records** were collected and exported into the master CSV.

### By Source Institution

| Institution | Records |
|---|---|
| Ministry of Housing and Urban Development (minhdu.gov.cm) | 802 |
| National Institute of Statistics (ins-cameroun.cm) | 1 |
| Ministry of State Property (mindaf.cm) | 0 (site unreachable -- DNS failure) |

### By Document Type

| Type | Count |
|---|---|
| HTML pages | 502 |
| PDFs | 181 |
| HTML pages with extracted tables | 91 |
| Press releases | 16 |
| Announcements / Tenders | 9 |
| Reports | 4 |

### By Category

| Category | Count | Description |
|---|---|---|
| Housing | 232 | Social housing programs, property laws, rent regulations |
| Development | 143 | Urban development projects, city modernization |
| Land | 132 | Land tenure, property rights, urban database indicators |
| Infrastructure | 97 | Roads, VRD (voirie et reseaux divers), public works |
| Title/Foncier | 62 | Land title procedures, decrees |
| General | 42 | Miscellaneous records |
| Regulation | 36 | Ministerial orders (arretes), circulars |
| Construction | 21 | Building norms, construction permits |
| Market | 12 | Real estate market regulations, auctions |
| Price | 10 | Pricing data, cost references |
| Investment | 5 | Credit-bail (leasing), financing |
| Auction | 3 | Public auction notices |
| Zoning | 2 | Zoning regulations |
| Statistics | 2 | Statistical data |
| Allocation | 2 | Land allocation data |
| Population | 1 | Population data |
| Indicator | 1 | Urban indicators |

### By Region

| Region | Records |
|---|---|
| Est | 282 |
| Centre | 136 |
| Adamaoua | 37 |
| Douala | 14 |
| Yaounde | 3 |
| North | 2 |
| Nord | 1 |
| Sud | 1 |
| Littoral | 1 |
| Extreme-Nord | 1 |
| East | 12 |
| Yaounde (alternate) | 1 |

### Date Range

- Earliest record: 2022-07-04
- Latest record: 2026-02-13
- Records with explicit dates: 153
- Average relevance score: 3.54

---

## Key Documents Downloaded (PDFs)

The 594 PDF files (including duplicates from French/English versions of pages) represent approximately 178 unique documents. Below are the most significant categories.

### Laws and Legislation

| Document | Description | Size |
|---|---|---|
| Loi n 2004-003 | Urbanisme au Cameroun (land use and zoning law) | 20 MB |
| Loi n 97-003 | Promotion immobiliere (real estate promotion) | 20 MB |
| Loi n 2009-009 | Housing finance law | 9.6 MB |
| Loi n 90-041 | Urban planning profession regulation | 13.5 MB |
| Loi n 2001/020 | Real estate agent profession (Organisation de la Profession d Agent Immobilier) | 319 KB |
| Loi n 2010/020 | Credit-bail (leasing) organization | 3.9 MB |
| Loi n 2010/022 | Co-ownership of buildings (Copropriete des Immeubles) | 462 KB |
| Loi n 2009/814 | Rent-to-own property (location-accession a la propriete immobiliere) | 1.9 MB |
| Loi n 90/040 | Profession d Urbaniste regulation | 352 KB |
| Loi n 96-117 | Additional urban legislation | 4.6 MB |

### Decrees and Ministerial Orders

| Document | Description | Size |
|---|---|---|
| Decret n 2022/354 | Major 2022 decree (09 aout 2022) | 23.6 MB |
| Decret n 2008-0736 | Construction and land use rules | 7.7 MB |
| Decret n 2011-1131 | Urban planning decree | 12.1 MB |
| Decret n 2012-308 | Urban planning decree | 11.5 MB |
| Decret n 2023/08041 | November 2023 decree | 2.1 MB |
| Decret N 2018 | Fire safety regulations in buildings | 8.6 MB |
| Arrete N 0001/MINHDU du 25 Janvier 2024 | Ministerial order | 9.4 MB |
| Arrete N 0002/MINHDU du 25 Janvier 2024 | Ministerial order | 1.8 MB |
| Arrete N 0003/MINHDU du 25 Janvier 2024 | Ministerial order | 3.8 MB |
| Arrete conjoint n 0000759/MINHDU/MINFI du 20 septembre 2024 | Revenue ceilings for social housing access | 177 KB |
| Decision N 00032/MINHDU du 26 Mars 2024 | Administrative decision | 2.6 MB |
| Decision N 00082/MINHDU du 26 Mars 2024 | Administrative decision | 1.2 MB |

### Operational Documents

| Document | Description |
|---|---|
| Tender/procurement documents (DAO) | Construction bid invitations for road works in various cities |
| Recueil des Textes sur l Urbanisme et l Habitat | Compilation of urban/housing laws |
| Guide de l Usager pour l Habitat Social | User guide for social housing |
| Circulaires n 002, 003, 005, 006, 008 | Various ministerial circulars |
| Respect des normes de construction | Construction norms prescriptions from the Prime Minister |
| Project brochures and exposes | JMH (Journee Mondiale de l Habitat) 2023 and 2024 documents |

---

## Structured Data (Tables)

91 records contain extracted structured tables from the "Observatoire Urbain" national urban database on minhdu.gov.cm. Key data includes:

### Land and Property

- Land price to income ratios by city (Douala: 10.3%, Yaounde: 10.8%, Bertoua: 8.9%, Ngaoundere: 7.3%)
- Housing "prix du logement / revenu des menages" ratio (Douala: 11.3%, Yaounde: 11.7%)
- Property ownership statistics (% owners with land title, % renters with lease contracts)
- Housing occupancy distribution (proprietaire avec titre, proprietaire sans titre, location simple, etc.)
- Proportion of urban dwellers living in slums (e.g., Ako: 41%)

### Urban Infrastructure Indicators

- Water access by city and supply method
- Electricity connection rates (Bertoua: 91.4%, Douala: 98.4%, Yaounde: 98.8%)
- Wastewater management methods by city
- Public sanitation facilities per 1,000 inhabitants

### Socioeconomic Data

- Poverty rates by city (Douala: 0.1% severity, Yaounde: 0.3%)
- Transport spending as share of total expenditure (Douala: 40.9%, Yaounde: 35.8%)
- Energy sources for cooking by city
- Education, health, and child mortality indicators

---

## Top Keywords Found

| Keyword | Frequency | Relevance |
|---------|-----------|-----------|
| developpement | 403 | Urban development programs |
| construction | 248 | Building and infrastructure |
| projet | 233 | Project documentation |
| amenagement | 179 | Urban planning/development |
| plan | 155 | Plans, PLANUT, planning |
| logement | 136 | Housing (social housing focus) |
| loi | 134 | Laws and legislation |
| eau | 126 | Water infrastructure |
| marche | 111 | Market data, procurement |
| financement | 108 | Financing, budgets |
| decret | 104 | Government decrees |
| permis | 103 | Building permits |
| terrain | 74 | Land parcels |
| investissement | 69 | Investment data |
| urbanisation | 68 | Urbanization trends |
| arrete | 67 | Ministerial orders |
| terre | 65 | Land/earth |
| route | 65 | Road infrastructure |
| titre | 61 | Land titles |
| population | 60 | Population data |

---

## Institutions That Failed

1. **mindaf.cm** (Ministry of State Property, Surveys and Land Tenure) -- The website was completely unreachable due to DNS resolution failure. This site appears to be down or no longer publicly accessible at this domain.
2. **Selenium fallback** -- Chrome WebDriver could not be initialized automatically, so JavaScript-heavy pages that required browser rendering were skipped.

---

## Notes on Data Quality

1. **Duplicate PDFs** -- Many PDFs were downloaded multiple times because they appear on both French and English versions of the same page. The 594 files represent approximately 178 unique documents.
2. **Regional tagging** -- The "Est" region has the highest count partly because the urban database (Observatoire Urbain) pages default to this region tag in the scraper's classification logic.
3. **Date coverage** -- While the target range was 2020-2026, the earliest dated record is from July 2022, as the MINHDU website content starts from that period. The latest content is from February 2026.
4. **Relevance scoring** -- Records are scored on a scale based on keyword matches. The average score of 3.54 indicates moderate relevance; the highest-scoring records (25.0) are those directly tagged with land/property keywords.

---

## CSV Column Schema

The master CSV file contains the following columns:

| Column | Description |
|---|---|
| `source_institution` | Name of the government institution |
| `title` | Title of the page or document |
| `publication_date` | Publication date (when available) |
| `url` | Source URL |
| `document_type` | Type of document (html, pdf, announcement, etc.) |
| `category` | Classified category (housing, land, development, etc.) |
| `region` | Geographic region (when detected) |
| `extracted_structured_data` | JSON-encoded table data (when tables are present) |
| `extracted_unstructured_text` | Raw text content from the page |
| `keywords_detected` | Comma-separated list of matched keywords |
| `file_path` | Local path to downloaded PDF (when applicable) |
| `crawl_timestamp` | Timestamp when the page was crawled |
| `relevance_score` | Computed relevance score |
