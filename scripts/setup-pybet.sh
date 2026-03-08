#!/bin/bash

# PyBet Installation and Setup Script for Sports Betting Platform
# This script sets up the Python environment and dependencies for AI-driven betting analysis

set -e

echo "🚀 Starting PyBet setup for Sports Betting Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows Subsystem for Linux (WSL)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Detected Linux environment"
    PACKAGE_MANAGER="apt-get"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Detected macOS environment"
    PACKAGE_MANAGER="brew"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    print_warning "Detected Windows environment - please install Python manually"
    print_warning "Download Python from: https://www.python.org/downloads/"
    exit 1
else
    print_warning "Unknown OS: $OSTYPE"
    print_warning "Please install Python manually"
    exit 1
fi

# Update package manager
print_status "Updating package manager..."
if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
    sudo apt-get update
elif [ "$PACKAGE_MANAGER" = "brew" ]; then
    brew update
fi

# Install Python and pip if not already installed
print_status "Installing Python and pip..."
if [ "$PACKAGE_MANAGER" = "apt-get" ]; then
    sudo apt-get install -y python3 python3-pip python3-venv python3-dev
elif [ "$PACKAGE_MANAGER" = "brew" ]; then
    brew install python3
fi

# Verify Python installation
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed or not in PATH"
    exit 1
fi

if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed or not in PATH"
    exit 1
fi

print_success "Python and pip installed successfully"

# Create project directory structure
print_status "Creating project directory structure..."
mkdir -p pybet-analysis/{models,utils,data,api,config,tests}
mkdir -p logs

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install core PyBet dependencies
print_status "Installing PyBet and core dependencies..."
pip install pybet
pip install pandas numpy scipy
pip install scikit-learn
pip install matplotlib seaborn plotly
pip install jupyter

# Install database and caching dependencies
print_status "Installing database and caching dependencies..."
pip install sqlalchemy psycopg2-binary
pip install redis hiredis
pip install pymongo  # For MongoDB if needed

# Install machine learning frameworks
print_status "Installing machine learning frameworks..."
pip install tensorflow torch torchvision
pip install xgboost lightgbm catboost
pip install statsmodels prophet

# Install advanced AI capabilities
print_status "Installing advanced AI capabilities..."
pip install -U pollinations.ai

# Install web framework and API dependencies
print_status "Installing web framework and API dependencies..."
pip install fastapi uvicorn
pip install flask flask-restful
pip install django djangorestframework

# Install additional utilities
print_status "Installing additional utilities..."
pip install requests aiohttp
pip install python-dotenv
pip install click typer
pip install loguru rich
pip install python-dateutil pytz

# Install data processing and analysis tools
print_status "Installing data processing tools..."
pip install openpyxl xlrd
pip install beautifulsoup4 lxml
pip install schedule apscheduler
pip install celery redis-celery

# Install monitoring and logging
print_status "Installing monitoring and logging tools..."
pip install psutil
pip install memory-profiler
pip install line-profiler
pip install pytest pytest-cov
pip install black flake8 mypy

print_success "All dependencies installed successfully"

# Create requirements.txt
print_status "Creating requirements.txt..."
pip freeze > requirements.txt
print_success "Requirements saved to requirements.txt"

# Create environment configuration
print_status "Creating environment configuration..."
cat > .env.example << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/bookmaker_db
REDIS_URL=redis://localhost:6379/0

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True

# ML Model Configuration
MODEL_PATH=./models/
DATA_PATH=./data/
LOG_PATH=./logs/

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# External APIs
SPORTS_API_KEY=your-api-key-here
ODDS_API_ENDPOINT=https://api.sportsdata.com/v3/sports

# Monitoring
ENABLE_MONITORING=True
LOG_LEVEL=INFO
EOF

cp .env.example .env
print_success "Environment configuration created"

# Create basic PyBet configuration
print_status "Creating PyBet configuration..."
cat > pybet-analysis/config/config.py << 'EOF'
"""
PyBet Configuration Module
Configuration settings for the AI-driven betting analysis system
"""

import os
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class DatabaseConfig:
    """Database configuration"""
    url: str = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/bookmaker_db')
    pool_size: int = 20
    max_overflow: int = 30
    pool_timeout: int = 30
    pool_recycle: int = 3600

@dataclass
class RedisConfig:
    """Redis configuration"""
    url: str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    max_connections: int = 50
    socket_timeout: int = 5
    socket_connect_timeout: int = 5

@dataclass
class MLConfig:
    """Machine Learning configuration"""
    model_path: str = os.getenv('MODEL_PATH', './models/')
    data_path: str = os.getenv('DATA_PATH', './data/')
    log_path: str = os.getenv('LOG_PATH', './logs/')
    cache_ttl: int = 300  # 5 minutes
    batch_size: int = 1000
    epochs: int = 100
    learning_rate: float = 0.001

