import logging
import sys
from src.config.env import settings

def setup_logging():
    """Configure structured logging for the application."""
    logging.basicConfig(
        level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger("strataxis")

logger = setup_logging()
