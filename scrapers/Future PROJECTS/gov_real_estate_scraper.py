"""
StratAxis — scrapers/Future PROJECTS/gov_real_estate_scraper.py
Scrapes government and institutional websites for Cameroonian real estate data.

Targets:
  - MINEPAT (Ministry of Economy, Planning): minepat.gov.cm
  - MINTP  (Ministry of Public Works): mintp.cm
  - ARMP   (Public Contracts Regulatory Agency): armp.cm
  - Invest in Cameroon (Investment Promotion): investincameroon.cm

Outputs:
  - data/raw/gov_re_docs_<timestamp>.csv        (document index)
  - data/raw/gov_re_numerical_<timestamp>.csv    (extracted numerical data)
  - data/raw/gov_re_pdfs/                        (downloaded PDF/files)

Date range: 2020 – 2026
"""

import os
import re
import csv
import sys
import time
import random
import logging
import hashlib
import requests
import urllib3
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, field, asdict
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs

# Suppress SSL InsecureRequestWarning for .cm domains
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [GOV-RE-SCRAPER] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.gov_re_scraper")

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
PDF_OUTPUT_DIR = os.path.join(RAW_OUTPUT_DIR, "gov_re_pdfs")
os.makedirs(RAW_OUTPUT_DIR, exist_ok=True)
os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)

DATE_RANGE = (2020, 2026)

