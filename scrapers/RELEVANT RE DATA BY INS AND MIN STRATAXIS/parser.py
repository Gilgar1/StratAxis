"""
StratAxis - HTML Parser Module
Extracts structured and unstructured data from HTML pages
"""

import re
import json
import logging
from bs4 import BeautifulSoup, Tag
from typing import List, Dict, Optional, Set
from datetime import datetime

from config import KEYWORDS, CATEGORIES, REGIONS, DOCUMENT_TYPES

logger = logging.getLogger(__name__)


class HTMLParser:
    """
    Extracts structured data, tables, and relevant text from HTML pages
    """
    
    def __init__(self):
        self.keyword_pattern = self._compile_keyword_pattern()
    
    def _compile_keyword_pattern(self) -> re.Pattern:
        """Compile all keywords into a single regex pattern"""
        all_keywords = []
        for category_keywords in KEYWORDS.values():
            all_keywords.extend(category_keywords)
        
        # Create case-insensitive pattern
        pattern = r'\b(' + '|'.join(re.escape(kw) for kw in all_keywords) + r')\b'
        return re.compile(pattern, re.IGNORECASE)
    
    def extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        # Try title tag
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        
        # Try h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        # Try meta title
        meta_title = soup.find('meta', property='og:title')
        if meta_title and meta_title.get('content'):
            return meta_title['content'].strip()
        
        return "No title found"
    
    def extract_tables(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Extract all tables from the page and convert to structured format
        """
        tables = []
        
        for idx, table in enumerate(soup.find_all('table')):
            try:
                table_data = []
                headers = []
                
                # Extract headers
                thead = table.find('thead')
                if thead:
                    header_row = thead.find('tr')
                    if header_row:
                        headers = [th.get_text().strip() for th in header_row.find_all(['th', 'td'])]
                
                # If no thead, use first row as headers
                if not headers:
                    first_row = table.find('tr')
                    if first_row:
                        potential_headers = first_row.find_all(['th', 'td'])
                        if potential_headers:
                            headers = [h.get_text().strip() for h in potential_headers]
                
                # Extract data rows
                tbody = table.find('tbody') if table.find('tbody') else table
                rows = tbody.find_all('tr')
                
                # Skip header row if we extracted it
                start_idx = 1 if not thead and headers else 0
                
                for row in rows[start_idx:]:
                    cells = row.find_all(['td', 'th'])
                    if cells:
                        row_data = [cell.get_text().strip() for cell in cells]
                        
                        # Create dict if we have headers
                        if headers and len(row_data) == len(headers):
                            table_data.append(dict(zip(headers, row_data)))
                        else:
                            table_data.append(row_data)
                
                if table_data:
                    tables.append({
                        'table_index': idx,
                        'headers': headers,
                        'data': table_data,
                        'row_count': len(table_data)
                    })
                    
            except Exception as e:
                logger.warning(f"Error extracting table {idx}: {e}")
                continue
        
        logger.debug(f"Extracted {len(tables)} tables")
        return tables
    
    def extract_clean_text(self, soup: BeautifulSoup) -> str:
        """
        Extract clean text content, removing scripts, styles, navigation
        """
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']):
            element.decompose()
        
        # Get text from main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|main|body', re.I))
        
        if main_content:
            text = main_content.get_text(separator=' ', strip=True)
        else:
            text = soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text
    
    def detect_keywords(self, text: str) -> List[str]:
        """
        Detect real estate keywords in text
        """
        matches = self.keyword_pattern.findall(text)
        # Return unique keywords (case-insensitive)
        unique_keywords = list(set([m.lower() for m in matches]))
        return unique_keywords
    
    def classify_category(self, text: str, title: str) -> str:
        """
        Classify content into a category based on keyword presence
        """
        combined_text = f"{title} {text}".lower()
        
        category_scores = {}
        
        for category, keywords in KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in combined_text)
            category_scores[category] = score
        
        # Return category with highest score
        if category_scores:
            top_category = max(category_scores.items(), key=lambda x: x[1])
            if top_category[1] > 0:
                return top_category[0]
        
        return "general"
    
    def detect_region(self, text: str, title: str) -> Optional[str]:
        """
        Detect Cameroon region mentioned in text
        """
        combined_text = f"{title} {text}".lower()
        
        for region in REGIONS:
            if region.lower() in combined_text:
                return region
        
        return None
    
    def extract_pdf_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """
        Extract all PDF links from the page
        """
        from urllib.parse import urljoin
        
        pdf_links = []
        
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            
            # Check if it's a PDF
            if href.lower().endswith('.pdf') or 'pdf' in href.lower():
                absolute_url = urljoin(base_url, href)
                
                # Get link text
                link_text = a_tag.get_text().strip()
                if not link_text:
                    link_text = href.split('/')[-1]
                
                pdf_links.append({
                    'url': absolute_url,
                    'title': link_text
                })
        
        logger.debug(f"Found {len(pdf_links)} PDF links")
        return pdf_links
    
    def calculate_relevance_score(self, title: str, text: str, has_tables: bool, 
                                  is_pdf: bool, pub_date: Optional[datetime]) -> float:
        """
        Calculate relevance score for the content
        """
        from config import RELEVANCE_WEIGHTS, END_DATE
        
        score = 0.0
        
        # Title match
        title_keywords = self.detect_keywords(title)
        if title_keywords:
            score += len(title_keywords) * RELEVANCE_WEIGHTS['title_match']
        
        # Keyword density
        text_keywords = self.detect_keywords(text)
        if text and text_keywords:
            density = len(text_keywords) / (len(text.split()) / 100)  # Keywords per 100 words
            score += density * RELEVANCE_WEIGHTS['keyword_density']
        
        # Has structured data
        if has_tables:
            score += RELEVANCE_WEIGHTS['has_structured_data']
        
        # Is PDF
        if is_pdf:
            score += RELEVANCE_WEIGHTS['is_pdf']
        
        # Recent date (bonus for more recent content)
        if pub_date and END_DATE:
            days_old = (END_DATE - pub_date).days
            if days_old < 365:
                score += RELEVANCE_WEIGHTS['recent_date'] * (1 - days_old / 365)
        
        return round(score, 2)
    
    def parse_page(self, page_data: Dict) -> Dict:
        """
        Main parsing method - extracts all relevant data from a page
        """
        soup = page_data['soup']
        url = page_data['url']
        
        try:
            # Extract basic information
            title = self.extract_title(soup)
            
            # Extract structured data
            tables = self.extract_tables(soup)
            
            # Extract clean text
            clean_text = self.extract_clean_text(soup)
            
            # Detect keywords
            keywords = self.detect_keywords(f"{title} {clean_text}")
            
            # Classify category
            category = self.classify_category(clean_text, title)
            
            # Detect region
            region = self.detect_region(clean_text, title)
            
            # Extract PDF links
            pdf_links = self.extract_pdf_links(soup, url)
            
            # Calculate relevance score
            relevance_score = self.calculate_relevance_score(
                title, clean_text, len(tables) > 0, False, page_data.get('publication_date')
            )
            
            return {
                'title': title,
                'url': url,
                'publication_date': page_data.get('publication_date'),
                'tables': tables,
                'clean_text': clean_text[:5000],  # Limit text length
                'keywords': keywords,
                'category': category,
                'region': region,
                'pdf_links': pdf_links,
                'relevance_score': relevance_score,
                'has_structured_data': len(tables) > 0
            }
            
        except Exception as e:
            logger.error(f"Error parsing page {url}: {e}")
            return {
                'title': 'Error',
                'url': url,
                'error': str(e)
            }