@dataclass
class APIConfig:
    """API configuration"""
    host: str = os.getenv('API_HOST', '0.0.0.0')
    port: int = int(os.getenv('API_PORT', '8000'))
    debug: bool = os.getenv('API_DEBUG', 'True').lower() == 'true'
    workers: int = 4
    timeout: int = 30

@dataclass
class MonitoringConfig:
    """Monitoring configuration"""
    enabled: bool = os.getenv('ENABLE_MONITORING', 'True').lower() == 'true'
    log_level: str = os.getenv('LOG_LEVEL', 'INFO')
    metrics_interval: int = 60  # seconds
    alert_thresholds: Dict[str, float] = None

    def __post_init__(self):
        if self.alert_thresholds is None:
            self.alert_thresholds = {
                'error_rate': 0.05,
                'response_time': 2.0,
                'memory_usage': 0.8,
                'cpu_usage': 0.8
            }

class Config:
    """Main configuration class"""
    database = DatabaseConfig()
    redis = RedisConfig()
    ml = MLConfig()
    api = APIConfig()
    monitoring = MonitoringConfig()
    
    # Sports and markets configuration
    supported_sports: List[str] = ['football', 'basketball', 'tennis', 'volleyball']
    supported_markets: List[str] = ['1x2', 'over_under', 'asian_handicap', 'double_chance']
    
    # Betting strategy configuration
    kelly_fraction: float = 0.5  # Fraction of Kelly criterion to use
    max_stake_percentage: float = 0.05  # Max 5% of bankroll per bet
    min_odds_threshold: float = 1.2  # Minimum odds to consider
    value_threshold: float = 0.05  # Minimum expected value (5%)

# Global configuration instance
config = Config()
EOF

print_success "PyBet configuration created"

# Create basic model structure
print_status "Creating basic model structure..."
cat > pybet-analysis/models/__init__.py << 'EOF'
"""
PyBet Models Module
Machine learning models for sports betting analysis
"""

from .base_model import BaseModel
from .poisson_model import PoissonModel
from .elo_model import EloModel
from .neural_network import NeuralNetworkModel
from .ensemble_model import EnsembleModel

__all__ = [
    'BaseModel',
    'PoissonModel', 
    'EloModel',
    'NeuralNetworkModel',
    'EnsembleModel'
]
EOF

cat > pybet-analysis/models/base_model.py << 'EOF'
"""
Base Model Class
Abstract base class for all betting models
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

class BaseModel(ABC):
    """Abstract base class for betting models"""
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.is_trained = False
        self.model = None
        
    @abstractmethod
    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Train the model"""
        pass
    
    @abstractmethod
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions"""
        pass
    
    @abstractmethod
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predict probabilities"""
        pass
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """Evaluate model performance"""
        predictions = self.predict(X)
        probabilities = self.predict_proba(X)
        
        # Calculate metrics
        accuracy = np.mean(predictions == y)
        
        return {
            'accuracy': accuracy,
            'predictions': predictions,
            'probabilities': probabilities
        }
    
    def save(self, path: str) -> None:
        """Save model to file"""
        import pickle
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @classmethod
    def load(cls, path: str) -> 'BaseModel':
        """Load model from file"""
        import pickle
        with open(path, 'rb') as f:
            return pickle.load(f)
EOF

print_success "Basic model structure created"

# Create API structure
print_status "Creating API structure..."
cat > pybet-analysis/api/__init__.py << 'EOF'
"""
PyBet API Module
FastAPI endpoints for betting analysis
"""

from .main import app
from .endpoints import router

__all__ = ['app', 'router']
EOF