HEADERS = {
    "User-Agent": (
        "StratAxis-Research-Bot/2.0 (+https://strataxis.cm/bot) "
        "Academic research in Cameroonian real estate"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Real estate relevance keywords (French + English)
RE_KEYWORDS = [
    # French
    "immobilier", "logement", "habitat", "construction", "foncier", "terrain",
    "urbanisme", "aménagement", "infrastructures", "bâtiment", "lotissement",
    "cadastre", "propriété", "loyer", "prix", "indice", "BTP", "génie civil",
    "travaux publics", "route", "autoroute", "pont", "barrage",
    "plan directeur", "schéma directeur", "permis de construire",
    "programme de développement", "investissement public",
    "décret", "arrêté", "réglementation", "marché public",
    # English
    "real estate", "housing", "construction", "land", "urban", "infrastructure",
    "building", "property", "investment", "public works", "road", "highway",
    "bridge", "dam", "development plan", "public procurement",
]

# ─────────────────────────────────────────────
# Target sites
# ─────────────────────────────────────────────
TARGETS = [
    {
        "name": "minepat",
        "display_name": "MINEPAT — Ministère de l'Économie",
        "base_url": "https://minepat.gov.cm",
        "search_paths": [
            "/fr/ova_doc/",
            "/cat_doc/investissement-public/",
            "/cat_doc/economie/",
            "/cat_doc/amenagement-du-territoire/",
            "/rapports-dexecution-du-bip",
            "/journal-des-projets-du-bip",
            "/notes-mensuelles",
            "/snd30/",
            "/indicateurs-cles-economie",
            "/news/",
            "/category/investissement-public/",
            "/category/amenagement-du-territoire/",
            "/category/economie/",
        ],
        "keywords": RE_KEYWORDS,
        "delay": (3, 6),
        "download_files": True,
        "max_pages": 5,
    },
    {
        "name": "mintp",
        "display_name": "MINTP — Ministère des Travaux Publics",
        "base_url": "https://mintp.cm",
        "search_paths": [
            "/en/projects/",
            "/en/news/",
            "/en/documentation/",
            "/en/call-for-tender/",
            "/projects/",
            "/documentation/",
            "/actualites/",
            "/appels-doffres/",
        ],
        "keywords": RE_KEYWORDS,
        "delay": (3, 6),
        "download_files": True,
        "max_pages": 5,
    },
    {
        "name": "investincameroon",
        "display_name": "Invest in Cameroon — API",
        "base_url": "http://investincameroon.cm",
        "search_paths": [
            "/",
            "/investir.html",
            "/actualite.html",
            "/opportunites.html",
        ],
        "keywords": RE_KEYWORDS,
        "delay": (3, 6),
        "download_files": True,
        "max_pages": 3,
    },
]


# ─────────────────────────────────────────────
# Data models
# ─────────────────────────────────────────────
@dataclass
class GovDocument:
    """A document/page scraped from a government source."""
    title: str = ""
    source_name: str = ""
    source_display: str = ""
    document_url: str = ""
    file_url: str = ""
    file_local_path: str = ""
    publication_date: str = ""
    year: Optional[int] = None
    category: str = ""
    relevance_keywords: str = ""
    summary: str = ""
    language: str = "fr"
    region: str = ""
    amount_fcfa: Optional[float] = None
    record_id: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def generate_id(self):
        raw = f"{self.source_name}|{self.document_url}|{self.title}"
        self.record_id = hashlib.md5(raw.encode()).hexdigest()

    def is_in_date_range(self) -> bool:
        if self.year:
            return DATE_RANGE[0] <= self.year <= DATE_RANGE[1]
        return True  # Include if year unknown


@dataclass
class NumericalDataPoint:
    """Extracted numerical data from a document or page."""
    source_name: str = ""
    source_display: str = ""
    source_url: str = ""
    metric_name: str = ""
    value: float = 0.0
    unit: str = ""
    currency: str = "FCFA"
    year: Optional[int] = None
    region: str = ""
    category: str = ""
    context: str = ""
    record_id: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def generate_id(self):
        raw = f"{self.source_name}|{self.source_url}|{self.metric_name}|{self.value}"
        self.record_id = hashlib.md5(raw.encode()).hexdigest()


# ─────────────────────────────────────────────
# Parsing helpers
# ─────────────────────────────────────────────
def _extract_year(text: str) -> Optional[int]:
    """Extract a year from text that falls within DATE_RANGE."""
    years = re.findall(r"\b(20\d{2})\b", text)
    for y in years:
        y_int = int(y)
        if DATE_RANGE[0] <= y_int <= DATE_RANGE[1]:
            return y_int
    return None


def _extract_amounts(text: str) -> list[dict]:
    """Extract monetary amounts (FCFA) from text."""
    amounts = []
    # Pattern: 28 000 000 FCFA or 28,000,000 FCFA or 28000000 FCFA
    patterns = [
        r"([\d\s.,]+)\s*(?:FCFA|F\s*CFA|francs?\s*CFA|XAF)",
        r"(?:FCFA|F\s*CFA|XAF)\s*([\d\s.,]+)",
        r"([\d\s.,]+)\s*(?:milliards?|millions?)\s*(?:de\s+)?(?:FCFA|francs?\s*CFA|F\s*CFA)",
    ]
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            raw_val = m.group(1).strip()
            raw_val = raw_val.replace(" ", "").replace(",", "").replace(".", "")
            try:
                value = float(raw_val)
                if value > 0:
                    # Check for milliards/millions multiplier
                    context = text[max(0, m.start() - 30):m.end() + 30]
                    if "milliard" in context.lower():
                        value *= 1_000_000_000
                    elif "million" in context.lower():
                        value *= 1_000_000
                    amounts.append({"value": value, "context": context.strip()})
            except ValueError:
                continue
    return amounts


def _categorize(title: str, summary: str = "") -> str:
    """Categorize a document based on title/summary content."""
    text = (title + " " + summary).lower()
    categories = {
        "construction": ["construction", "bâtiment", "building", "BTP", "génie civil"],
        "housing": ["logement", "habitat", "housing", "résidentiel"],
        "land": ["foncier", "terrain", "land", "cadastre", "lotissement"],
        "infrastructure": ["infrastructure", "route", "autoroute", "pont", "highway", "road", "bridge"],
        "urban_planning": ["urbanisme", "aménagement", "plan directeur", "schéma"],
        "economic": ["prix", "indice", "inflation", "économie", "investissement", "budget"],
        "policy": ["décret", "arrêté", "loi", "réglementation", "circulaire", "ordonnance"],
        "procurement": ["appel d'offres", "marché public", "procurement", "tender", "cotation"],
    }
    for cat, keywords in categories.items():
        if any(kw.lower() in text for kw in keywords):
            return cat
    return "general"


def _is_relevant(text: str, keywords: list[str]) -> bool:
    """Check if text contains any relevant keywords."""
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in keywords)


def _find_keywords(text: str, keywords: list[str]) -> str:
    """Return matching keywords as comma-separated string."""
    found = [kw for kw in keywords if kw.lower() in text.lower()]
    return ", ".join(found[:10])  # Cap at 10 to avoid huge strings


def _extract_region(text: str) -> str:
    """Extract Cameroon region from text."""
    regions = {
        "CENTRE": ["centre", "yaoundé", "yaounde"],
        "LITTORAL": ["littoral", "douala"],
        "WEST": ["ouest", "west", "bafoussam"],
        "NORTH-WEST": ["nord-ouest", "north-west", "bamenda"],
        "SOUTH-WEST": ["sud-ouest", "south-west", "buea", "limbe"],
        "SOUTH": ["sud", "south", "ebolowa"],
        "EAST": ["est", "east", "bertoua"],
        "ADAMAWA": ["adamaoua", "adamawa", "ngaoundéré"],
        "NORTH": ["nord", "north", "garoua"],
        "FAR-NORTH": ["extrême-nord", "extreme-nord", "far-north", "maroua"],
    }
    text_lower = text.lower()
    for region, markers in regions.items():
        if any(m in text_lower for m in markers):
            return region
    return ""


# ─────────────────────────────────────────────
# File downloader
# ─────────────────────────────────────────────
def _download_file(url: str, record_id: str, session: requests.Session) -> str:
    """Download a PDF or document file and return local path."""
    downloadable_exts = [".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx"]
    url_lower = url.lower()
    is_downloadable = any(ext in url_lower for ext in downloadable_exts) or "download" in url_lower

    if not is_downloadable:
        return ""

    try:
        resp = session.get(url, timeout=60, stream=True)
        resp.raise_for_status()

        # Determine extension
        content_type = resp.headers.get("Content-Type", "").lower()
        if "pdf" in content_type or url_lower.endswith(".pdf"):
            ext = ".pdf"
        elif "spreadsheet" in content_type or "excel" in content_type:
            ext = ".xlsx"
        elif "csv" in content_type:
            ext = ".csv"
        elif "word" in content_type or "document" in content_type:
            ext = ".docx"
        else:
            ext = ".pdf"  # Default

        filename = f"{record_id}{ext}"
        filepath = os.path.join(PDF_OUTPUT_DIR, filename)

        total_size = 0
        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
                total_size += len(chunk)

        size_mb = total_size / (1024 * 1024)
        logger.info(f"  ✓ Downloaded: {filename} ({size_mb:.2f} MB)")
        return filepath

    except Exception as e:
        logger.warning(f"  ✗ Download failed for {url}: {e}")
        return ""


# ─────────────────────────────────────────────
# Page fetcher with retry
# ─────────────────────────────────────────────
def _fetch_page(url: str, session: requests.Session, retries: int = 3) -> Optional[BeautifulSoup]:
    """Fetch a page with retries and return parsed soup."""
    for attempt in range(retries):
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "lxml")
        except requests.RequestException as e:
            logger.warning(f"  Attempt {attempt + 1}/{retries} failed for {url}: {e}")
            if attempt < retries - 1:
                time.sleep(random.uniform(2, 5))
    return None


