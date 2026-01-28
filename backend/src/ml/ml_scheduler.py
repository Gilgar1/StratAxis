"""
ML Model Retraining Scheduler (Blueprint 5.5.2)

Handles:
- Scheduled monthly retraining
- On-demand retraining
- Automatic retraining triggers
- Model performance comparison
"""

import schedule
import time
from datetime import datetime
from sqlmodel import Session, select, func

from src.config.database import engine
from src.models.property import Property, ValidationStatus
from src.models.ml_model import MLModel, ModelType
from src.ml.feature_engineering import FeatureEngineer
from src.ml.model_training import ModelTrainer
from src.ml.trend_forecasting import TrendForecaster
from src.utils.logger import logger


class MLScheduler:
    """
    ML Model Retraining Scheduler (Blueprint 5.5.2)
    
    Trigger conditions:
    - Scheduled: Monthly retraining
    - On-demand: Admin API trigger
    - Automatic: > 1000 new validated properties
    """
    
    def __init__(self):
        self.last_training_property_count = 0
        self.automatic_threshold = 1000  # Blueprint 5.5.2.1.c
    
    def check_automatic_retraining_trigger(self) -> bool:
        """
        Check if automatic retraining should be triggered (Blueprint 5.5.2.1.c)
        
        Triggers if > 1000 new validated properties since last training
        """
        with Session(engine) as session:
            # Get current count of validated properties
            current_count = session.exec(
                select(func.count()).select_from(Property)
                .where(Property.validation_status == ValidationStatus.VALIDATED)
            ).one()
            
            # Check if threshold exceeded
            new_properties = current_count - self.last_training_property_count
            
            if new_properties >= self.automatic_threshold:
                logger.info(
                    f"Automatic retraining triggered: "
                    f"{new_properties} new validated properties (threshold: {self.automatic_threshold})"
                )
                return True
            
            logger.debug(f"Automatic retraining check: {new_properties}/{self.automatic_threshold} new properties")
            return False
    
    def retrain_price_prediction_model(
        self,
        trigger_type: str = "scheduled"
    ) -> dict:
        """
        Retrain price prediction model (Blueprint 5.5.2.2)
        
        Process:
        1. Load updated dataset
        2. Re-run feature engineering
        3. Retrain model (with same hyperparameters or re-tune if degraded)
        4. Evaluate new model vs current active model
        5. Deploy if better performance
        
        Args:
            trigger_type: "scheduled", "manual", or "automatic"
            
        Returns:
            Retraining results dictionary
        """
        logger.info("\n" + "="*70)
        logger.info(f"ML RETRAINING: Price Prediction ({trigger_type.upper()})")
        logger.info("="*70 + "\n")
        
        start_time = datetime.utcnow()
        
        with Session(engine) as session:
            try:
                # 1. Load updated dataset (Blueprint 5.5.2.2.a)
                logger.info("Step 1: Loading updated dataset...")
                feature_engineer = FeatureEngineer(session)
                df, feature_columns = feature_engineer.run_full_pipeline(
                    months_back=24,
                    max_features=20
                )
                
                if len(df) == 0:
                    logger.warning("No data available for retraining")
                    return {"status": "failed", "reason": "No data available"}
                
                logger.info(f"Dataset loaded: {len(df)} samples, {len(feature_columns)} features")
                
                # 2. Retrain model (Blueprint 5.5.2.2.c)
                logger.info("\nStep 2: Training new model...")
                trainer = ModelTrainer(session)
                
                training_result = trainer.train_price_prediction_model(
                    df=df,
                    feature_columns=feature_columns,
                    target_column='price_per_m2'
                )
                
                new_model_metrics = training_result['metrics']
                new_model_id = str(training_result['metadata'].id)
                
                # 3. Evaluate vs current active model (Blueprint 5.5.2.2.d)
                logger.info("\nStep 3: Comparing with active model...")
                
                active_model = session.exec(
                    select(MLModel).where(
                        MLModel.model_type == ModelType.PRICE_PREDICTION,
                        MLModel.status == 'active'
                    )
                ).first()
                
                should_deploy = False
                comparison = {}
                
                if active_model:
                    active_metrics = active_model.metrics or {}
                    
                    comparison = {
                        "active_r2": active_metrics.get('r2', 0),
                        "new_r2": new_model_metrics.get('r2', 0),
                        "active_rmse": active_metrics.get('rmse', 0),
                        "new_rmse": new_model_metrics.get('rmse', 0)
                    }
                    
                    # Deploy if new model has better R² (Blueprint 5.5.2.2.e)
                    if new_model_metrics.get('r2', 0) > active_metrics.get('r2', 0):
                        should_deploy = True
                        logger.info(
                            f"✓ New model performs better: "
                            f"R²={new_model_metrics.get('r2', 0):.4f} > {active_metrics.get('r2', 0):.4f}"
                        )
                    else:
                        logger.info(
                            f"✗ New model does not improve: "
                            f"R²={new_model_metrics.get('r2', 0):.4f} ≤ {active_metrics.get('r2', 0):.4f}"
                        )
                        logger.info("Keeping current active model")
                else:
                    # No active model, deploy automatically
                    should_deploy = True
                    logger.info("No active model found. Deploying new model.")
                
                # 4. Deploy if better (Blueprint 5.5.2.2.e)
                if should_deploy:
                    logger.info("\nStep 4: Deploying new model...")
                    deployment_result = trainer.deploy_model(new_model_id)
                    
                    # Update property count for automatic trigger tracking
                    self.last_training_property_count = session.exec(
                        select(func.count()).select_from(Property)
                        .where(Property.validation_status == ValidationStatus.VALIDATED)
                    ).one()
                    
                    execution_time = (datetime.utcnow() - start_time).total_seconds()
                    
                    logger.info("\n" + "="*70)
                    logger.info("RETRAINING COMPLETE - MODEL DEPLOYED")
                    logger.info("="*70)
                    logger.info(f"Execution time: {execution_time:.1f}s")
                    logger.info(f"Training samples: {len(df)}")
                    logger.info(f"New model R²: {new_model_metrics.get('r2', 0):.4f}")
                    logger.info("="*70 + "\n")
                    
                    return {
                        "status": "deployed",
                        "trigger_type": trigger_type,
                        "model_id": new_model_id,
                        "metrics": new_model_metrics,
                        "comparison": comparison,
                        "training_samples": len(df),
                        "execution_time": execution_time
                    }
                else:
                    execution_time = (datetime.utcnow() - start_time).total_seconds()
                    
                    logger.info("\n" + "="*70)
                    logger.info("RETRAINING COMPLETE - MODEL NOT DEPLOYED")
                    logger.info("="*70 + "\n")
                    
                    return {
                        "status": "not_deployed",
                        "trigger_type": trigger_type,
                        "reason": "Performance not improved",
                        "metrics": new_model_metrics,
                        "comparison": comparison,
                        "training_samples": len(df),
                        "execution_time": execution_time
                    }
                    
            except Exception as e:
                logger.error(f"Retraining failed: {e}", exc_info=True)
                return {
                    "status": "failed",
                    "trigger_type": trigger_type,
                    "error": str(e)
                }
    
    def retrain_trend_forecast_model(
        self,
        trigger_type: str = "scheduled"
    ) -> dict:
        """
        Retrain trend forecast model (Blueprint 5.5.2)
        
        Args:
            trigger_type: "scheduled", "manual", or "automatic"
            
        Returns:
            Retraining results dictionary
        """
        logger.info("\n" + "="*70)
        logger.info(f"ML RETRAINING: Trend Forecast ({trigger_type.upper()})")
        logger.info("="*70 + "\n")
        
        start_time = datetime.utcnow()
        
        with Session(engine) as session:
            try:
                forecaster = TrendForecaster(session)
                
                # Prepare time series data
                df = forecaster.prepare_time_series_data(months_back=24)
                
                if len(df) < 12:
                    logger.warning("Not enough data for trend forecasting (minimum 12 months)")
                    return {"status": "failed", "reason": "Insufficient data"}
                
                # Train model
                result = forecaster.train_forecast_model(df, forecast_periods=6)
                
                if result:
                    execution_time = (datetime.utcnow() - start_time).total_seconds()
                    
                    logger.info("\n" + "="*70)
                    logger.info("TREND FORECAST RETRAINING COMPLETE")
                    logger.info("="*70 + "\n")
                    
                    return {
                        "status": "success",
                        "trigger_type": trigger_type,
                        "metrics": result['metrics'],
                        "training_points": len(df),
                        "execution_time": execution_time
                    }
                else:
                    return {"status": "failed", "reason": "Training failed"}
                    
            except Exception as e:
                logger.error(f"Trend forecast retraining failed: {e}", exc_info=True)
                return {
                    "status": "failed",
                    "trigger_type": trigger_type,
                    "error": str(e)
                }
    
    def scheduled_monthly_retraining(self):
        """
        Scheduled monthly retraining (Blueprint 5.5.2.1.a)
        
        Runs both price prediction and trend forecast retraining
        """
        logger.info("=== SCHEDULED MONTHLY ML RETRAINING STARTED ===")
        
        # Retrain price prediction model
        price_result = self.retrain_price_prediction_model(trigger_type="scheduled")
        
        # Retrain trend forecast model
        trend_result = self.retrain_trend_forecast_model(trigger_type="scheduled")
        
        logger.info("=== SCHEDULED MONTHLY ML RETRAINING COMPLETED ===")
        logger.info(f"Price Prediction: {price_result.get('status')}")
        logger.info(f"Trend Forecast: {trend_result.get('status')}")
    
    def check_and_retrain_if_needed(self):
        """
        Check automatic trigger and retrain if needed
        
        Called periodically by scheduler
        """
        if self.check_automatic_retraining_trigger():
            logger.info("Triggering automatic retraining...")
            self.retrain_price_prediction_model(trigger_type="automatic")


