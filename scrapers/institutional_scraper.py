"""
StratAxis — scrapers/institutional_scraper.py
Crawls government and institutional sources for Cameroonian real estate data.

Targets:
  - INS (Institut National de la Statistique): ins.cm
  - MINHDU (Ministry of Housing and Urban Development): minhdu.cm  
  - CCIMA (Douala Chamber of Commerce)
  - World Bank Cameroon housing reports (open data)
  - African Development Bank property data

Outputs:
  - data/raw/institutional_docs_<timestamp>.csv  (document index)
  - data/raw/institutional_pdfs/                 (downloaded PDF files)

Flow:
  Run this → data/raw/ → data/cleaned/clean_institutional.py → Supabase
"""

import os
import re
import csv
import time
import random
import logging
import hashlib
import requests
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field, asdict
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [INSTITUTIONAL-SCRAPER] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.institutional_scraper")

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
RAW_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
PDF_OUTPUT_DIR = os.path.join(RAW_OUTPUT_DIR, "institutional_pdfs")
os.makedirs(RAW_OUTPUT_DIR, exist_ok=True)
os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "StratAxis-Research-Bot/2.0 (+https://strataxis.cm/bot) "
        "Academic research in Cameroonian real estate"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

DATE_RANGE = (2020, 2026)  # Only collect data from 2020-2026

INSTITUTIONAL_TARGETS = [
    {
        "name": "ins_cameroun",
        "display_name": "INS Cameroun",
        "base_url": "https://www.ins.cm",
        "search_paths": [
            "/fr/content/publications",
            "/fr/content/enquetes",
            "/fr/content/notes-dinformation",
        ],
        "keywords": [
            "logement", "immobilier", "habitat", "construction",
            "indice des prix", "foncier", "terrain"
        ],
        "delay": (3, 6),
        "download_pdfs": True,
    },
    {
        "name": "minhdu",
        "display_name": "MINHDU",
        "base_url": "https://www.minhdu.cm",
        "search_paths": ["/publications", "/documents", "/rapports"],
        "keywords": [
            "logement", "habitat", "construction", "plan directeur",
            "programmes", "statistiques"
        ],
        "delay": (3, 6),
        "download_pdfs": True,
    },
    {
        "name": "world_bank_cm",
        "display_name": "World Bank Cameroon",
        "base_url": "https://data.worldbank.org",
        "search_paths": [
            "/country/CM",
        ],
        "keywords": ["housing", "urban", "land", "property", "construction"],
        "delay": (2, 4),
        "download_pdfs": False,
    },
]


# ─────────────────────────────────────────────
# Data model
# ─────────────────────────────────────────────
@dataclass
class InstitutionalDoc:
    title: str = ""
    source_name: str = ""
    source_display: str = ""
    document_url: str = ""
    pdf_url: str = ""
    pdf_local_path: str = ""
    publication_date: str = ""
    year: Optional[int] = None
    category: str = ""
    relevance_keywords: str = ""
    summary: str = ""
    language: str = "fr"
    record_id: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def generate_id(self):
        raw = f"{self.source_name}|{self.document_url}|{self.title}"
        self.record_id = hashlib.md5(raw.encode()).hexdigest()

    def is_in_date_range(self) -> bool:
        if self.year:
            return DATE_RANGE[0] <= self.year <= DATE_RANGE[1]
        return True  # Include if year unknown


# ─────────────────────────────────────────────
# Parsing helpers
# ─────────────────────────────────────────────
def _extract_year(text: str) -> Optional[int]:
    """Extract year from text or URL."""
    years = re.findall(r"\b(20\d{2})\b", text)
    for y in years:
        y_int = int(y)
        if DATE_RANGE[0] <= y_int <= DATE_RANGE[1]:
            return y_int
    return None


def _categorize_document(title: str, summary: str = "") -> str:
    text = (title + " " + summary).lower()
    if any(k in text for k in ["construction", "permit", "autorisation"]):
        return "construction"
    if any(k in text for k in ["logement", "habitat", "housing"]):
        return "housing"
    if any(k in text for k in ["prix", "price", "indice", "inflation"]):
        return "economic"
    if any(k in text for k in ["plan", "loi", "décret", "arrêté", "politique"]):
        return "policy"
    if any(k in text for k in ["foncier", "terrain", "land"]):
        return "land"
    return "general"