# ─────────────────────────────────────────────
# Per-site scrapers
# ─────────────────────────────────────────────
def _scrape_generic_pages(target: dict, session: requests.Session) -> tuple[list[GovDocument], list[NumericalDataPoint]]:
    """Generic scraper: crawl search_paths, extract links, docs, and numerical data."""
    docs = []
    numericals = []
    base_url = target["base_url"]
    delay_range = target.get("delay", (3, 6))
    keywords = target["keywords"]

    for search_path in target["search_paths"]:
        url = base_url + search_path
        logger.info(f"  Crawling: {url}")

        soup = _fetch_page(url, session)
        if not soup:
            continue

        # Extract full page text for numerical data
        page_text = soup.get_text(separator=" ", strip=True)
        _extract_numerical_from_text(page_text, url, target, numericals)

        # Find all links
        all_links = soup.find_all("a", href=True)
        for link in all_links:
            href = link["href"]
            text = link.get_text(strip=True)

            if not text or len(text) < 5:
                continue

            full_url = urljoin(base_url, href)
            combined_text = text + " " + href

            # Check relevance
            if not _is_relevant(combined_text, keywords):
                continue

            doc = GovDocument(
                title=text[:500],
                source_name=target["name"],
                source_display=target["display_name"],
                document_url=full_url,
                relevance_keywords=_find_keywords(combined_text, keywords),
                language="fr" if target["name"] != "mintp" else "fr/en",
                year=_extract_year(combined_text),
                category=_categorize(text),
                region=_extract_region(text),
            )

            # Extract amounts from link text
            amounts = _extract_amounts(text)
            if amounts:
                doc.amount_fcfa = amounts[0]["value"]

            # Check for downloadable files
            downloadable_exts = [".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx"]
            if any(ext in href.lower() for ext in downloadable_exts) or "download" in href.lower():
                doc.file_url = full_url
                if target.get("download_files"):
                    doc.generate_id()
                    doc.file_local_path = _download_file(full_url, doc.record_id, session)

            doc.generate_id()

            if doc.is_in_date_range():
                docs.append(doc)

        # Pagination: try to find "next" links (with visited tracking)
        max_pages = target.get("max_pages", 3)
        visited_urls = {url}
        current_soup = soup
        for page_num in range(2, max_pages + 1):
            next_link = current_soup.find("a", string=re.compile(r"(suivant|next|›|»)", re.I))
            if not next_link or not next_link.get("href"):
                break
            next_url = urljoin(base_url, next_link["href"])
            if next_url in visited_urls:
                break
            visited_urls.add(next_url)
            time.sleep(random.uniform(*delay_range))
            logger.info(f"  Pagination → {next_url}")
            current_soup = _fetch_page(next_url, session)
            if not current_soup:
                break
            page_text = current_soup.get_text(separator=" ", strip=True)
            _extract_numerical_from_text(page_text, next_url, target, numericals)

        logger.info(f"  → {len(docs)} docs, {len(numericals)} data points so far")
        time.sleep(random.uniform(*delay_range))

    return docs, numericals


