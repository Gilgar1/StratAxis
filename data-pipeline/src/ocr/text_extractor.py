import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
from typing import List
from ..utils.logger import setup_logger
from ..utils.config import config
import os

class TextExtractor:
    """
    OCR Engine with image preprocessing for improved accuracy on legal documents.
    """
    def __init__(self):
        self.logger = setup_logger("ocr.text_extractor")
        tesseract_path = config.get("ocr.tesseract_path")
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

    def preprocess_image(self, image_path: str) -> Image.Image:
        """Apply filters to improve OCR quality (Contrast, Grayscale, Sharpness)"""
        img = Image.open(image_path).convert('L') # Grayscale
        
        # Increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        # Binarization (thresholding)
        img = img.point(lambda x: 0 if x < 128 else 255, '1')
        
        # Slight sharpening
        img = img.filter(ImageFilter.SHARPEN)
        
        return img

    def extract_text_from_images(self, image_paths: List[str]) -> str:
        all_text = []
        for path in image_paths:
            self.logger.info(f"Extracting text from: {path} with preprocessing")
            try:
                processed_img = self.preprocess_image(path)
                # Use --psm 3 (Fully automatic page segmentation)
                text = pytesseract.image_to_string(processed_img, config='--psm 3')
                all_text.append(text)
            except Exception as e:
                self.logger.error(f"Error extracting text from {path}: {e}")
        
        return "\n--- Page Separator ---\n".join(all_text)
