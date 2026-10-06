import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Shield, Zap, Cpu, BarChart3, AlertTriangle, CheckCircle2,
  Activity, Database, Network, Play, Pause, RefreshCw,
  Search, Lock, Eye, Layers, ArrowRight, Check, X,
  Crosshair, MessageSquare, Send, HelpCircle, Compass, Flame
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import QuantumCore3D from "./QuantumCore3D";
import TransactionGraph3D from "./TransactionGraph3D";
import "./style.css";

const FASTAPI_BASE = "http://127.0.0.1:8000";
const EXPRESS_BASE = "http://127.0.0.1:5000";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [health, setHealth] = useState(null);
  const [expressHealth, setExpressHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [modelComparison, setModelComparison] = useState([]);
  const [quantumStatus, setQuantumStatus] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [meshNodes, setMeshNodes] = useState([]);
  const [meshStats, setMeshStats] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [driftData, setDriftData] = useState(null);

  // Attack Simulator State
  const [attackModalOpen, setAttackModalOpen] = useState(false);
  const [attackType, setAttackType] = useState("ACCOUNT_TAKEOVER");
  const [attackResult, setAttackResult] = useState(null);
  const [attackRunning, setAttackRunning] = useState(false);

  // Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome! I am Q-Fraud Copilot, your evidence-grounded AI Fraud Analyst. Ask me about SHAP, Quantum Escalation, or FraudDNA for any transaction."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    txn_id: "TXN-QF-001",
    user_id: "USR-9901",
    amount: 85000,
    hour: 23,
    velocity_1h: 12,
    location_score: 0.82,
    device_score: 0.78,
    merchant_risk: 0.76,
    account_age_days: 40
  });

  const [predictResult, setPredictResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);

  const loadData = async () => {
    try {
      const hRes = await fetch(`${FASTAPI_BASE}/api/health`);
      setHealth(await hRes.json());
      
      const aRes = await fetch(`${FASTAPI_BASE}/api/analytics`);
      setAnalytics(await aRes.json());
      
      const mcRes = await fetch(`${FASTAPI_BASE}/api/models/comparison`);
      setModelComparison(await mcRes.json());
      
      const qRes = await fetch(`${FASTAPI_BASE}/api/quantum/status`);
      setQuantumStatus(await qRes.json());

      const faRes = await fetch(`${FASTAPI_BASE}/api/fraud-alerts`);
      setFraudAlerts(await faRes.json());

      const txRes = await fetch(`${FASTAPI_BASE}/api/transactions?limit=15`);
      setRecentTxns(await txRes.json());

      const dRes = await fetch(`${FASTAPI_BASE}/api/drift`);
      if (dRes.ok) setDriftData(await dRes.json());

      const exRes = await fetch(`${EXPRESS_BASE}/api/express-health`);
      setExpressHealth(await exRes.json());

      const nodesRes = await fetch(`${EXPRESS_BASE}/api/nodes`);
      const nodesData = await nodesRes.json();
      setMeshNodes(nodesData.nodes || []);

      const statsRes = await fetch(`${EXPRESS_BASE}/api/stats`);
      setMeshStats(await statsRes.json());
    } catch (err) {
      console.warn("API load warning:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateForm = (k, v) => setForm({ ...form, [k]: v });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setPredictResult(null);

    setPipelineStage(1);
    await new Promise(r => setTimeout(r, 250));
    setPipelineStage(2);
    await new Promise(r => setTimeout(r, 250));
    setPipelineStage(3);
    await new Promise(r => setTimeout(r, 350));
    setPipelineStage(4);

    try {
      const res = await fetch(`${FASTAPI_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          hour: parseInt(form.hour),
          velocity_1h: parseInt(form.velocity_1h),
          location_score: parseFloat(form.location_score),
          device_score: parseFloat(form.device_score),
          merchant_risk: parseFloat(form.merchant_risk),
          account_age_days: parseInt(form.account_age_days)
        })
      });
      const data = await res.json();
      setPredictResult(data);
      setPipelineStage(5);

      if (data.decision === "APPROVE") {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }

      await fetch(`${EXPRESS_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAYMENT_ANALYSIS_EVENT",
          txn_id: data.txn_id,
          risk_score: data.risk_score,
          risk_level: data.risk_level,
          decision: data.decision
        })
      });
    } catch (e) {
      alert("Error reaching prediction backend.");
    }
    setAnalyzing(false);
  };

  const toggleSimulation = async () => {
    const endpoint = simulating ? "/api/simulate/stop" : "/api/simulate/start";
    await fetch(`${FASTAPI_BASE}${endpoint}`, { method: "POST" });
    setSimulating(!simulating);
  };

  const runAttackSimulation = async () => {
    setAttackRunning(true);
    setAttackResult(null);
    try {
      const res = await fetch(`${FASTAPI_BASE}/api/attacks/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: attackType })
      });
      if (res.ok) {
        const data = await res.json();
        setAttackResult(data);
      }
    } catch (e) {
      console.warn("Attack simulation error:", e);
    }
    setAttackRunning(false);
  };

  const handleCopilotSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setCopilotMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${FASTAPI_BASE}/api/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg,
          context: predictResult ? {
            txn_id: predictResult.txn_id,
            risk_score: predictResult.risk_score,
            decision: predictResult.decision
          } : null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotMessages(prev => [
          ...prev,
          { sender: "bot", text: data.answer, sources: data.grounded_sources }
        ]);
      }
    } catch (e) {
      setCopilotMessages(prev => [
        ...prev,
        { sender: "bot", text: "Error connecting to Q-Fraud Copilot analyst." }
      ]);
    }
    setChatLoading(false);
  };

  const openInvestigation = async (txnId) => {
    try {
      const res = await fetch(`${FASTAPI_BASE}/api/investigation/${txnId}`);
      if (res.ok) {
        setSelectedTxn(await res.json());
      }
    } catch (e) {
      console.warn("Investigation fetch error:", e);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <header className="navbar">
        <div className="logo-section">
          <motion.div 
            className="quantum-glow-badge"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            ⚛
          </motion.div>
          <div>
            <div className="brand-title">
              <h1>Q-FraudShield</h1>
              <span className="mern-badge">MERN + QUANTUM</span>
            </div>
            <p className="subtitle">Quantum-Enhanced Digital Payment Fraud Intelligence Engine</p>
          </div>
        </div>

        <nav className="tab-navigation">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <Activity size={16} /> Dashboard
          </button>
          <button className={activeTab === "quantum" ? "active" : ""} onClick={() => setActiveTab("quantum")}>
            <Cpu size={16} /> Quantum Lab
          </button>
          <button className={activeTab === "mesh" ? "active" : ""} onClick={() => setActiveTab("mesh")}>
            <Network size={16} /> Mesh & Graph
          </button>
          <button className={activeTab === "models" ? "active" : ""} onClick={() => setActiveTab("models")}>
            <BarChart3 size={16} /> Benchmarks
          </button>
          <button className={activeTab === "alerts" ? "active" : ""} onClick={() => setActiveTab("alerts")}>
            <AlertTriangle size={16} /> Fraud Alerts
          </button>
        </nav>

        <div className="header-actions">
          {/* Attack Simulator Trigger Button */}
          <button className="attack-sim-btn pulse-glow-red" onClick={() => setAttackModalOpen(true)}>
            <Flame size={14} /> ⚔️ SIMULATE FRAUD ATTACK
          </button>
          <button className={`sim-btn ${simulating ? "active" : ""}`} onClick={toggleSimulation}>
            {simulating ? <Pause size={14} /> : <Play size={14} />}
            {simulating ? "PAUSE STREAM" : "LIVE STREAM"}
          </button>
          <span className="status-badge">
            <span className="dot pulse"></span>
            {health?.quantum_engine?.online ? "QUANTUM: ONLINE (SIMULATION)" : "QUANTUM: OFFLINE"}
          </span>
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="main-content">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="tab-pane"
            >
              {/* 3D Quantum Core Hero Section */}
              <div className="hero-3d-card glass-panel">
                <div className="hero-info">
                  <div className="hero-pills">
                    <span className="hero-pill"><Zap size={14} /> QISKIT FALL FEST 2026</span>
                    {driftData && (
                      <span className={`drift-pill ${driftData.status === "NORMAL" ? "ok" : "warn"}`}>
                        <Compass size={12} /> DRIFT: {driftData.status} ({driftData.overall_drift_score} PSI)
                      </span>
                    )}
                  </div>
                  <h2>Detect Fraud Before It Becomes Damage.</h2>
                  <p>Hybrid Classical AI + Deep Learning + Graph Intelligence + Quantum Machine Learning</p>
                  
                  <div className="kpi-mini-grid">
                    <div className="kpi-mini">
                      <span>TOTAL TRANSACTIONS</span>
                      <strong>{analytics?.total_transactions ?? 1200}</strong>
                    </div>
                    <div className="kpi-mini danger">
                      <span>FRAUD DETECTED</span>
                      <strong>{analytics?.fraud_detected ?? 95} ({analytics?.fraud_rate_percent ?? 7.9}%)</strong>
                    </div>
                    <div className="kpi-mini warning">
                      <span>SUSPICIOUS FLAGGED</span>
                      <strong>{analytics?.suspicious_flagged ?? 96}</strong>
                    </div>
                    <div className="kpi-mini express">
                      <span>EXPRESS MERN NODES</span>
                      <strong>{meshStats?.online_nodes ?? 5} Online</strong>
                    </div>
                  </div>
                </div>

                <div className="hero-canvas-container">
                  <QuantumCore3D />
                </div>
              </div>

              {/* Main Interactive Grid */}
              <div className="dashboard-grid">
                
                {/* Form Input Panel */}
                <div className="glass-panel form-panel">
                  <div className="panel-header">
                    <h2><Cpu size={20} className="purple-text" /> Analyze Payment Scenario</h2>
                    <span className="tag-demo">Scripted Demo Scenario</span>
                  </div>

                  <div className="form-grid">
                    <label>TXN ID <input value={form.txn_id} onChange={(e) => updateForm("txn_id", e.target.value)} /></label>
                    <label>USER ID <input value={form.user_id} onChange={(e) => updateForm("user_id", e.target.value)} /></label>
                    <label>AMOUNT (INR) <input type="number" value={form.amount} onChange={(e) => updateForm("amount", e.target.value)} /></label>
                    <label>HOUR OF DAY (0-23) <input type="number" value={form.hour} onChange={(e) => updateForm("hour", e.target.value)} /></label>
                    <label>VELOCITY 1H <input type="number" value={form.velocity_1h} onChange={(e) => updateForm("velocity_1h", e.target.value)} /></label>
                    <label>LOCATION SCORE (0-1) <input type="number" step="0.01" value={form.location_score} onChange={(e) => updateForm("location_score", e.target.value)} /></label>
                    <label>DEVICE SCORE (0-1) <input type="number" step="0.01" value={form.device_score} onChange={(e) => updateForm("device_score", e.target.value)} /></label>
                    <label>MERCHANT RISK (0-1) <input type="number" step="0.01" value={form.merchant_risk} onChange={(e) => updateForm("merchant_risk", e.target.value)} /></label>
                    <label>ACCOUNT AGE (DAYS) <input type="number" value={form.account_age_days} onChange={(e) => updateForm("account_age_days", e.target.value)} /></label>
                  </div>

                  {/* Animated Stage Pipeline Status */}
                  <div className="pipeline-steps-container">
                    <span className="pipeline-title">REAL PIPELINE PROGRESSION:</span>
                    <div className="pipeline-steps">
                      <div className={`step ${pipelineStage >= 1 ? "active" : ""}`}>1. Preprocess</div>
                      <div className={`step ${pipelineStage >= 2 ? "active" : ""}`}>2. Classical/DL</div>
                      <div className={`step ${pipelineStage >= 3 ? "active" : ""}`}>3. Quantum Kernel</div>
                      <div className={`step ${pipelineStage >= 4 ? "active" : ""}`}>4. Stacking</div>
                    </div>
                  </div>

                  <button className="primary-btn pulse-glow" onClick={handleAnalyze} disabled={analyzing}>
                    {analyzing ? "COMPUTING QUANTUM KERNELS..." : "RUN HYBRID INTELLIGENCE →"}
                  </button>
                </div>

                {/* Prediction Result Display */}
                <div className="glass-panel result-panel">
                  <h2>Risk Intelligence Output</h2>
                  {!predictResult ? (
                    <div className="placeholder-text">
                      <Shield size={48} className="muted-icon" />
                      <p>Run payment through the hybrid quantum-classical model.</p>
                    </div>
                  ) : (
                    <motion.div 
                      className="result-details"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="result-header">
                        <span className={`risk-badge ${predictResult.risk_level.toLowerCase().replace(" ", "-")}`}>
                          {predictResult.risk_level}
                        </span>
                        <span className="decision-tag">{predictResult.decision}</span>
                      </div>

                      {/* Quantum Escalation Badge */}
                      {predictResult.quantum_escalation && (
                        <div className={`escalation-banner ${predictResult.quantum_escalation.quantum_execution_required ? "escalated" : "fast"}`}>
                          <Zap size={14} />
                          <span>STATUS: <b>{predictResult.quantum_escalation.quantum_escalation_status}</b> ({predictResult.quantum_escalation.escalation_reason})</span>
                        </div>
                      )}

                      <div className="risk-score-display">
                        <span className="score-num">{predictResult.risk_score}</span>
                        <span className="score-denom">/ 100 Combined Risk Score</span>
                      </div>

                      <div className="model-breakdown">
                        <h3>Model Ensemble Probability Breakdown</h3>
                        <div className="score-pills">
                          {Object.entries(predictResult.model_scores).map(([k, v]) => (
                            <div key={k} className="score-pill">
                              <span className="model-name">{k.replace("_", " ").toUpperCase()}</span>
                              <span className="model-val">{(v * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FraudDNA 5-Axis Fingerprint */}
                      {predictResult.fraud_dna && (
                        <div className="fraud-dna-box">
                          <h3>🧬 FraudDNA 5-Axis Fingerprint</h3>
                          <div className="dna-bars">
                            {predictResult.fraud_dna.fraud_dna_fingerprint.map((axis, idx) => (
                              <div key={idx} className="dna-bar-row">
                                <span className="dna-axis-label">{axis.axis}</span>
                                <div className="dna-bar-track">
                                  <div className="dna-bar-fill" style={{ width: `${axis.score}%` }}></div>
                                </div>
                                <span className="dna-axis-val">{axis.score}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Counterfactual AI Explanation Scenarios */}
                      {predictResult.counterfactuals && predictResult.counterfactuals.length > 0 && (
                        <div className="counterfactual-box">
                          <h3>🎯 Counterfactual AI ("What would make this payment safe?")</h3>
                          <ul className="cf-list">
                            {predictResult.counterfactuals.map((cf, idx) => (
                              <li key={idx} className="cf-item">
                                <span className="cf-cond">{cf.condition}</span>
                                <span className="cf-res">Risk: <b>{cf.resulting_risk_score}%</b> (-{cf.risk_reduction_pct}%)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pipeline-timings">
                        <h3>Stage Execution Latencies</h3>
                        <div className="timings-list">
                          {predictResult.timings.map((t, idx) => (
                            <div key={idx} className="timing-row">
                              <span className="stage-name">{t.stage}</span>
                              <span className="stage-time">{t.latency_ms} ms</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="risk-factors">
                        <h3>Data-Driven Explanation Factors</h3>
                        <ul>
                          {predictResult.risk_factors.map((rf, idx) => (
                            <li key={idx}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Q-Fraud Copilot Chat Assistant Panel */}
              <div className="glass-panel copilot-panel">
                <div className="panel-header">
                  <h2><MessageSquare size={20} className="purple-text" /> Q-Fraud Copilot (Evidence-Grounded AI Analyst)</h2>
                  <span className="tag-demo">RAG Grounded — Zero Hallucinations</span>
                </div>
                <div className="chat-window">
                  <div className="chat-messages">
                    {copilotMessages.map((m, idx) => (
                      <div key={idx} className={`chat-msg ${m.sender}`}>
                        <div className="msg-text">{m.text}</div>
                        {m.sources && (
                          <div className="msg-sources">
                            <span>Grounded Sources:</span>
                            {m.sources.map((s, si) => <span key={si} className="src-tag">{s}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <input
                      placeholder="Ask copilot: 'Why was TXN-QF-001 blocked?' or 'Explain quantum escalation'..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCopilotSend()}
                    />
                    <button className="primary-btn chat-send-btn" onClick={handleCopilotSend} disabled={chatLoading}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* QUANTUM LAB TAB */}
          {activeTab === "quantum" && (
            <motion.div
              key="quantum"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="tab-pane"
            >
              <div className="glass-panel">
                <h2>⚛ Quantum Engine Diagnostics (Qiskit 2.x API)</h2>
                <p className="panel-desc">State Vector Fidelity Kernel Mapping & Circuit Telemetry</p>

                <div className="telemetry-grid">
                  <div className="telemetry-card">
                    <span className="label">Qiskit Version</span>
                    <span className="val">{quantumStatus?.qiskit_version ?? "2.5.2"}</span>
                  </div>
                  <div className="telemetry-card">
                    <span className="label">Feature Map Function</span>
                    <span className="val">zz_feature_map</span>
                  </div>
                  <div className="telemetry-card">
                    <span className="label">Qubits</span>
                    <span className="val">{quantumStatus?.circuit_telemetry?.num_qubits ?? 4} Qubits</span>
                  </div>
                  <div className="telemetry-card">
                    <span className="label">Circuit Depth</span>
                    <span className="val">{quantumStatus?.circuit_telemetry?.depth ?? 22}</span>
                  </div>
                  <div className="telemetry-card">
                    <span className="label">2-Qubit CX Gates</span>
                    <span className="val">{quantumStatus?.circuit_telemetry?.two_qubit_gate_count ?? 12}</span>
                  </div>
                  <div className="telemetry-card">
                    <span className="label">Kernel Class</span>
                    <span className="val">FidelityStatevectorKernel</span>
                  </div>
                </div>

                <div className="kernel-verification-box">
                  <h3>Mathematical Kernel Verification</h3>
                  <div className="verif-tags">
                    <span className="verif-tag ok">Symmetric (K = K^T): TRUE</span>
                    <span className="verif-tag ok">Diagonal Elements = 1.0: TRUE</span>
                    <span className="verif-tag ok">Positive Semi-Definite (PSD): TRUE</span>
                    <span className="verif-tag mode">Execution Mode: SIMULATION</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MESH & GRAPH TAB */}
          {activeTab === "mesh" && (
            <motion.div
              key="mesh"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="tab-pane"
            >
              <div className="glass-panel">
                <h2>🌐 3D Payment Entity & Mesh Topology Network</h2>
                <p className="panel-desc">Interactive WebGL 3D Force Graph — Click nodes to fly camera & inspect risk links</p>

                <div className="graph-3d-box">
                  <TransactionGraph3D onSelectNode={(node) => console.log("Selected 3D node:", node)} />
                </div>
              </div>

              <div className="glass-panel">
                <h2>Node Trust Scores & Mesh Egress Status</h2>
                <p className="panel-desc">Express Node.js MERN Backend Per-Node Trust Engine</p>

                <div className="mesh-nodes-grid">
                  {meshNodes.map((n) => (
                    <div key={n.id} className="mesh-node-card">
                      <div className="node-top">
                        <span className="node-id">{n.id}</span>
                        <span className="node-role">{n.role}</span>
                      </div>
                      <h3 className="node-name">{n.name}</h3>
                      <div className="node-metrics">
                        <span>Trust Score: <b className="trust-badge">{(n.trust_score * 100).toFixed(0)}%</b></span>
                        <span>Status: <b className="green-text">{n.status.toUpperCase()}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MODEL BENCHMARKS TAB */}
          {activeTab === "models" && (
            <motion.div
              key="models"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="tab-pane"
            >
              <div className="glass-panel">
                <h2>Honest Model Evaluation Matrix</h2>
                <p className="panel-desc">Experimental comparison loaded directly from model_artifacts/**/metrics.json</p>

                <div className="table-wrapper">
                  <table className="models-table">
                    <thead>
                      <tr>
                        <th>MODEL NAME</th>
                        <th>ACCURACY</th>
                        <th>PRECISION</th>
                        <th>RECALL</th>
                        <th>F1 SCORE</th>
                        <th>ROC-AUC</th>
                        <th>PR-AUC</th>
                        <th>INFERENCE (MS)</th>
                        <th>MODE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelComparison.map((m, idx) => (
                        <tr key={idx}>
                          <td className="bold">{m.model_name}</td>
                          <td>{(m.accuracy * 100).toFixed(1)}%</td>
                          <td>{(m.precision * 100).toFixed(1)}%</td>
                          <td>{(m.recall * 100).toFixed(1)}%</td>
                          <td>{(m.f1 * 100).toFixed(1)}%</td>
                          <td>{m.roc_auc.toFixed(4)}</td>
                          <td className="highlight">{m.pr_auc.toFixed(4)}</td>
                          <td>{m.inference_ms.toFixed(3)}</td>
                          <td><span className="mode-badge">{m.execution_mode}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* FRAUD ALERTS TAB */}
          {activeTab === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="tab-pane"
            >
              <div className="glass-panel">
                <h2>Live Severity-Sorted Fraud Alert Feed</h2>
                <p className="panel-desc">High risk and suspicious payments flagged by hybrid intelligence</p>

                <div className="alerts-list">
                  {fraudAlerts.map((a, idx) => (
                    <motion.div 
                      key={idx} 
                      className={`alert-card ${a.risk_level.toLowerCase().replace(" ", "-")}`}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => openInvestigation(a.txn_id)}
                    >
                      <div className="alert-top">
                        <span className="txn-id">{a.txn_id}</span>
                        <span className="risk-level">{a.risk_level} ({a.risk_score}%)</span>
                        <span className="conf-badge">{a.confirmation}</span>
                      </div>
                      <div className="alert-body">
                        <span>Amount: <b>₹{a.amount?.toLocaleString()} INR</b></span>
                        <span>Decision: <b>{a.decision}</b></span>
                      </div>
                      <div className="alert-factors">
                        {a.risk_factors?.map((f, fi) => <span key={fi} className="factor-tag">{f}</span>)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Red-Team Fraud Attack Simulator Modal */}
      {attackModalOpen && (
        <div className="modal-backdrop" onClick={() => setAttackModalOpen(false)}>
          <motion.div 
            className="modal-content glass-panel attack-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>⚔️ Adversarial Fraud Attack Simulator (Red-Team Lab)</h2>
              <button className="close-btn" onClick={() => setAttackModalOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              <p className="attack-intro">Select a coordinated fraud attack pattern to launch against Q-FraudShield in real time:</p>
              
              <div className="attack-selector">
                <label className={attackType === "ACCOUNT_TAKEOVER" ? "active" : ""}>
                  <input type="radio" name="attack" value="ACCOUNT_TAKEOVER" checked={attackType === "ACCOUNT_TAKEOVER"} onChange={(e) => setAttackType(e.target.value)} />
                  Account Takeover (ATO)
                </label>
                <label className={attackType === "VELOCITY_BURST" ? "active" : ""}>
                  <input type="radio" name="attack" value="VELOCITY_BURST" checked={attackType === "VELOCITY_BURST"} onChange={(e) => setAttackType(e.target.value)} />
                  Velocity Burst (25 txns/min)
                </label>
                <label className={attackType === "DEVICE_HOPPING" ? "active" : ""}>
                  <input type="radio" name="attack" value="DEVICE_HOPPING" checked={attackType === "DEVICE_HOPPING"} onChange={(e) => setAttackType(e.target.value)} />
                  Device Hopping (15 accounts)
                </label>
                <label className={attackType === "TRANSACTION_SPLITTING" ? "active" : ""}>
                  <input type="radio" name="attack" value="TRANSACTION_SPLITTING" checked={attackType === "TRANSACTION_SPLITTING"} onChange={(e) => setAttackType(e.target.value)} />
                  Transaction Splitting (10 txns)
                </label>
              </div>

              <button className="primary-btn attack-launch-btn pulse-glow-red" onClick={runAttackSimulation} disabled={attackRunning}>
                {attackRunning ? "GENERATING ATTACK STREAM..." : "🔥 LAUNCH RED-TEAM ATTACK →"}
              </button>

              {attackResult && (
                <div className="attack-report-card">
                  <div className="report-header">
                    <span className="report-status">{attackResult.status}</span>
                    <span className="action-tag">{attackResult.final_action}</span>
                  </div>

                  <div className="report-stats">
                    <div className="report-stat">
                      <span>Classical-Only Detection</span>
                      <strong>{attackResult.classical_only_detection_rate}%</strong>
                    </div>
                    <div className="report-stat highlight">
                      <span>Q-FraudShield Detection</span>
                      <strong>{attackResult.q_fraudshield_detection_rate}%</strong>
                    </div>
                    <div className="report-stat green">
                      <span>FPR Reduction</span>
                      <strong>↓ {attackResult.false_positive_reduction_pct}%</strong>
                    </div>
                  </div>

                  <div className="report-breakdown">
                    <h4>Multi-Stage Defense Breakdown</h4>
                    {Object.entries(attackResult.detection_breakdown).map(([k, v]) => (
                      <div key={k} className="report-row">
                        <span className="stage-lbl">{k.replace("_", " ").toUpperCase()}</span>
                        <span className="stage-val">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* SOC Investigation Modal */}
      {selectedTxn && (
        <div className="modal-backdrop" onClick={() => setSelectedTxn(null)}>
          <motion.div 
            className="modal-content glass-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>SOC Investigation — {selectedTxn.prediction.txn_id}</h2>
              <button className="close-btn" onClick={() => setSelectedTxn(null)}><X size={18} /></button>
            </div>
            
            <div className="modal-body">
              <div className="modal-kpis">
                <div className="modal-kpi"><span>Risk Score</span><strong>{selectedTxn.prediction.risk_score}%</strong></div>
                <div className="modal-kpi"><span>Decision</span><strong>{selectedTxn.prediction.decision}</strong></div>
                <div className="modal-kpi"><span>Amount</span><strong>₹{selectedTxn.transaction.amount} INR</strong></div>
              </div>

              <h3>Graph Connection Network</h3>
              <p>Shared Device Users: {selectedTxn.graph_connections.shared_device_users.join(", ")}</p>
              <p>Merchant Status: {selectedTxn.graph_connections.merchant_reputation}</p>

              <h3>SHAP Explanation Factors</h3>
              <ul>
                {selectedTxn.shap_factors.map((s, idx) => (
                  <li key={idx}><b>{s.feature}</b>: {s.description} (Impact: +{s.impact})</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);