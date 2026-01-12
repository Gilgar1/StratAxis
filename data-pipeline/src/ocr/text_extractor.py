import pytesseract
from PIL import Image
from typing import List
from ..utils.logger import setup_logger
from ..utils.config import config

class TextExtractor:
    def __init__(self):
        self.logger = setup_logger("ocr.text_extractor")
        tesseract_path = config.get("ocr.tesseract_path")
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

    def extract_text_from_images(self, image_paths: List[str]) -> str:
        """Extracts text from a list of images and joins them"""
        all_text = []
        for path in image_paths:
            self.logger.info(f"Extracting text from: {path}")
            try:
                text = pytesseract.image_to_string(Image.open(path))
                all_text.append(text)
            except Exception as e:
                self.logger.error(f"Error extracting text from {path}: {e}")
        
        return "\n--- Page Separator ---\n".join(all_text)
