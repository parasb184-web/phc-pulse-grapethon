import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { usePHC } from "../context/PHCContext";
import { LogOut, Package } from "lucide-react";
import Logo from "../components/Logo";

import MedicineAccountability from "./staff/MedicineAccountability";

const NavBtn = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: "none",
            border: "none",
            color: active ? "var(--primary)" : "var(--text-secondary)",
            fontSize: "1.05rem",
            fontWeight: 800,
            cursor: "pointer",
            borderBottom: active ? "3px solid var(--primary)" : "3px solid transparent",
            paddingBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            transition: "color 150ms ease"
        }}
    >
        <Icon size={18} />
        {label}
    </button>
);

const MedicineDashboard = () => {
    const { logout, phcData } = usePHC();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const path = location.pathname;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
            <header className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Logo height={56} />
                    <div>
                        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Medicine Accountability Console</h1>
                        <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>{phcData.phcName}</p>
                    </div>
                </div>

                <button className="btn-secondary" onClick={handleLogout} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <LogOut size={18} /> Sign Out
                </button>
            </header>

            {/* Top navigation */}
            <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <NavBtn
                    icon={Package}
                    label="Medicine Ledger"
                    active={path.includes("/medicine/dashboard")}
                    onClick={() => navigate("/medicine/dashboard")}
                />
            </div>

            {/* Page routes */}
            <main>
                <Routes>
                    <Route path="dashboard" element={<MedicineAccountability />} />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default MedicineDashboard;
