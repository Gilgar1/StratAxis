"""
Service layer for ML model versioning (Blueprint 3.3.2)

Handles:
- Semantic versioning (major.minor.patch)
- Model activation and archival
- Ensuring only one active model per type
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy import desc

from src.models.ml_model import MLModel, ModelStatus, ModelType
from src.utils.logger import logger


class ModelVersioningService:
    """
    Service for managing ML model versions according to Blueprint 3.3.2
    
    Strategy:
    1. Semantic versioning: major.minor.patch
    2. Version increment rules:
       - Major: Breaking API changes or significant algorithm change
       - Minor: New features, improved accuracy
       - Patch: Bug fixes, parameter tuning
    3. Only one active model per type
    4. Archive previous models when activating new one
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_model(
        self,
        name: str,
        version: str,
        model_type: ModelType,
        algorithm: Optional[str] = None,
        metrics: dict = None,
        config: dict = None,
        model_path: Optional[str] = None
    ) -> MLModel:
        """
        Create a new ML model with semantic versioning (Blueprint 3.3.2.1)
        
        Args:
            name: Model name (e.g., 'price_prediction_v2')
            version: Semantic version string (e.g., '2.1.3')
            model_type: Type of model (price_prediction, trend_forecast)
            algorithm: Algorithm used (e.g., 'RandomForest', 'XGBoost')
            metrics: Model performance metrics (MSE, MAE, R2, RMSE)
            config: Model configuration (hyperparameters)
            model_path: Path to saved model file
            
        Returns:
            Created MLModel instance
        """
        # Validate semantic versioning format
        if not self._is_valid_semantic_version(version):
            raise ValueError(
                f"Invalid semantic version '{version}'. "
                "Must be in format 'major.minor.patch' (e.g., '1.2.3')"
            )
        
        new_model = MLModel(
            name=name,
            version=version,
            type=model_type,
            algorithm=algorithm,
            status=ModelStatus.TRAINING,  # Start as training
            metrics=metrics or {},
            config=config or {},
            model_path=model_path,
            trained_at=datetime.utcnow()
        )
        
        self.session.add(new_model)
        self.session.commit()
        self.session.refresh(new_model)
        
        logger.info(
            f"Created model '{name}' v{version} "
            f"(type: {model_type}, status: {ModelStatus.TRAINING})"
        )
        
        return new_model
    
    def activate_model(
        self,
        model_id: UUID,
        archive_previous: bool = True
    ) -> MLModel:
        """
        Activate a model and optionally archive previous active model of same type
        (Blueprint 3.3.2.5, 3.3.2.6)
        
        Only one active model per type is allowed
        
        Args:
            model_id: UUID of model to activate
            archive_previous: Whether to archive currently active model (default True)
            
        Returns:
            Activated MLModel instance
        """
        # Load model to activate
        model = self.session.get(MLModel, model_id)
        
        if not model:
            raise ValueError(f"Model {model_id} not found")
        
        # Archive previous active model of same type (Blueprint 3.3.2.6)
        if archive_previous:
            self._archive_active_models_of_type(model.type)
        
        # Activate new model (Blueprint 3.3.2.5)
        model.status = ModelStatus.ACTIVE
        model.deployed_at = datetime.utcnow()
        
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        
        logger.info(
            f"Activated model {model.name} v{model.version} "
            f"(type: {model.type}, id: {model_id})"
        )
        
        return model
    
    def _archive_active_models_of_type(self, model_type: ModelType) -> List[MLModel]:
        """
        Archive all currently active models of a specific type (Blueprint 3.3.2.6)
        
        Args:
            model_type: Type of models to archive
            
        Returns:
            List of archived MLModel instances
        """
        # Find all active models of this type
        active_models = self.session.exec(
            select(MLModel).where(
                MLModel.type == model_type,
                MLModel.status == ModelStatus.ACTIVE
            )
        ).all()
        
        archived_models = []
        for model in active_models:
            model.status = ModelStatus.ARCHIVED
            self.session.add(model)
            archived_models.append(model)
            
            logger.info(
                f"Archived model {model.name} v{model.version} "
                f"(type: {model_type}, id: {model.id})"
            )
        
        self.session.commit()
        
        return archived_models
    
    def get_active_model(self, model_type: ModelType) -> Optional[MLModel]:
        """
        Get the currently active model of a specific type (Blueprint 3.3.2.5)
        
        Only one active model per type should exist
        
        Args:
            model_type: Type of model to retrieve
            
        Returns:
            Active MLModel instance or None if no active model exists
        """
        active_model = self.session.exec(
            select(MLModel).where(
                MLModel.type == model_type,
                MLModel.status == ModelStatus.ACTIVE
            )
        ).first()
        
        if active_model:
            logger.info(
                f"Retrieved active model: {active_model.name} v{active_model.version} "
                f"(type: {model_type})"
            )
        else:
            logger.warning(f"No active model found for type: {model_type}")
        
        return active_model
    
    def get_model_history(
        self,
        model_type: ModelType,
        limit: Optional[int] = None
    ) -> List[MLModel]:
        """
        Get version history of models for a specific type
        
        Returns all models (active + archived) ordered by version
        
        Args:
            model_type: Type of models to retrieve
            limit: Maximum number of models to return
            
        Returns:
            List of MLModel instances ordered by trained_at DESC
        """
        query = select(MLModel).where(
            MLModel.type == model_type
        ).order_by(desc(MLModel.trained_at))
        
        if limit:
            query = query.limit(limit)
        
        models = self.session.exec(query).all()
        
        logger.info(
            f"Retrieved {len(models)} model versions for type: {model_type}"
        )
        
        return models
    
    def increment_version(
        self,
        current_version: str,
        increment_type: str
    ) -> str:
        """
        Increment semantic version based on change type (Blueprint 3.3.2.2-4)
        
        Args:
            current_version: Current version string (e.g., '1.2.3')
            increment_type: Type of increment ('major', 'minor', 'patch')
            
        Returns:
            New version string
            
        Raises:
            ValueError: If increment_type is invalid or version format is wrong
        """
        if not self._is_valid_semantic_version(current_version):
            raise ValueError(f"Invalid semantic version: {current_version}")
        
        major, minor, patch = map(int, current_version.split('.'))
        
        if increment_type == 'major':
            # Blueprint 3.3.2.2: Breaking changes or significant algorithm change
            major += 1
            minor = 0
            patch = 0
        elif increment_type == 'minor':
            # Blueprint 3.3.2.3: New features, improved accuracy
            minor += 1
            patch = 0
        elif increment_type == 'patch':
            # Blueprint 3.3.2.4: Bug fixes, parameter tuning
            patch += 1
        else:
            raise ValueError(
                f"Invalid increment_type: {increment_type}. "
                "Must be 'major', 'minor', or 'patch'"
            )
        
        new_version = f"{major}.{minor}.{patch}"
        
        logger.info(
            f"Incremented version from {current_version} to {new_version} "
            f"(type: {increment_type})"
        )
        
        return new_version
    
    def compare_model_performance(
        self,
        model_id_1: UUID,
        model_id_2: UUID
    ) -> dict:
        """
        Compare performance metrics of two models
        
        Args:
            model_id_1: UUID of first model
            model_id_2: UUID of second model
            
        Returns:
            Dictionary with comparison data
        """
        model1 = self.session.get(MLModel, model_id_1)
        model2 = self.session.get(MLModel, model_id_2)
        
        if not model1 or not model2:
            raise ValueError("One or both models not found")
        
        comparison = {
            "model_1": {
                "name": model1.name,
                "version": model1.version,
                "metrics": model1.metrics,
                "status": model1.status
            },
            "model_2": {
                "name": model2.name,
                "version": model2.version,
                "metrics": model2.metrics,
                "status": model2.status
            },
            "improvements": {}
        }
        
        # Calculate improvements (if both have same metrics)
        for metric_name in model1.metrics.keys():
            if metric_name in model2.metrics:
                v1 = model1.metrics[metric_name]
                v2 = model2.metrics[metric_name]
                
                # For error metrics (MSE, MAE, RMSE), lower is better
                # For accuracy metrics (R2), higher is better
                if metric_name.lower() in ['mse', 'mae', 'rmse']:
                    improvement = ((v1 - v2) / v1 * 100) if v1 > 0 else 0
                else:
                    improvement = ((v2 - v1) / v1 * 100) if v1 > 0 else 0
                
                comparison["improvements"][metric_name] = {
                    "value": round(improvement, 2),
                    "direction": "better" if improvement > 0 else "worse"
                }
        
        return comparison
    
    @staticmethod
    def _is_valid_semantic_version(version: str) -> bool:
        """
        Validate semantic version format (Blueprint 3.3.2.1)
        
        Args:
            version: Version string to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            parts = version.split('.')
            if len(parts) != 3:
                return False
            
            # All parts must be non-negative integers
            major, minor, patch = map(int, parts)
            return major >= 0 and minor >= 0 and patch >= 0
        except (ValueError, AttributeError):
            return False
    
    def get_latest_version_for_type(self, model_type: ModelType) -> Optional[str]:
        """
        Get the latest version number for a model type
        
        Useful for suggesting next version number
        
        Args:
            model_type: Type of model
            
        Returns:
            Latest version string or None if no models exist
        """
        latest_model = self.session.exec(
            select(MLModel)
            .where(MLModel.type == model_type)
            .order_by(desc(MLModel.trained_at))
        ).first()
        
        return latest_model.version if latest_model else None