def _is_relevant(title: str, keywords: list[str]) -> bool:
    title_lower = title.lower()
    return any(kw.lower() in title_lower for kw in keywords)


def _find_keywords_present(title: str, keywords: list[str]) -> str:
    found = [kw for kw in keywords if kw.lower() in title.lower()]
    return ", ".join(found)


# ─────────────────────────────────────────────
# PDF downloader
# ─────────────────────────────────────────────
def _download_pdf(url: str, record_id: str, session: requests.Session) -> str:
    """Download a PDF and return local file path."""
    if not url.lower().endswith(".pdf") and "pdf" not in url.lower():
        return ""
    try:
        resp = session.get(url, timeout=30, stream=True)
        resp.raise_for_status()

        filename = f"{record_id}.pdf"
        filepath = os.path.join(PDF_OUTPUT_DIR, filename)

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        logger.info(f"  Downloaded PDF: {filename}")
        return filepath
    except Exception as e:
        logger.warning(f"  PDF download failed for {url}: {e}")
        return ""


# ─────────────────────────────────────────────
# Site scraper
# ─────────────────────────────────────────────
def scrape_institutional_site(target: dict) -> list[InstitutionalDoc]:
    docs: list[InstitutionalDoc] = []
    base_url = target["base_url"]
    delay_range = target.get("delay", (3, 6))
    keywords = target["keywords"]
    session = requests.Session()
    session.headers.update(HEADERS)

    for search_path in target["search_paths"]:
        url = base_url + search_path
        logger.info(f"Crawling: {url}")

        try:
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
        except requests.RequestException as e:
            logger.warning(f"Failed to fetch {url}: {e}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")

        # Find all links on the page
        all_links = soup.find_all("a", href=True)

        for link in all_links:
            href = link["href"]
            text = link.get_text(strip=True)

            if not text or len(text) < 5:
                continue

            # Only include relevant documents
            if not _is_relevant(text, keywords):
                continue

            full_url = urljoin(base_url, href)

            doc = InstitutionalDoc(
                title=text,
                source_name=target["name"],
                source_display=target["display_name"],
                document_url=full_url,
                relevance_keywords=_find_keywords_present(text, keywords),
                language="fr",
            )

            # Extract year from URL or text
            doc.year = _extract_year(href) or _extract_year(text)
            doc.category = _categorize_document(text)

            # Check PDF
            if href.lower().endswith(".pdf") or "pdf" in href.lower():
                doc.pdf_url = full_url
                if target.get("download_pdfs"):
                    doc.generate_id()
                    doc.pdf_local_path = _download_pdf(full_url, doc.record_id, session)

            doc.generate_id()

            # Filter by date range (include unknown years)
            if doc.is_in_date_range():
                docs.append(doc)

        logger.info(f"  → Found {len(docs)} relevant docs so far from {target['name']}")
        time.sleep(random.uniform(*delay_range))

    logger.info(f"Total docs from {target['display_name']}: {len(docs)}")
    return docs


# ─────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────
def save_to_csv(docs: list[InstitutionalDoc], filename: str):
    if not docs:
        logger.warning("No institutional documents to save.")
        return

    filepath = os.path.join(RAW_OUTPUT_DIR, filename)
    fieldnames = list(asdict(docs[0]).keys())

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for d in docs:
            writer.writerow(asdict(d))

    logger.info(f"Saved {len(docs)} institutional docs → {filepath}")
    return filepath


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def run():
    all_docs: list[InstitutionalDoc] = []
    for target in INSTITUTIONAL_TARGETS:
        try:
            results = scrape_institutional_site(target)
            all_docs.extend(results)
        except Exception as e:
            logger.error(f"Error scraping {target['name']}: {e}")

    # Deduplicate by record_id
    seen = set()
    unique_docs = []
    for doc in all_docs:
        if doc.record_id not in seen:
            seen.add(doc.record_id)
            unique_docs.append(doc)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_file = f"institutional_docs_{timestamp}.csv"
    save_to_csv(unique_docs, output_file)

    logger.info(f"=== Institutional Scraper complete. Total unique docs: {len(unique_docs)} ===")
    return unique_docs


if __name__ == "__main__":
    run()