def setup_ml_scheduler():
    """
    Configure ML retraining scheduled jobs (Blueprint 5.5.2.1)
    
    Jobs:
    - Monthly retraining: 1st of month @ 04:00 UTC
    - Automatic trigger check: Daily @ 05:00 UTC
    
    Call this at application startup
    """
    logger.info("Setting up ML retraining scheduler...")
    
    scheduler = MLScheduler()
    
    # Monthly retraining (Blueprint 5.5.2.1.a)
    # Schedule for 1st of each month at 04:00 UTC
    schedule.every().month.at("04:00").do(scheduler.scheduled_monthly_retraining)
    
    # Daily check for automatic trigger (Blueprint 5.5.2.1.c)
    schedule.every().day.at("05:00").do(scheduler.check_and_retrain_if_needed)
    
    logger.info("✅ ML scheduler configured:")
    logger.info("   - Monthly retraining: 1st of month @ 04:00 UTC")
    logger.info("   - Automatic trigger check: Daily @ 05:00 UTC")
    
    return scheduler


def run_ml_scheduler_loop():
    """
    Run the ML scheduler in a loop
    
    Should be run in a separate thread or process
    """
    logger.info("Starting ML scheduler loop...")
    
    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour


def trigger_manual_retraining(model_type: str = "both"):
    """
    Manually trigger model retraining (Blueprint 5.5.2.1.b)
    
    Args:
        model_type: "price", "trend", or "both"
    """
    scheduler = MLScheduler()
    
    if model_type in ["price", "both"]:
        logger.info("Manually triggering price prediction retraining...")
        scheduler.retrain_price_prediction_model(trigger_type="manual")
    
    if model_type in ["trend", "both"]:
        logger.info("Manually triggering trend forecast retraining...")
        scheduler.retrain_trend_forecast_model(trigger_type="manual")


if __name__ == "__main__":
    # For testing: trigger manual retraining
    print("Running ML retraining manually (for testing)")
    print("=" * 60)
    
    trigger_manual_retraining("both")
