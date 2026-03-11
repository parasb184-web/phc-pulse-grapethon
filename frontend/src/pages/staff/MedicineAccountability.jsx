import React, { useState } from "react";
import { usePHC } from "../../context/PHCContext";
import { Package, Inbox, FileText, ShieldAlert, Activity, AlertTriangle, CheckCircle2, History } from "lucide-react";
import SectionImage from "../../components/SectionImage";
import stockImg from "../../assets/medicine-stock.png";
import auditImg from "../../assets/audit-reconciliation.png";

export default function MedicineAccountability() {
    const { internalMedicines, loadDemoMedicines, getAvailableStock, addStockInwardEntry, addIssueEntry, role, submitReconciliation, resolveAlert } = usePHC();
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: Package },
        { id: "inward", label: "Stock Inward", icon: Inbox },
        { id: "issue", label: "Issue Log", icon: FileText },
        { id: "reconciliation", label: "Reconciliation", icon: CheckCircle2 },
        { id: "alerts", label: "Alerts & Review", icon: ShieldAlert },
        { id: "audit", label: "Audit Trail", icon: History },
    ];

    return (
        <div className="flex-col gap-6 animate-fade-in" style={{ padding: "2rem 0", display: "flex" }}>

            {/* Overview Header */}
            <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                        <Package color="var(--primary)" /> Medicine Accountability
                    </h2>
                    <p style={{ opacity: 0.7, margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                        Internal tracking ledger for stock transparency and anomaly detection.
                    </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <button className="btn-secondary" onClick={loadDemoMedicines} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <Activity size={16} /> Load Demo Data
                    </button>
                    <span style={{ fontSize: "0.75rem", opacity: 0.6, color: "var(--text-secondary)" }}>*Demo for prototype only</span>
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem", overflowX: "auto" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: activeTab === tab.id ? "var(--surface-blue)" : "none",
                            border: "1px solid",
                            borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
                            color: activeTab === tab.id ? "var(--primary)" : "var(--text-secondary)",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            transition: "all 0.2s"
                        }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content Area */}
            <div style={{ marginTop: "1rem" }}>
                {activeTab === "overview" && <OverviewTab internalMedicines={internalMedicines} getAvailableStock={getAvailableStock} />}
                {activeTab === "inward" && <StockInwardTab catalog={internalMedicines.catalog} addStockInwardEntry={addStockInwardEntry} role={role} setActiveTab={setActiveTab} />}
                {activeTab === "issue" && <IssueLogTab internalMedicines={internalMedicines} getAvailableStock={getAvailableStock} addIssueEntry={addIssueEntry} role={role} setActiveTab={setActiveTab} />}
                {activeTab === "reconciliation" && <ReconciliationTab internalMedicines={internalMedicines} getAvailableStock={getAvailableStock} submitReconciliation={submitReconciliation} role={role} setActiveTab={setActiveTab} />}
                {activeTab === "alerts" && <AlertsReviewTab internalMedicines={internalMedicines} resolveAlert={resolveAlert} role={role} />}
                {activeTab === "audit" && <AuditTrailTab internalMedicines={internalMedicines} />}
            </div>

        </div>
    );
}

