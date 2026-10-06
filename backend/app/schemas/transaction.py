from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TransactionPayload(BaseModel):
    txn_id: Optional[str] = Field(default="TXN-TEMP", description="Transaction ID")
    user_id: Optional[str] = Field(default="USR-1001", description="User ID")
    account_id: Optional[str] = Field(default="ACC-1001", description="Account ID")
    device_id: Optional[str] = Field(default="DEV-2001", description="Device ID")
    ip: Optional[str] = Field(default="192.168.1.1", description="IP Address")
    merchant_id: Optional[str] = Field(default="MERCH-501", description="Merchant ID")
    lat: Optional[float] = Field(default=19.0760, description="Latitude")
    lon: Optional[float] = Field(default=72.8777, description="Longitude")
    amount: float = Field(..., gt=0.0, description="Amount in currency (e.g. INR)")
    hour: int = Field(default=12, ge=0, le=23, description="Hour of day (0-23)")
    velocity_1h: int = Field(default=1, ge=0, description="Transactions count in last hour")
    account_age_days: int = Field(default=365, ge=0, description="Account age in days")
    device_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Device anomaly score")
    location_score: float = Field(default=0.1, ge=0.0, le=1.0, description="Location anomaly score")
    merchant_risk: float = Field(default=0.1, ge=0.0, le=1.0, description="Merchant risk score")

class StageTiming(BaseModel):
    stage: str
    latency_ms: float

class PredictionResponse(BaseModel):
    txn_id: str
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Combined risk score 0-100")
    risk_level: str = Field(..., description="NORMAL, SUSPICIOUS, or HIGH RISK")
    confidence: float = Field(..., ge=0.0, le=1.0)
    decision: str = Field(..., description="APPROVE, MONITOR, or BLOCK")
    model_scores: Dict[str, float]
    risk_factors: List[str]
    quantum_execution_mode: str = Field(default="SIMULATION", description="SIMULATION, NOISY SIMULATION, or HARDWARE")
    quantum_active: bool
    quantum_escalation: Optional[Dict[str, Any]] = None
    velocity_details: Optional[Dict[str, Any]] = None
    fraud_dna: Optional[Dict[str, Any]] = None
    counterfactuals: Optional[List[Dict[str, Any]]] = None
    timings: List[StageTiming]

