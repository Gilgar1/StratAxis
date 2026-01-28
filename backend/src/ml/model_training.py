"""
Model Training (Blueprint 5.2 & 5.3)

Handles:
- Model selection and comparison
- Hyperparameter tuning
- Model training for price prediction and trend forecasting
- Model metadata storage
"""

import json
import joblib
from pathlib import Path
from typing import Dict, List, Tuple, Any
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
from sqlmodel import Session

from src.models.ml_model import MLModel, ModelType, ModelStatus
from src.services.model_versioning import ModelVersioningService
from src.utils.logger import logger


class ModelTrainer:
    """
    ML Model Trainer (Blueprint 5.2 & 5.3)
    
    Implements:
    - Model selection (5.2)
    - Price prediction training (5.3.1)
    - Trend forecasting training (5.3.2)
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.model_versioning = ModelVersioningService(session)
        self.models_dir = Path("backend/models")
        self.models_dir.mkdir(parents=True, exist_ok=True)
    
    def train_price_prediction_model(
        self,
        df: pd.DataFrame,
        feature_columns: List[str],
        target_column: str = 'price_per_m2',
        test_size: float = 0.15,
        val_size: float = 0.15
    ) -> Dict[str, Any]:
        """
        Train price prediction model (Blueprint 5.3.1)
        
        Steps:
        1. Split data (70/15/15)
        2. Train candidate models
        3. Select best model
        4. Hyperparameter tuning
        5. Final training
        6. Save model and metadata
        
        Args:
            df: DataFrame with features and target
            feature_columns: List of feature column names
            target_column: Target variable name
            test_size: Test set proportion
            val_size: Validation set proportion
            
        Returns:
            Dictionary with training results
        """
        logger.info("="*70)
        logger.info("MODEL TRAINING: Price Prediction")
        logger.info("="*70)
        
        # 1. Split data (Blueprint 5.3.1.2, 5.2.3.1)
        X = df[feature_columns]
        y = df[target_column]
        
        # First split: separate test set
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Second split: separate train and validation
        val_proportion = val_size / (1 - test_size)
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_proportion, random_state=42
        )
        
        logger.info(f"Data split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
        
        # 2. Train candidate models and select best (Blueprint 5.2.1, 5.2.3)
        best_model_info = self._train_and_select_best_model(
            X_train, y_train, X_val, y_val
        )
        
        # 3. Hyperparameter tuning on best model (Blueprint 5.3.1.3)
        logger.info(f"\nPerforming hyperparameter tuning on {best_model_info['name']}...")
        tuned_model = self._tune_hyperparameters(
            best_model_info['name'],
            X_train, y_train, X_val, y_val
        )
        
        # 4. Final training on train + validation (Blueprint 5.3.1.6)
        logger.info("\nFinal training on combined train + validation set...")
        X_train_full = pd.concat([X_train, X_val])
        y_train_full = pd.concat([y_train, y_val])
        
        tuned_model.fit(X_train_full, y_train_full)
        
        # 5. Evaluate on test set
        test_metrics = self._evaluate_model(tuned_model, X_test, y_test)
        
        logger.info("\nTest Set Evaluation:")
        logger.info(f"  RMSE: {test_metrics['rmse']:.2f}")
        logger.info(f"  MAE: {test_metrics['mae']:.2f}")
        logger.info(f"  R²: {test_metrics['r2']:.4f}")
        logger.info(f"  Within 20%: {test_metrics['within_20_pct']:.1f}%")
        
        # 6. Save model artifact (Blueprint 5.3.1.7)
        model_path = self._save_model_artifact(tuned_model, "price_prediction")
        
        # 7. Calculate feature importance (Blueprint 5.3.1.8)
        feature_importance = self._get_feature_importance(tuned_model, feature_columns)
        
        # 8. Store model metadata (Blueprint 5.3.1.9)
        model_metadata = self._create_model_metadata(
            model_name=f"price_prediction_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            model_type=ModelType.PRICE_PREDICTION,
            algorithm=best_model_info['name'],
            hyperparameters=tuned_model.get_params(),
            features=feature_columns,
            training_records=len(X_train_full),
            metrics=test_metrics,
            model_path=str(model_path),
            feature_importance=feature_importance
        )
        
        logger.info("\n" + "="*70)
        logger.info("PRICE PREDICTION MODEL TRAINING COMPLETE")
        logger.info("="*70 + "\n")
        
        return {
            "model": tuned_model,
            "model_path": model_path,
            "metrics": test_metrics,
            "feature_importance": feature_importance,
            "metadata": model_metadata
        }
    
    def _train_and_select_best_model(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: pd.DataFrame,
        y_val: pd.Series
    ) -> Dict[str, Any]:
        """
        Train candidate models and select best (Blueprint 5.2.1, 5.2.3)
        
        Candidates:
        1. Random Forest (baseline)
        2. XGBoost
        3. Ridge Regression
        4. Lasso Regression
        5. Decision Tree
        """
        logger.info("\nTraining candidate models...")
        
        # Define candidate models (Blueprint 5.2.1)
        candidates = {
            'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
            'XGBoost': xgb.XGBRegressor(n_estimators=100, random_state=42, n_jobs=-1),
            'Ridge': Ridge(alpha=1.0),
            'Lasso': Lasso(alpha=1.0),
            'DecisionTree': DecisionTreeRegressor(random_state=42)
        }
        
        results = []
        
        for name, model in candidates.items():
            logger.info(f"\nTraining {name}...")
            
            # Train
            model.fit(X_train, y_train)
            
            # Evaluate on validation set (Blueprint 5.2.3.3)
            metrics = self._evaluate_model(model, X_val, y_val)
            
            results.append({
                'name': name,
                'model': model,
                'rmse': metrics['rmse'],
                'mae': metrics['mae'],
                'r2': metrics['r2'],
                'within_20_pct': metrics['within_20_pct']
            })
            
            logger.info(f"  RMSE: {metrics['rmse']:.2f}, MAE: {metrics['mae']:.2f}, R²: {metrics['r2']:.4f}")
        
        # Select best model based on R² (Blueprint 5.2.3.4)
        best_model = max(results, key=lambda x: x['r2'])
        
        logger.info(f"\nBest model: {best_model['name']} (R²={best_model['r2']:.4f})")
        
        return best_model
    
    def _tune_hyperparameters(
        self,
        model_name: str,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: pd.DataFrame,
        y_val: pd.Series
    ):
        """
        Hyperparameter tuning (Blueprint 5.3.1.3)
        
        Uses RandomizedSearchCV for efficiency
        """
        # Define hyperparameter grids (Blueprint 5.3.1.3)
        param_grids = {
            'RandomForest': {
                'n_estimators': [50, 100, 200, 300, 500],
                'max_depth': [5, 10, 15, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            },
            'XGBoost': {
                'n_estimators': [50, 100, 200, 300, 500],
                'max_depth': [3, 5, 7, 10],
                'learning_rate': [0.01, 0.05, 0.1, 0.2, 0.3],
                'subsample': [0.6, 0.8, 1.0]
            }
        }
        
        if model_name not in param_grids:
            # No tuning for linear models
            if model_name == 'Ridge':
                return Ridge(alpha=1.0)
            elif model_name == 'Lasso':
                return Lasso(alpha=1.0)
            else:
                return DecisionTreeRegressor(random_state=42)
        
        # Create base model
        if model_name == 'RandomForest':
            base_model = RandomForestRegressor(random_state=42, n_jobs=-1)
        elif model_name == 'XGBoost':
            base_model = xgb.XGBRegressor(random_state=42, n_jobs=-1)
        else:
            return None
        
        # Randomized search for efficiency
        search = RandomizedSearchCV(
            base_model,
            param_grids[model_name],
            n_iter=20,
            cv=3,
            scoring='r2',
            random_state=42,
            n_jobs=-1,
            verbose=1
        )
        
        search.fit(X_train, y_train)
        
        logger.info(f"Best parameters: {search.best_params_}")
        logger.info(f"Best cross-validation R²: {search.best_score_:.4f}")
        
        return search.best_estimator_
    
    def _evaluate_model(
        self,
        model,
        X: pd.DataFrame,
        y: pd.Series
    ) -> Dict[str, float]:
        """
        Evaluate model performance (Blueprint 5.2.1.5, 5.4.1)
        
        Metrics:
        - RMSE (root mean squared error)
        - MAE (mean absolute error)
        - R² (coefficient of determination)
        - Percentage within 20% of actual price
        """
        y_pred = model.predict(X)
        
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        mae = mean_absolute_error(y, y_pred)
        r2 = r2_score(y, y_pred)
        
        # Business metric: percentage within 20% (Blueprint 5.2.1.5.c)
        within_20_pct = np.mean(np.abs((y - y_pred) / y) <= 0.20) * 100
        
        return {
            'rmse': rmse,
            'mae': mae,
            'r2': r2,
            'mse': mean_squared_error(y, y_pred),
            'within_20_pct': within_20_pct
        }
    
    def _save_model_artifact(self, model, model_name: str) -> Path:
        """Save model artifact using joblib (Blueprint 5.3.1.7)"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{model_name}_{timestamp}.joblib"
        filepath = self.models_dir / filename
        
        joblib.dump(model, filepath)
        
        logger.info(f"Model saved to: {filepath}")
        
        return filepath
    
    def _get_feature_importance(
        self,
        model,
        feature_columns: List[str]
    ) -> Dict[str, float]:
        """
        Get feature importance (Blueprint 5.3.1.8)
        
        Returns dict of {feature_name: importance_score}
        """
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            feature_importance = dict(zip(feature_columns, importance.tolist()))
            
            # Sort by importance
            sorted_importance = dict(
                sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
            )
            
            logger.info("\nTop 10 Important Features:")
            for i, (feature, importance) in enumerate(list(sorted_importance.items())[:10], 1):
                logger.info(f"  {i}. {feature}: {importance:.4f}")
            
            return sorted_importance
        else:
            return {}
    
    def _create_model_metadata(
        self,
        model_name: str,
        model_type: ModelType,
        algorithm: str,
        hyperparameters: Dict,
        features: List[str],
        training_records: int,
        metrics: Dict[str, float],
        model_path: str,
        feature_importance: Dict[str, float]
    ) -> MLModel:
        """
        Create and store model metadata (Blueprint 5.3.1.9)
        
        Stores in MLModels table with:
        - Algorithm name
        - Hyperparameters
        - Feature list
        - Training metrics
        - Model path
        """
        # Determine version (increment from latest)
        latest_version = self.model_versioning.get_latest_version_for_type(model_type)
        
        if latest_version:
            # Increment patch version
            new_version = self.model_versioning.increment_version(latest_version, "patch")
        else:
            new_version = "1.0.0"
        
        # Create model record
        model_record = self.model_versioning.create_model(
            name=model_name,
            version=new_version,
            model_type=model_type,
            algorithm=algorithm,
            hyperparameters=hyperparameters,
            features=features,
            training_records=training_records,
            metrics=metrics,
            model_path=model_path,
            feature_importance=feature_importance
        )
        
        logger.info(f"\nModel metadata stored: {model_name} v{new_version}")
        
        return model_record
    
    def deploy_model(self, model_id: str) -> Dict[str, Any]:
        """
        Deploy model to production (Blueprint 5.5.1)
        
        Steps:
        1. Validate model meets thresholds
        2. Archive current active model
        3. Activate new model
        
        Args:
            model_id: UUID of model to deploy
            
        Returns:
            Deployment result
        """
        logger.info("="*70)
        logger.info("MODEL DEPLOYMENT")
        logger.info("="*70)
        
        from uuid import UUID
        
        # Get model
        model = self.session.get(MLModel, UUID(model_id))
        
        if not model:
            raise ValueError(f"Model {model_id} not found")
        
        # 1. Validate thresholds (Blueprint 5.5.1.1)
        metrics = model.metrics or {}
        
        if model.model_type == ModelType.PRICE_PREDICTION:
            # Price prediction thresholds (Blueprint 5.5.1.1.a)
            r2_threshold = 0.6
            # RMSE threshold: < 20% of mean price (approximate with MAE for now)
            
            if metrics.get('r2', 0) < r2_threshold:
                logger.warning(f"Model R² ({metrics.get('r2', 0):.4f}) below threshold ({r2_threshold})")
                return {
                    "status": "rejected",
                    "reason": f"R² below threshold: {metrics.get('r2', 0):.4f} < {r2_threshold}"
                }
        
        # 2. Activate model (archives previous) (Blueprint 5.5.1.2)
        activated_model = self.model_versioning.activate_model(
            UUID(model_id),
            archive_previous=True
        )
        
        logger.info(f"Model {model.name} v{model.version} deployed successfully")
        logger.info(f"  Algorithm: {model.algorithm}")
        logger.info(f"  R²: {metrics.get('r2', 0):.4f}")
        logger.info(f"  RMSE: {metrics.get('rmse', 0):.2f}")
        
        return {
            "status": "success",
            "model_id": str(model.id),
            "model_name": model.name,
            "version": model.version,
            "metrics": metrics
        }
    
    def load_active_model(self, model_type: ModelType):
        """
        Load active deployed model (Blueprint 5.5.1.3)
        
        Returns loaded model artifact ready for predictions
        """
        # Get active model
        active_model = self.model_versioning.get_active_model(model_type)
        
        if not active_model:
            raise ValueError(f"No active model for type {model_type}")
        
        # Load model artifact
        model_path = Path(active_model.model_path)
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model artifact not found: {model_path}")
        
        model = joblib.load(model_path)
        
        logger.info(f"Loaded active model: {active_model.name} v{active_model.version}")
        
        return model, active_model