// ===== OVERVIEW TAB =====
function OverviewTab({ internalMedicines, getAvailableStock }) {
    const todayDate = new Date().toISOString().split('T')[0];

    const todayTxns = internalMedicines.transactions.filter(t => t.date.startsWith(todayDate));
    const todayInward = todayTxns.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.qty, 0);
    const todayIssued = todayTxns.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.qty, 0);

    const lowStockCount = internalMedicines.catalog.filter(m => getAvailableStock(m.id) <= m.reorderLevel).length;
    const mismatchCount = internalMedicines.alerts.filter(a => (
        ['MISMATCH', 'SUDDEN_DROP', 'STOCK_OUT_PATTERN', 'UNUSUAL_CONSUMPTION_SPIKE', 'TOO_MANY_ADJUSTMENTS'].includes(a.type) && !a.resolved
    )).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <SectionImage src={stockImg} alt="Medicine Stock Tracking" height={180} objectPosition="center 30%" style={{ marginBottom: "0.5rem" }} />

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div className="glass-card flex-col items-center justify-center text-center">
                    <Package size={28} color="var(--primary)" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 800 }}>{internalMedicines.catalog.length}</div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Tracked Medicines</div>
                </div>

                <div className="glass-card flex-col items-center justify-center text-center">
                    <Activity size={28} color="var(--accent)" style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 800 }}>+{todayInward} <span style={{ fontSize: "1rem", color: "var(--primary)" }}>/-{todayIssued}</span></div>
                    <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>Today (In/Out)</div>
                </div>

                <div className="glass-card flex-col items-center justify-center text-center" style={{ borderColor: lowStockCount > 0 ? "var(--warning)" : "var(--border)" }}>
                    <AlertTriangle size={28} color={lowStockCount > 0 ? "var(--warning)" : "var(--text-muted)"} style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: lowStockCount > 0 ? "var(--warning)" : "var(--text-primary)" }}>{lowStockCount}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Low Stock Alerts</div>
                </div>

                <div className="glass-card flex-col items-center justify-center text-center" style={{ borderColor: mismatchCount > 0 ? "var(--error)" : "var(--border)" }}>
                    <ShieldAlert size={28} color={mismatchCount > 0 ? "var(--error)" : "var(--text-muted)"} style={{ marginBottom: "0.5rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: mismatchCount > 0 ? "var(--error)" : "var(--text-primary)" }}>{mismatchCount}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Anomaly Flags</div>
                </div>
            </div>

            {/* Inventory Depletion Overview (Replaces plain table) */}
            <div className="glass-card">
                <h3 style={{ marginBottom: "1rem" }}>Predictive Stock Endurance</h3>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                                <th style={{ padding: "0.8rem 0.5rem" }}>Medicine</th>
                                <th style={{ padding: "0.8rem 0.5rem" }}>Current Stock</th>
                                <th style={{ padding: "0.8rem 0.5rem" }}>Projected Endurance</th>
                                <th style={{ padding: "0.8rem 0.5rem" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {internalMedicines.catalog.slice(0, 5).map(med => {
                                const stock = med.currentStock ?? getAvailableStock(med.id);
                                const days = med.estimatedDepletionDays || 0;
                                const status = med.riskBand || "Stable";
                                const color = status === "High Risk" || status === "Out of Stock" ? "var(--error)" : status === "Watchlist" ? "var(--warning)" : "var(--success)";
                                
                                return (
                                    <tr key={med.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                        <td style={{ padding: "0.8rem 0.5rem", fontWeight: 600 }}>{med.name}</td>
                                        <td style={{ padding: "0.8rem 0.5rem" }}>{stock}</td>
                                        <td style={{ padding: "0.8rem 0.5rem", fontWeight: 700, color: color }}>
                                            {days > 0 ? `${days} Days` : "0 Days"}
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400, marginTop: "2px" }}>
                                                Based on recent issue trend
                                            </div>
                                        </td>
                                        <td style={{ padding: "0.8rem 0.5rem" }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "0.8rem",
                                                fontWeight: 700,
                                                background: `var(--${status === 'Stable' ? 'success' : status === 'Watchlist' ? 'warning' : 'error'}-soft)`,
                                                color: color
                                            }}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="glass-card">
                <h3 style={{ marginBottom: "1rem" }}>Recent Transactions</h3>
                {internalMedicines.transactions.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", background: "var(--surface-muted)", borderRadius: "8px" }}>
                        <p>No transactions logged yet. Use the Stock Inward or Issue Log tabs to record movements.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: 0.7 }}>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>Date/Time</th>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>Type</th>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>Medicine</th>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>Qty</th>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>User</th>
                                    <th style={{ padding: "0.8rem 0.5rem" }}>Ref/Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internalMedicines.transactions.slice(0, 5).map(txn => {
                                    const med = internalMedicines.catalog.find(m => m.id === txn.medId);
                                    return (
                                        <tr key={txn.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.9rem" }}>{new Date(txn.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                            <td style={{ padding: "0.8rem 0.5rem" }}>
                                                <span style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    background: txn.type === 'IN' ? "var(--success-soft)" : "var(--error-soft)",
                                                    color: txn.type === 'IN' ? "var(--success)" : "var(--error)"
                                                }}>
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.8rem 0.5rem", fontWeight: 600 }}>{med?.name || txn.medId}</td>
                                            <td style={{ padding: "0.8rem 0.5rem" }}>{txn.qty}</td>
                                            <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>{txn.user}</td>
                                            <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>{txn.type === 'IN' ? txn.source : txn.patientRef}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== STOCK INWARD TAB =====
function StockInwardTab({ catalog, addStockInwardEntry, role, setActiveTab }) {
    const [formData, setFormData] = useState({ medId: "", qty: "", source: "", remarks: "" });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medId || !formData.qty || Number(formData.qty) <= 0) return alert("Please fill valid medicine and quantity > 0");

        const ok = await addStockInwardEntry({
            medId: formData.medId,
            qty: Number(formData.qty),
            source: formData.source || "Unknown Supplier",
            remarks: formData.remarks,
            user: role || "Staff"
        });
        if (!ok) return alert("Failed to record inward entry. Please retry.");

        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setFormData({ medId: "", qty: "", source: "", remarks: "" });
            setActiveTab("overview");
        }, 1500);
    };

    if (success) {
        return (
            <div className="glass-card flex-col items-center justify-center text-center" style={{ minHeight: "300px" }}>
                <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: "1rem" }} />
                <h2 style={{ color: "var(--primary)" }}>Stock Logged Successfully</h2>
                <p style={{ opacity: 0.7 }}>The inventory ledger has been updated.</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Inbox color="var(--primary)" /> Log Incoming Stock
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Medicine</label>
                    <select
                        value={formData.medId}
                        onChange={e => setFormData({ ...formData, medId: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "var(--surface-muted)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
                        required
                    >
                        <option value="">-- Select Medicine --</option>
                        {catalog.map(m => <option key={m.id} value={m.id}>{m.name} ({m.type})</option>)}
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Quantity Received</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.qty}
                            onChange={e => setFormData({ ...formData, qty: e.target.value })}
                            placeholder="e.g. 500"
                            style={{ width: "100%" }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Source/Batch</label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={e => setFormData({ ...formData, source: e.target.value })}
                            placeholder="e.g. District Warehouse, B-993"
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Remarks (Optional)</label>
                    <input
                        type="text"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Condition on arrival, etc."
                        style={{ width: "100%" }}
                    />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }}>
                    Confirm & Log Stock Inward
                </button>
            </form>
        </div>
    );
}

// ===== ISSUE LOG TAB =====
function IssueLogTab({ internalMedicines, getAvailableStock, addIssueEntry, role, setActiveTab }) {
    const [formData, setFormData] = useState({ medId: "", qty: "", patientRef: "", remarks: "" });
    const [success, setSuccess] = useState(false);

    const selectedStock = formData.medId ? getAvailableStock(formData.medId) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medId || !formData.qty || Number(formData.qty) <= 0) return alert("Please fill valid medicine and quantity > 0");
        if (Number(formData.qty) > selectedStock) return alert("Cannot issue more than available stock!");

        const ok = await addIssueEntry({
            medId: formData.medId,
            qty: Number(formData.qty),
            patientRef: formData.patientRef || "Walk-in OPD",
            remarks: formData.remarks,
            user: role || "Staff"
        });
        if (!ok) return alert("Failed to record issue entry. Please retry.");

        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setFormData({ medId: "", qty: "", patientRef: "", remarks: "" });
            setActiveTab("overview");
        }, 1500);
    };

    if (success) {
        return (
            <div className="glass-card flex-col items-center justify-center text-center" style={{ minHeight: "300px" }}>
                <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: "1rem" }} />
                <h2 style={{ color: "var(--primary)" }}>Issue Logged Successfully</h2>
                <p style={{ opacity: 0.7 }}>Stock has been deducted from the ledger.</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText color="var(--accent)" /> Log Medicine Issue
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div>
                    <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>
                        <span>Medicine</span>
                        {formData.medId && <span style={{ color: selectedStock > 0 ? "var(--primary)" : "var(--error)" }}>Avail: {selectedStock}</span>}
                    </label>
                    <select
                        value={formData.medId}
                        onChange={e => setFormData({ ...formData, medId: e.target.value })}
                        style={{ width: "100%", padding: "10px", background: "var(--surface-muted)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
                        required
                    >
                        <option value="">-- Select Medicine --</option>
                        {internalMedicines.catalog.map(m => {
                            const stock = getAvailableStock(m.id);
                            return <option key={m.id} value={m.id} disabled={stock <= 0}>{m.name} ({stock} avail)</option>
                        })}
                    </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Quantity Issued</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedStock || 1}
                            value={formData.qty}
                            onChange={e => setFormData({ ...formData, qty: e.target.value })}
                            placeholder="e.g. 10"
                            style={{ width: "100%" }}
                            required
                            disabled={!formData.medId}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Patient / Rx Ref</label>
                        <input
                            type="text"
                            value={formData.patientRef}
                            onChange={e => setFormData({ ...formData, patientRef: e.target.value })}
                            placeholder="e.g. Token #42, Name"
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Remarks (Optional)</label>
                    <input
                        type="text"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Special instructions..."
                        style={{ width: "100%" }}
                    />
                </div>

                <button type="submit" className="btn-secondary" style={{ marginTop: "1rem" }} disabled={!formData.medId || Number(formData.qty) <= 0 || Number(formData.qty) > selectedStock}>
                    Confirm & Log Issue
                </button>
            </form>
        </div>
    );
}

