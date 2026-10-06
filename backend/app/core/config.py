import os
from pydantic import BaseModel, Field

class Settings(BaseModel):
    PROJECT_NAME: str = "Q-FraudShield"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000", "*"]
    
    # Quantum Hardware & Token
    IBM_QUANTUM_TOKEN: str = Field(default_factory=lambda: os.getenv("IBM_QUANTUM_TOKEN", ""))
    QUANTUM_MODE_DEFAULT: str = "SIMULATION" # SIMULATION, NOISY SIMULATION, or HARDWARE
    
    # Storage
    DATA_DIR: str = Field(default_factory=lambda: os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data")))
    ARTIFACTS_DIR: str = Field(default_factory=lambda: os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../model_artifacts")))

settings = Settings()
