from .extractor import Extractor
from .transformer import Transformer
from .loader import Loader
from ..validation.schema_validator import SchemaValidator
from ..utils.logger import setup_logger
from ..utils.config import config

class Pipeline:
    def __init__(self):
        self.logger = setup_logger("pipeline")
        self.extractor = Extractor()
        self.transformer = Transformer()
        self.validator = SchemaValidator()
        self.loader = Loader()

    def run(self):
        self.logger.info("Initializing Data Pipeline Execution")
        
        # 1. Extraction
        self.logger.info("Starting Extraction Phase")
        scraped_data = self.extractor.extract_from_scrapers()
        ocr_data = self.extractor.extract_from_ocr(config.get("ocr.sources_path", "./data/sources"))
        raw_data = scraped_data + ocr_data
        
        # 2. Transformation
        self.logger.info("Starting Transformation Phase")
        transformed_data = self.transformer.transform_batch(raw_data)
        
        # 3. Validation
        self.logger.info("Starting Validation Phase")
        validated_data = []
        for record in transformed_data:
            if self.validator.validate(record):
                validated_data.append(record)
        
        # 4. Loading
        self.logger.info("Starting Load Phase")
        if validated_data:
            self.loader.load_properties(validated_data)
        else:
            self.logger.warning("No validated records to load")
            
        self.logger.info("Data Pipeline Execution Completed")

if __name__ == "__main__":
    pipeline = Pipeline()
    pipeline.run()