// ===== RECONCILIATION TAB =====
function ReconciliationTab({ internalMedicines, getAvailableStock, submitReconciliation, role, setActiveTab }) {
    const [formData, setFormData] = useState({ medId: "", actualQty: "", remarks: "" });
    const [success, setSuccess] = useState(false);

    const expectedStock = formData.medId ? getAvailableStock(formData.medId) : null;
    const discrepancy = (formData.actualQty !== "" && expectedStock !== null) ? Number(formData.actualQty) - expectedStock : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medId || formData.actualQty === "") return alert("Please fill all required fields.");

        const ok = await submitReconciliation({
            medId: formData.medId,
            expectedQty: expectedStock,
            actualQty: Number(formData.actualQty),
            remarks: formData.remarks,
            user: role || "Lead Pharmacist"
        });
        if (!ok) return alert("Failed to submit reconciliation. Please retry.");

        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            setFormData({ medId: "", actualQty: "", remarks: "" });
            setActiveTab("alerts");
        }, 2000);
    };

    if (success) {
        return (
            <div className="glass-card flex-col items-center justify-center text-center" style={{ minHeight: "300px" }}>
                <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: "1rem" }} />
                <h2 style={{ color: "var(--primary)" }}>Reconciliation Submitted</h2>
                <p style={{ opacity: 0.7 }}>Stock ledgers adjusted. Alerts generated if anomalies were found.</p>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h3 style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 color="var(--primary)" /> Physical Stock Reconciliation
            </h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Compare physical inventory against system ledger. Mismatches will trigger automatic diversion risk indicators.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Select Medicine</label>
                        <select
                            value={formData.medId}
                            onChange={e => setFormData({ ...formData, medId: e.target.value })}
                            style={{ width: "100%", padding: "10px", background: "var(--surface-muted)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "8px" }}
                            required
                        >
                            <option value="">-- Select Medicine --</option>
                            {(internalMedicines?.catalog || []).map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Actual Physical Count</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.actualQty}
                            onChange={e => setFormData({ ...formData, actualQty: e.target.value })}
                            placeholder="e.g. 500"
                            style={{ width: "100%" }}
                            required
                            disabled={!formData.medId}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Auditor Remarks</label>
                        <input
                            type="text"
                            value={formData.remarks}
                            onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            placeholder="Notes on count or findings"
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "1rem" }} disabled={!formData.medId || formData.actualQty === ""}>
                        Submit Audit
                    </button>
                </form>

                <div style={{ background: "var(--surface-muted)", borderRadius: "12px", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "1rem" }}>Reconciliation Preview</h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                            <span style={{ opacity: 0.7 }}>Medicine</span>
                            <span style={{ fontWeight: 600, textAlign: "right" }}>{formData.medId ? (internalMedicines?.catalog || []).find(m => m.id === formData.medId)?.name : "--"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                            <span style={{ opacity: 0.7 }}>Expected System Ledger</span>
                            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{expectedStock !== null ? expectedStock : "--"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                            <span style={{ opacity: 0.7 }}>Actual Physical Stock</span>
                            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{formData.actualQty !== "" ? formData.actualQty : "--"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", padding: "0.75rem", background: discrepancy < 0 ? "var(--error-soft)" : discrepancy > 0 ? "var(--warning-soft)" : discrepancy === 0 ? "var(--success-soft)" : "transparent", borderRadius: "8px" }}>
                            <span style={{ fontWeight: 700 }}>Mismatch</span>
                            <span style={{
                                fontWeight: 800,
                                fontSize: "1.2rem",
                                color: discrepancy < 0 ? "var(--error)" : discrepancy > 0 ? "var(--warning)" : discrepancy === 0 ? "var(--success)" : "inherit"
                            }}>
                                {discrepancy !== null ? discrepancy > 0 ? `+${discrepancy}` : discrepancy : "--"}
                            </span>
                        </div>
                        {discrepancy < 0 && (
                            <div style={{ fontSize: "0.85rem", color: "var(--error)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                Deficit detected. This will automatically trigger a Suspicious Mismatch / Diversion Risk alert requiring review.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== ALERTS & REVIEW TAB =====
function AlertsReviewTab({ internalMedicines, resolveAlert, role }) {
    const [activeAlertId, setActiveAlertId] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState("");

    const pendingAlerts = (internalMedicines?.alerts || []).filter(a => !a.resolved);
    const resolvedAlerts = (internalMedicines?.alerts || []).filter(a => a.resolved);

    const getAlertColor = (type) => {
        switch (type) {
            case 'MISMATCH': return 'var(--error)';
            case 'LOW_STOCK': return 'var(--warning)';
            case 'SUDDEN_DROP': return 'var(--error)';
            case 'STOCK_OUT_PATTERN': return 'var(--warning)';
            case 'UNUSUAL_CONSUMPTION_SPIKE': return 'var(--error)';
            case 'TOO_MANY_ADJUSTMENTS': return 'var(--warning)';
            default: return 'var(--text-color)';
        }
    };

    const activeAlert = (internalMedicines?.alerts || []).find(a => a.id === activeAlertId);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.5rem" }}>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                    <ShieldAlert color="var(--error)" /> Active Anomaly Alerts
                </h3>

                {pendingAlerts.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", opacity: 0.6 }}>
                        <CheckCircle2 size={48} style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
                        <p>No active alerts requiring review.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {pendingAlerts.map(alert => {
                            const med = (internalMedicines?.catalog || []).find(m => m.id === alert.medId);
                            return (
                                <div
                                    key={alert.id}
                                    onClick={() => setActiveAlertId(alert.id)}
                                    style={{
                                        padding: "1rem",
                                        background: activeAlertId === alert.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                                        borderLeft: `4px solid ${getAlertColor(alert.type)}`,
                                        borderRight: activeAlertId === alert.id ? "1px solid var(--glass-border)" : "1px solid transparent",
                                        borderTop: activeAlertId === alert.id ? "1px solid var(--glass-border)" : "1px solid transparent",
                                        borderBottom: activeAlertId === alert.id ? "1px solid var(--glass-border)" : "1px solid transparent",
                                        borderRadius: "0 8px 8px 0",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                                        <span style={{ fontWeight: 800, color: getAlertColor(alert.type), fontSize: "0.85rem" }}>
                                            {alert.type.replace(/_/g, ' ')}
                                        </span>
                                        <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>{new Date(alert.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.3rem" }}>{med?.name}</div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: 1.4 }}>{alert.message}</div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {resolvedAlerts.length > 0 && (
                    <div style={{ marginTop: "2rem" }}>
                        <h4 style={{ opacity: 0.7, marginBottom: "1rem" }}>Recently Resolved</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {resolvedAlerts.slice(0, 3).map(alert => (
                                <div key={alert.id} style={{ padding: "0.8rem", background: "rgba(0,0,0,0.1)", borderRadius: "8px", opacity: 0.7, fontSize: "0.85rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                        <strong>{alert.type.replace(/_/g, ' ')}</strong>
                                        <span>Resolved by {alert.resolvedBy}</span>
                                    </div>
                                    <div style={{ opacity: 0.8 }}>{alert.message}</div>
                                    <div style={{ marginTop: "0.4rem", color: "var(--primary)" }}>✓ {alert.resolutionNotes}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ alignSelf: "start", position: "sticky", top: "1rem" }}>
                <h3 style={{ margin: "0 0 1rem 0" }}>Resolution Panel</h3>
                {activeAlert ? (
                    <div>
                        <div style={{ padding: "1rem", background: "rgba(0,0,0,0.1)", borderRadius: "8px", marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.2rem" }}>Alert ID: {activeAlert.id}</div>
                            <div style={{ fontWeight: 700, color: getAlertColor(activeAlert.type), marginBottom: "0.5rem" }}>
                                {activeAlert.type.replace(/_/g, ' ')}
                            </div>
                            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4 }}>{activeAlert.message}</p>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const ok = await resolveAlert(activeAlert.id, resolutionNotes, role || "Admin");
                            if (!ok) return alert("Failed to resolve alert. Please retry.");
                            setActiveAlertId(null);
                            setResolutionNotes("");
                        }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>Resolution / Investigation Notes</label>
                            <textarea
                                value={resolutionNotes}
                                onChange={e => setResolutionNotes(e.target.value)}
                                rows={4}
                                style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "var(--text-color)", borderRadius: "8px", marginBottom: "1rem" }}
                                placeholder="Detail findings, corrective actions, or explanations..."
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ width: "100%" }}>Mark as Resolved</button>
                        </form>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", opacity: 0.5, padding: "2rem 0", fontSize: "0.9rem" }}>
                        Select an active alert to log resolution notes.
                    </div>
                )}
            </div>

        </div>
    );
}

// ===== AUDIT TRAIL TAB =====
function AuditTrailTab({ internalMedicines }) {
    return (
        <div className="glass-card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <History color="var(--primary)" /> System Audit Trail
            </h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Immutable log of all internal accountability actions and resolutions.
            </p>

            <SectionImage src={auditImg} alt="System Audit Trail" height={160} objectPosition="center 20%" style={{ marginBottom: "1.5rem" }} />

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: 0.7 }}>
                            <th style={{ padding: "0.8rem 0.5rem" }}>Timestamp</th>
                            <th style={{ padding: "0.8rem 0.5rem" }}>Action</th>
                            <th style={{ padding: "0.8rem 0.5rem" }}>User</th>
                            <th style={{ padding: "0.8rem 0.5rem" }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(internalMedicines?.auditTrail || []).length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: "1rem 0.5rem", opacity: 0.7 }}>
                                    No audit events available yet.
                                </td>
                            </tr>
                        )}
                        {(internalMedicines?.auditTrail || []).map((audit) => (
                            <tr key={audit.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                    {new Date(audit.date || audit.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                </td>
                                <td style={{ padding: "0.8rem 0.5rem" }}>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        background: "var(--surface-muted)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-secondary)",
                                        textTransform: "uppercase"
                                    }}>
                                        {audit.action.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>{audit.user || audit.actor || "System"}</td>
                                <td style={{ padding: "0.8rem 0.5rem", fontSize: "0.9rem", lineHeight: 1.4 }}>{audit.details || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
