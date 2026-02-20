"""
StratAxis - PDF Processor Module
Handles PDF download and text extraction
"""

import os
import requests
import logging
from typing import Optional, Dict
from datetime import datetime
import hashlib
from pathlib import Path

# PDF text extraction
try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    
try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
    PDFMINER_AVAILABLE = True
except ImportError:
    PDFMINER_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

from config import PDF_SETTINGS, CRAWL_SETTINGS, START_DATE, END_DATE

logger = logging.getLogger(__name__)


class PDFProcessor:
    """
    Downloads and processes PDF files
    """
    
    def __init__(self, download_dir: str = None):
        self.download_dir = download_dir or PDF_SETTINGS['download_directory']
        self._ensure_directory()
        
        # Check available PDF libraries
        self.extraction_method = self._determine_extraction_method()
    
    def _ensure_directory(self):
        """Create download directory if it doesn't exist"""
        Path(self.download_dir).mkdir(parents=True, exist_ok=True)
        logger.info(f"PDF download directory: {self.download_dir}")
    
    def _determine_extraction_method(self) -> str:
        """Determine which PDF extraction library to use"""
        if PYMUPDF_AVAILABLE:
            logger.info("Using PyMuPDF for PDF extraction")
            return 'pymupdf'
        elif PDFMINER_AVAILABLE:
            logger.info("Using pdfminer.six for PDF extraction")
            return 'pdfminer'
        elif PYPDF2_AVAILABLE:
            logger.info("Using PyPDF2 for PDF extraction")
            return 'pypdf2'
        else:
            logger.warning("No PDF extraction library available")
            return 'none'
    
    def _generate_filename(self, url: str, title: str = None) -> str:
        """Generate a safe filename for the PDF"""
        # Try to use title if provided
        if title:
            # Clean title
            safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in title)
            safe_title = safe_title[:100]  # Limit length
            filename = f"{safe_title}.pdf"
        else:
            # Use URL hash
            url_hash = hashlib.md5(url.encode()).hexdigest()[:10]
            filename = f"document_{url_hash}.pdf"
        
        return filename
    
    def download_pdf(self, url: str, title: str = None) -> Optional[str]:
        """
        Download a PDF file
        Returns the local file path if successful
        """
        try:
            logger.info(f"Downloading PDF: {url}")
            
            # Check file size first with HEAD request
            head_response = requests.head(url, timeout=CRAWL_SETTINGS['timeout'], allow_redirects=True)
            
            if head_response.status_code != 200:
                logger.warning(f"PDF not accessible (status {head_response.status_code}): {url}")
                return None
            
            # Check size
            content_length = head_response.headers.get('content-length')
            if content_length:
                size_mb = int(content_length) / (1024 * 1024)
                if size_mb > PDF_SETTINGS['max_pdf_size_mb']:
                    logger.warning(f"PDF too large ({size_mb:.1f}MB): {url}")
                    return None
            
            # Download the file
            response = requests.get(
                url, 
                timeout=CRAWL_SETTINGS['timeout'],
                headers={'User-Agent': CRAWL_SETTINGS['user_agent']},
                allow_redirects=True
            )
            response.raise_for_status()
            
            # Verify it's actually a PDF
            if not response.content.startswith(b'%PDF'):
                logger.warning(f"Downloaded file is not a PDF: {url}")
                return None
            
            # Save to disk
            filename = self._generate_filename(url, title)
            file_path = os.path.join(self.download_dir, filename)
            
            # Avoid overwriting
            counter = 1
            base_path = file_path
            while os.path.exists(file_path):
                name, ext = os.path.splitext(base_path)
                file_path = f"{name}_{counter}{ext}"
                counter += 1
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Downloaded PDF to: {file_path}")
            return file_path
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error downloading PDF {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error downloading PDF {url}: {e}")
            return None
    
    def extract_text_pymupdf(self, file_path: str) -> str:
        """Extract text using PyMuPDF"""
        try:
            text = ""
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
            return text
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed for {file_path}: {e}")
            return ""
    
    def extract_text_pdfminer(self, file_path: str) -> str:
        """Extract text using pdfminer.six"""
        try:
            return pdfminer_extract_text(file_path)
        except Exception as e:
            logger.error(f"pdfminer extraction failed for {file_path}: {e}")
            return ""
    
    def extract_text_pypdf2(self, file_path: str) -> str:
        """Extract text using PyPDF2"""
        try:
            text = ""
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed for {file_path}: {e}")
            return ""
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from PDF using available method
        """
        if not os.path.exists(file_path):
            logger.error(f"PDF file not found: {file_path}")
            return ""
        
        if self.extraction_method == 'pymupdf':
            return self.extract_text_pymupdf(file_path)
        elif self.extraction_method == 'pdfminer':
            return self.extract_text_pdfminer(file_path)
        elif self.extraction_method == 'pypdf2':
            return self.extract_text_pypdf2(file_path)
        else:
            logger.warning("No PDF extraction method available")
            return ""
    
    def extract_tables_from_pdf(self, file_path: str) -> list:
        """
        Attempt to extract tables from PDF
        Note: This is basic - production systems might use camelot or tabula
        """
        # Placeholder for table extraction
        # Would require libraries like camelot-py or tabula-py
        logger.debug(f"Table extraction not implemented for {file_path}")
        return []
    
    def process_pdf(self, url: str, title: str = None) -> Optional[Dict]:
        """
        Download and process a PDF file
        Returns dict with file path and extracted text
        """
        # Download
        file_path = self.download_pdf(url, title)
        
        if not file_path:
            return None
        
        # Extract text if enabled
        text = ""
        if PDF_SETTINGS['extract_text']:
            text = self.extract_text(file_path)
        
        # Extract tables if enabled
        tables = []
        if PDF_SETTINGS['extract_tables']:
            tables = self.extract_tables_from_pdf(file_path)
        
        return {
            'file_path': file_path,
            'url': url,
            'title': title or 'Unknown',
            'extracted_text': text,
            'tables': tables,
            'file_size': os.path.getsize(file_path),
            'download_timestamp': datetime.now()
        }
    
    def detect_pdf_date(self, file_path: str) -> Optional[datetime]:
        """
        Attempt to extract creation/modification date from PDF metadata
        """
        if not PYMUPDF_AVAILABLE:
            return None
        
        try:
            with fitz.open(file_path) as doc:
                metadata = doc.metadata
                
                # Try creation date
                if metadata.get('creationDate'):
                    date_str = metadata['creationDate']
                    # Parse PDF date format: D:YYYYMMDDHHmmSS
                    if date_str.startswith('D:'):
                        date_str = date_str[2:]
                    try:
                        date = datetime.strptime(date_str[:14], '%Y%m%d%H%M%S')
                        if START_DATE <= date <= END_DATE:
                            return date
                    except:
                        pass
                
                # Try modification date
                if metadata.get('modDate'):
                    date_str = metadata['modDate']
                    if date_str.startswith('D:'):
                        date_str = date_str[2:]
                    try:
                        date = datetime.strptime(date_str[:14], '%Y%m%d%H%M%S')
                        if START_DATE <= date <= END_DATE:
                            return date
                    except:
                        pass
                        
        except Exception as e:
            logger.error(f"Error extracting PDF metadata from {file_path}: {e}")
        
        return None