cat > pybet-analysis/api/main.py << 'EOF'
"""
PyBet API Main Application
FastAPI application for betting analysis endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from .endpoints import router
from ..config import config

app = FastAPI(
    title="PyBet API",
    description="AI-driven sports betting analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*"]
)

# Include routers
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "PyBet API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(
        "pybet-analysis.api.main:app",
        host=config.api.host,
        port=config.api.port,
        reload=config.api.debug,
        workers=config.api.workers
    )
EOF

print_success "API structure created"

# Create utils structure
print_status "Creating utilities structure..."
cat > pybet-analysis/utils/__init__.py << 'EOF'
"""
PyBet Utilities Module
Utility functions for data processing and analysis
"""

from .data_processor import DataProcessor
from .feature_engineering import FeatureEngineer
from .data_validator import DataValidator
from .logger import setup_logger

__all__ = [
    'DataProcessor',
    'FeatureEngineer', 
    'DataValidator',
    'setup_logger'
]
EOF

print_success "Utilities structure created"

# Create README for PyBet
print_status "Creating PyBet README..."
cat > pybet-analysis/README.md << 'EOF'
# PyBet - AI-Driven Sports Betting Analysis

## Overview
PyBet is a Python library for AI-driven sports betting analysis and prediction. It provides machine learning models, statistical analysis, and betting strategy optimization.

## Features
- **Machine Learning Models**: Poisson, Elo, Neural Networks, Ensemble methods
- **Statistical Analysis**: Expected Value, Kelly Criterion, Risk Management
- **Data Processing**: Feature engineering, data validation, preprocessing
- **API Integration**: FastAPI endpoints for real-time analysis
- **Model Management**: Training, evaluation, and deployment

## Installation

```bash
# Run the setup script
./scripts/setup-pybet.sh

# Activate virtual environment
source venv/bin/activate

# Install PyBet
pip install pybet
```

## Usage

### Basic Usage
```python
from pybet.models import PoissonModel
from pybet.utils import DataProcessor

# Load and process data
processor = DataProcessor()
X, y = processor.load_data('matches.csv')

# Train model
model = PoissonModel()
model.train(X, y)

# Make predictions
predictions = model.predict_proba(X_new)
```

### API Usage
```bash
# Start the API server
uvicorn pybet-analysis.api.main:app --host 0.0.0.0 --port 8000

# Make requests
curl http://localhost:8000/api/v1/predictions?match_id=12345
```

## Models

### Poisson Model
Statistical model for predicting football match outcomes based on goal scoring rates.

### Elo Model
Rating-based model that updates team strength ratings based on match results.

### Neural Network Model
Deep learning model for complex pattern recognition in sports data.

### Ensemble Model
Combines multiple models for improved prediction accuracy.

## Configuration

Edit `config/config.py` to customize:
- Database connections
- Model parameters
- API settings
- Monitoring options

## Data Requirements

### Match Data
- Match ID, teams, scores, time
- Historical performance data
- Team statistics and form

### Betting Data
- Odds from different bookmakers
- Market types and specifications
- Betting volumes and patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
EOF

print_success "PyBet README created"

# Create Jupyter notebook for analysis
print_status "Creating Jupyter notebook for analysis..."
cat > pybet-analysis/analysis_example.ipynb << 'EOF'
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# PyBet Analysis Example\n",
    "\n",
    "This notebook demonstrates how to use PyBet for sports betting analysis."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "\n",
    "# Import PyBet modules\n",
    "from pybet.models import PoissonModel, EloModel\n",
    "from pybet.utils import DataProcessor, FeatureEngineer\n",
    "from pybet.config import config\n",
    "\n",
    "# Set up plotting\n",
    "plt.style.use('seaborn')\n",
    "sns.set_palette('husl')\n",
    "\n",
    "print(\"PyBet Analysis Environment Ready!\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load sample data\n",
    "processor = DataProcessor()\n",
    "data = processor.load_sample_data()\n",
    "\n",
    "print(f\"Loaded {len(data)} matches\")\n",
    "print(data.head())"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Feature engineering\n",
    "fe = FeatureEngineer()\n",
    "X, y = fe.create_features(data)\n",
    "\n",
    "print(f\"Features shape: {X.shape}\")\n",
    "print(f\"Target shape: {y.shape}\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Train models\n",
    "poisson_model = PoissonModel()\n",
    "elo_model = EloModel()\n",
    "\n",
    "print(\"Training Poisson Model...\")\n",
    "poisson_model.train(X, y)\n",
    "\n",
    "print(\"Training Elo Model...\")\n",
    "elo_model.train(X, y)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Make predictions\n",
    "poisson_pred = poisson_model.predict_proba(X)\n",
    "elo_pred = elo_model.predict_proba(X)\n",
    "\n",
    "print(\"Predictions made successfully!\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Visualize results\n",
    "fig, axes = plt.subplots(1, 2, figsize=(15, 5))\n",
    "\n",
    "# Poisson predictions\n",
    "axes[0].hist(poisson_pred[:, 0], bins=20, alpha=0.7, label='Home Win')\n",
    "axes[0].hist(poisson_pred[:, 1], bins=20, alpha=0.7, label='Draw')\n",
    "axes[0].hist(poisson_pred[:, 2], bins=20, alpha=0.7, label='Away Win')\n",
    "axes[0].set_title('Poisson Model Predictions')\n",
    "axes[0].legend()\n",
    "\n",
    "# Elo predictions\n",
    "axes[1].hist(elo_pred[:, 0], bins=20, alpha=0.7, label='Home Win')\n",
    "axes[1].hist(elo_pred[:, 1], bins=20, alpha=0.7, label='Draw')\n",
    "axes[1].hist(elo_pred[:, 2], bins=20, alpha=0.7, label='Away Win')\n",
    "axes[1].set_title('Elo Model Predictions')\n",
    "axes[1].legend()\n",
    "\n",
    "plt.tight_layout()\n",
    "plt.show()"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF

print_success "Jupyter notebook created"

# Make script executable
chmod +x scripts/setup-pybet.sh

print_success "PyBet setup completed successfully!"
print_status "Next steps:"
print_status "1. Run: source venv/bin/activate"
print_status "2. Run: cd pybet-analysis && jupyter notebook"
print_status "3. Explore the analysis_example.ipynb"
print_status "4. Start the API: uvicorn pybet-analysis.api.main:app --host 0.0.0.0 --port 8000"