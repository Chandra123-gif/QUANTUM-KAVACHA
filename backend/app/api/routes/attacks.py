from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.attack_service import attack_simulator

router = APIRouter(prefix="/api", tags=["Adversarial Attack Simulator"])

class AttackRequest(BaseModel):
    attack_type: str = "ACCOUNT_TAKEOVER" # ACCOUNT_TAKEOVER, VELOCITY_BURST, DEVICE_HOPPING, TRANSACTION_SPLITTING

@router.post("/attacks/simulate", summary="Execute Red-Team Fraud Attack Simulation")
async def simulate_attack(req: AttackRequest):
    """Generate simulated adversarial fraud attack and measure Q-FraudShield defense."""
    res = attack_simulator.simulate_attack(req.attack_type)
    return res

@router.get("/attacks/scenarios", summary="List Supported Red-Team Attack Scenarios")
async def list_scenarios():
    return [
        {
            "id": "ACCOUNT_TAKEOVER",
            "name": "Account Takeover (ATO)",
            "description": "Credential compromise + new device + IP hop + ₹85,000 transfer."
        },
        {
            "id": "VELOCITY_BURST",
            "name": "Velocity Burst Attack",
            "description": "Rapid 25 micro-transactions in 60 seconds to probe account balance."
        },
        {
            "id": "DEVICE_HOPPING",
            "name": "Device Hopping / Botnet Ring",
            "description": "1 compromised device attempting payments across 15 user accounts."
        },
        {
            "id": "TRANSACTION_SPLITTING",
            "name": "Structured Transaction Splitting",
            "description": "Splitting ₹1,00,000 into 10 smaller payments to bypass single-txn threshold."
        }
    ]
