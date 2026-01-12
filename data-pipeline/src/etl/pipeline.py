from datetime import datetime
from .extractor import Extractor
from .transformer import Transformer
from .loader import Loader
from ..validation.data_quality import DataQualityChecker
from ..validation.outlier_detection import OutlierDetector
from ..utils.logger import setup_logger
from ..utils.config import config

class Pipeline:
    """
    Main Pipeline Orchestrator (Blueprint 2.3.3.5).
    Extracts, transforms, validates, and loads property data.
    """
    def __init__(self):
        self.logger = setup_logger("pipeline")
        self.extractor = Extractor()
        self.transformer = Transformer()
        self.quality_checker = DataQualityChecker()
        self.outlier_detector = OutlierDetector()
        self.loader = Loader()
        self.state = {
            "start_time": None,
            "end_time": None,
            "processed_count": 0,
            "validated_count": 0,
            "rejected_count": 0,
            "errors": []
        }

    def run(self):
        self.state["start_time"] = datetime.utcnow()
        self.logger.info("Initializing Data Pipeline Execution")
        
        try:
            # 1. Extraction (Blueprint 2.3.3.1)
            self.logger.info("Starting Extraction Phase")
            scraped_data = self.extractor.extract_from_scrapers()
            ocr_data = self.extractor.extract_from_ocr(config.get("ocr.sources_path", "./data/sources"))
            raw_data = scraped_data + ocr_data
            self.state["processed_count"] = len(raw_data)
            
            # 2. Transformation (Blueprint 2.3.3.2)
            self.logger.info("Starting Transformation Phase")
            transformed_data = self.transformer.transform_batch(raw_data)
            
            # 3. Validation & Quality Scoring (Blueprint 2.3.4)
            self.logger.info("Starting Validation Phase")
            quality_ready_data = []
            for record in transformed_data:
                # Calculate quality score and check threshold (70%)
                if self.quality_checker.is_valid(record, threshold=0.7):
                    quality_ready_data.append(record)
                else:
                    self.state["rejected_count"] += 1
            
            # 4. Outlier Detection
            self.logger.info("Running Outlier Detection")
            self.outlier_detector.detect_and_flag(quality_ready_data)
            
            # Filter ones that passed outlier check (status == 'validated')
            final_data = [r for r in quality_ready_data if r.get("validation_status") == "validated"]
            self.state["validated_count"] = len(final_data)
            self.state["rejected_count"] += (len(quality_ready_data) - len(final_data))
            
            # 5. Loading (Blueprint 2.3.3.4)
            self.logger.info("Starting Load Phase")
            if final_data:
                self.loader.load_batch(final_data)
            else:
                self.logger.warning("No validated records to load")
                
            self.state["end_time"] = datetime.utcnow()
            duration = (self.state["end_time"] - self.state["start_time"]).total_seconds()
            
            self.logger.info(
                f"Pipeline Completed in {duration:.2f}s | "
                f"Processed: {self.state['processed_count']} | "
                f"Validated: {self.state['validated_count']} | "
                f"Rejected: {self.state['rejected_count']}"
            )
            
        except Exception as e:
            self.logger.error(f"Pipeline failed: {e}")
            self.state["errors"].append(str(e))
            raise

if __name__ == "__main__":
    pipeline = Pipeline()
    pipeline.run()
