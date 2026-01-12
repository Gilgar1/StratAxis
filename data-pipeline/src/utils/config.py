import yaml
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    def __init__(self, config_path: str = "config.yaml"):
        # Assume config.yaml is in the root of data-pipeline
        root_dir = Path(__file__).parent.parent.parent
        full_path = root_dir / config_path
        
        with open(full_path, "r") as f:
            self._config = yaml.safe_load(f)
            
        # Override with environment variables if present
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            self._config["database"]["url"] = db_url

    def get(self, key: str, default=None):
        keys = key.split(".")
        val = self._config
        for k in keys:
            if isinstance(val, dict):
                val = val.get(k)
            else:
                return default
        return val if val is not None else default

# Singleton instance
config = Config()
