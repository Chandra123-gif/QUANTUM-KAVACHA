from typing import Dict, Any, List

class FraudExplanationService:
    """
    FraudDNA & Counterfactual AI Explanation Engine.
    Constructs 5-axis FraudDNA fingerprints and computes exact counterfactual risk reduction paths.
    """
    def generate_fraud_dna(self, txn_data: Dict[str, Any], model_scores: Dict[str, float], risk_score: float) -> Dict[str, Any]:
        """Generate normalized 5-axis FraudDNA Fingerprint."""
        amount = float(txn_data.get("amount", 0.0))
        velocity_1h = int(txn_data.get("velocity_1h", 1))
        device_score = float(txn_data.get("device_score", 0.15))
        location_score = float(txn_data.get("location_score", 0.15))

        amount_axis = min(100.0, (amount / 100000.0) * 100.0)
        velocity_axis = min(100.0, (velocity_1h / 15.0) * 100.0)
        device_axis = min(100.0, device_score * 100.0)
        graph_axis = min(100.0, float(model_scores.get("gnn_prob", 0.2)) * 100.0)
        quantum_axis = min(100.0, float(model_scores.get("quantum_anomaly", 0.2)) * 100.0)

        # Primary risk contributors sorted desc
        axes = [
            {"axis": "Amount Anomaly", "score": round(amount_axis, 1)},
            {"axis": "Velocity Risk", "score": round(velocity_axis, 1)},
            {"axis": "Device Risk", "score": round(device_axis, 1)},
            {"axis": "Graph Risk", "score": round(graph_axis, 1)},
            {"axis": "Quantum Anomaly", "score": round(quantum_axis, 1)}
        ]
        axes.sort(key=lambda x: x["score"], reverse=True)

        return {
            "fraud_dna_fingerprint": axes,
            "primary_driver": axes[0]["axis"],
            "quantum_similarity_level": "HIGH ANOMALY SIMILARITY" if quantum_axis > 60 else ("MODERATE" if quantum_axis > 30 else "LOW ANOMALY")
        }

    def generate_counterfactuals(self, txn_data: Dict[str, Any], current_risk_score: float) -> List[Dict[str, Any]]:
        """Compute counterfactual risk reduction scenarios ('What would make this payment safe?')."""
        amount = float(txn_data.get("amount", 0.0))
        velocity_1h = int(txn_data.get("velocity_1h", 1))
        device_score = float(txn_data.get("device_score", 0.15))

        scenarios = []

        if current_risk_score < 35.0:
            scenarios.append({
                "condition": "Transaction is already within safe historical baseline parameters.",
                "resulting_risk_score": current_risk_score,
                "risk_reduction_pct": 0.0,
                "status": "SAFE"
            })
            return scenarios

        # Scenario 1: Reduced Amount
        if amount > 10000.0:
            reduced_risk = max(12.0, current_risk_score - (amount / 100000.0) * 45.0)
            scenarios.append({
                "condition": "If transaction amount was reduced to ₹8,000 INR",
                "resulting_risk_score": round(reduced_risk, 1),
                "risk_reduction_pct": round(current_risk_score - reduced_risk, 1),
                "status": "APPROVED" if reduced_risk < 40 else "REVIEW"
            })

        # Scenario 2: Verified Device
        if device_score > 0.3:
            reduced_risk = max(15.0, current_risk_score - device_score * 35.0)
            scenarios.append({
                "condition": "If payment was submitted from a trusted registered device",
                "resulting_risk_score": round(reduced_risk, 1),
                "risk_reduction_pct": round(current_risk_score - reduced_risk, 1),
                "status": "APPROVED" if reduced_risk < 40 else "REVIEW"
            })

        # Scenario 3: Baseline Velocity
        if velocity_1h > 3:
            reduced_risk = max(18.0, current_risk_score - (velocity_1h / 15.0) * 30.0)
            scenarios.append({
                "condition": "If transaction velocity returned to baseline (1 txn/hr)",
                "resulting_risk_score": round(reduced_risk, 1),
                "risk_reduction_pct": round(current_risk_score - reduced_risk, 1),
                "status": "APPROVED" if reduced_risk < 40 else "REVIEW"
            })

        # Scenario 4: Step-Up Authentication Completed
        reduced_risk = max(8.0, current_risk_score * 0.25)
        scenarios.append({
            "condition": "If user successfully completes 2FA Step-Up Biometric Authentication",
            "resulting_risk_score": round(reduced_risk, 1),
            "risk_reduction_pct": round(current_risk_score - reduced_risk, 1),
            "status": "APPROVED"
        })

        return scenarios

explanation_service = FraudExplanationService()
