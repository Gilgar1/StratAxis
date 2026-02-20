@echo off
echo Installing ML libraries (scikit-learn, xgboost, statsmodels)...
pip install scikit-learn xgboost statsmodels matplotlib seaborn joblib

echo Running StratAxis ML Engine...
python "ml_engine.py"

echo Done! Check strataxis_data/results/StratAxis_Intelligence_Report.txt
pause
