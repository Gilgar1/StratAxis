from pdf2image import convert_from_path
from pathlib import Path
from typing import List
from ..utils.logger import setup_logger

class PDFProcessor:
    def __init__(self, temp_dir: str = "./temp/ocr"):
        self.logger = setup_logger("ocr.pdf_processor")
        self.temp_dir = Path(temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def process_pdf(self, pdf_path: str) -> List[str]:
        """Converts PDF to a list of image paths"""
        self.logger.info(f"Processing PDF: {pdf_path}")
        try:
            images = convert_from_path(pdf_path)
            image_paths = []
            
            pdf_name = Path(pdf_path).stem
            for i, image in enumerate(images):
                image_path = self.temp_dir / f"{pdf_name}_page_{i}.jpg"
                image.save(image_path, "JPEG")
                image_paths.append(str(image_path))
                
            return image_paths
        except Exception as e:
            self.logger.error(f"Error processing PDF {pdf_path}: {e}")
            return []