def _scrape_armp_notices(target: dict, session: requests.Session) -> tuple[list[GovDocument], list[NumericalDataPoint]]:
    """Scrape ARMP procurement notices with advanced search for RE-related tenders."""
    docs = []
    numericals = []
    extra = target.get("extra_search")
    if not extra:
        return docs, numericals

    search_url = extra["url"]
    delay_range = target.get("delay", (3, 6))

    for params in extra["params_list"]:
        logger.info(f"  ARMP search: keyword='{params.get('mot_cle', '')}'")
        try:
            soup = _fetch_page(f"{search_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}", session)
            if not soup:
                continue

            # Find notice entries
            notices = soup.find_all("li") or soup.find_all("div", class_=re.compile(r"notice|result|item", re.I))
            for notice in notices:
                text = notice.get_text(separator=" ", strip=True)
                if len(text) < 20:
                    continue
                if not _is_relevant(text, target["keywords"]):
                    continue

                # Extract links within notice
                notice_links = notice.find_all("a", href=True)
                doc_url = ""
                file_url = ""
                for nl in notice_links:
                    href = nl["href"]
                    full = urljoin(target["base_url"], href)
                    if "detail" in href.lower():
                        doc_url = full
                    elif "download" in href.lower() or "publications_dl" in href.lower() or "dao_dl" in href.lower():
                        file_url = full

                doc = GovDocument(
                    title=text[:500],
                    source_name=target["name"],
                    source_display=target["display_name"],
                    document_url=doc_url or f"{search_url}?{params.get('mot_cle', '')}",
                    file_url=file_url,
                    year=_extract_year(text),
                    category="procurement",
                    relevance_keywords=_find_keywords(text, target["keywords"]),
                    region=_extract_region(text),
                )

                amounts = _extract_amounts(text)
                if amounts:
                    doc.amount_fcfa = amounts[0]["value"]
                    for amt in amounts:
                        dp = NumericalDataPoint(
                            source_name=target["name"],
                            source_display=target["display_name"],
                            source_url=doc_url,
                            metric_name="procurement_contract_value",
                            value=amt["value"],
                            unit="FCFA",
                            year=doc.year,
                            region=doc.region,
                            category="procurement",
                            context=amt["context"][:300],
                        )
                        dp.generate_id()
                        numericals.append(dp)

                if file_url and target.get("download_files"):
                    doc.generate_id()
                    doc.file_local_path = _download_file(file_url, doc.record_id, session)

                doc.generate_id()
                if doc.is_in_date_range():
                    docs.append(doc)

            time.sleep(random.uniform(*delay_range))

        except Exception as e:
            logger.error(f"  ARMP search error: {e}")

    return docs, numericals


def _extract_numerical_from_text(text: str, url: str, target: dict, numericals: list):
    """Extract numerical data points from page text."""
    amounts = _extract_amounts(text)
    for amt in amounts:
        year = _extract_year(amt["context"]) or _extract_year(url)
        if year and not (DATE_RANGE[0] <= year <= DATE_RANGE[1]):
            continue

        dp = NumericalDataPoint(
            source_name=target["name"],
            source_display=target["display_name"],
            source_url=url,
            metric_name="monetary_value",
            value=amt["value"],
            unit="FCFA",
            year=year,
            region=_extract_region(amt["context"]),
            category=_categorize(amt["context"]),
            context=amt["context"][:300],
        )
        dp.generate_id()
        numericals.append(dp)

    # Extract percentages
    pct_pattern = r"([\d.,]+)\s*%\s*(?:de\s+)?([\w\s]{5,40})"
    for m in re.finditer(pct_pattern, text):
        try:
            value = float(m.group(1).replace(",", "."))
            context = m.group(0)[:200]
            if _is_relevant(context, target["keywords"]):
                dp = NumericalDataPoint(
                    source_name=target["name"],
                    source_display=target["display_name"],
                    source_url=url,
                    metric_name="percentage",
                    value=value,
                    unit="%",
                    currency="",
                    year=_extract_year(context) or _extract_year(url),
                    category=_categorize(context),
                    context=context,
                )
                dp.generate_id()
                numericals.append(dp)
        except ValueError:
            continue


