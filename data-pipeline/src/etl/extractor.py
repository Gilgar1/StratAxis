from typing import List, Dict, Any
from ..scrapers.scraper_factory import ScraperFactory
from ..ocr.pdf_processor import PDFProcessor
from ..ocr.text_extractor import TextExtractor
from ..ocr.data_parser import DataParser
from ..utils.logger import setup_logger
from pathlib import Path

class Extractor:
    def __init__(self):
        self.logger = setup_logger("etl.extractor")
        self.pdf_processor = PDFProcessor()
        self.text_extractor = TextExtractor()
        self.data_parser = DataParser()

    def extract_from_scrapers(self) -> List[Dict[str, Any]]:
        all_data = []
        scrapers = ScraperFactory.get_all_scrapers()
        for scraper in scrapers:
            try:
                data = scraper.scrape()
                all_data.extend(data)
            except Exception as e:
                self.logger.error(f"Scraper {scraper.name} failed: {e}")
        return all_data

    def extract_from_ocr(self, pdf_dir: str) -> List[Dict[str, Any]]:
        all_data = []
        pdf_files = list(Path(pdf_dir).glob("*.pdf"))
        for pdf_file in pdf_files:
            try:
                img_paths = self.pdf_processor.process_pdf(str(pdf_file))
                text = self.text_extractor.extract_text_from_images(img_paths)
                data = self.data_parser.parse_text(text)
                all_data.extend(data)
            except Exception as e:
                self.logger.error(f"OCR for {pdf_file} failed: {e}")
        return all_data
