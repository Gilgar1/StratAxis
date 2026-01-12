import argparse
import sys
from etl.pipeline import Pipeline
from utils.logger import setup_logger

def main():
    parser = argparse.ArgumentParser(description="StratAxis Data Pipeline CLI")
    parser.add_argument("command", choices=["run", "scrape", "ocr", "train"], help="Command to execute")
    
    args = parser.parse_args()
    logger = setup_logger("main")
    
    if args.command == "run":
        logger.info("Starting full pipeline run")
        pipeline = Pipeline()
        pipeline.run()
    elif args.command == "scrape":
        # logic for manual scrap trigger
        pass
    elif args.command == "ocr":
        # logic for manual ocr trigger
        pass
    elif args.command == "train":
        # logic for manual training trigger
        pass
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
