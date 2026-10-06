import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from scripts.generate_demo_data import main as generate_data
from models.classical.train_classical import train_and_eval_classical_models
from models.deep_learning.train_deep import train_and_eval_deep_models
from models.graph.train_gnn import train_and_eval_gnn_model
from models.quantum.train_quantum import train_and_eval_quantum_pipeline
from models.ensemble.train_ensemble import train_and_eval_ensemble

def main():
    print("=== [1/6] Generating Demo Data ===")
    generate_data()

    print("\n=== [2/6] Training Classical Models ===")
    train_and_eval_classical_models()

    print("\n=== [3/6] Training Deep Learning Models ===")
    train_and_eval_deep_models()

    print("\n=== [4/6] Training Graph Neural Network (GNN) ===")
    train_and_eval_gnn_model()

    print("\n=== [5/6] Training Quantum Kernel Pipeline ===")
    train_and_eval_quantum_pipeline()

    print("\n=== [6/6] Training Hybrid Stacking Ensemble & Ablation ===")
    train_and_eval_ensemble()

    print("\n[SUCCESS] All models trained successfully. All metrics saved to model_artifacts/")

if __name__ == "__main__":
    main()