# ─────────────────────────────────────────────
# CSV export
# ─────────────────────────────────────────────
def save_docs_csv(docs: list[GovDocument], filename: str) -> Optional[str]:
    if not docs:
        logger.warning("No documents to save.")
        return None
    filepath = os.path.join(RAW_OUTPUT_DIR, filename)
    fieldnames = list(asdict(docs[0]).keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for d in docs:
            writer.writerow(asdict(d))
    logger.info(f"✓ Saved {len(docs)} documents → {filepath}")
    return filepath


def save_numericals_csv(data: list[NumericalDataPoint], filename: str) -> Optional[str]:
    if not data:
        logger.warning("No numerical data to save.")
        return None
    filepath = os.path.join(RAW_OUTPUT_DIR, filename)
    fieldnames = list(asdict(data[0]).keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for d in data:
            writer.writerow(asdict(d))
    logger.info(f"✓ Saved {len(data)} numerical data points → {filepath}")
    return filepath


# ─────────────────────────────────────────────
# Main orchestrator
# ─────────────────────────────────────────────
def run():
    logger.info("=" * 70)
    logger.info("StratAxis Government Real Estate Scraper — Starting")
    logger.info(f"Date range: {DATE_RANGE[0]} – {DATE_RANGE[1]}")
    logger.info(f"Output: {RAW_OUTPUT_DIR}")
    logger.info("=" * 70)

    all_docs: list[GovDocument] = []
    all_numericals: list[NumericalDataPoint] = []

    for target in TARGETS:
        logger.info(f"\n{'─' * 50}")
        logger.info(f"Scraping: {target['display_name']} ({target['base_url']})")
        logger.info(f"{'─' * 50}")

        session = requests.Session()
        session.verify = False
        session.headers.update(HEADERS)

        try:
            # Generic page scraping
            docs, numericals = _scrape_generic_pages(target, session)
            all_docs.extend(docs)
            all_numericals.extend(numericals)

            # ARMP-specific notice scraping
            if target["name"] == "armp":
                armp_docs, armp_nums = _scrape_armp_notices(target, session)
                all_docs.extend(armp_docs)
                all_numericals.extend(armp_nums)

            logger.info(f"  ✓ {target['display_name']}: {len(docs)} docs, {len(numericals)} data points")

        except Exception as e:
            logger.error(f"  ✗ Error scraping {target['name']}: {e}")

        finally:
            session.close()

    # ── Deduplicate ──
    seen_docs = set()
    unique_docs = []
    for doc in all_docs:
        if doc.record_id not in seen_docs:
            seen_docs.add(doc.record_id)
            unique_docs.append(doc)

    seen_nums = set()
    unique_nums = []
    for dp in all_numericals:
        if dp.record_id not in seen_nums:
            seen_nums.add(dp.record_id)
            unique_nums.append(dp)

    # ── Save ──
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    docs_file = save_docs_csv(unique_docs, f"gov_re_docs_{timestamp}.csv")
    nums_file = save_numericals_csv(unique_nums, f"gov_re_numerical_{timestamp}.csv")

    # ── Summary ──
    logger.info("\n" + "=" * 70)
    logger.info("SCRAPING COMPLETE — SUMMARY")
    logger.info("=" * 70)
    logger.info(f"Total unique documents:    {len(unique_docs)}")
    logger.info(f"Total numerical data pts:  {len(unique_nums)}")
    logger.info(f"Files downloaded to:       {PDF_OUTPUT_DIR}")
    if docs_file:
        logger.info(f"Documents CSV:             {docs_file}")
    if nums_file:
        logger.info(f"Numerical CSV:             {nums_file}")

    # Per-source breakdown
    for target in TARGETS:
        src_docs = [d for d in unique_docs if d.source_name == target["name"]]
        src_nums = [n for n in unique_nums if n.source_name == target["name"]]
        logger.info(f"  {target['display_name']:45s} → {len(src_docs):4d} docs, {len(src_nums):4d} data pts")

    logger.info("=" * 70)
    return unique_docs, unique_nums


if __name__ == "__main__":
    run()
