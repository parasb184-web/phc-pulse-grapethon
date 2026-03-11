import React from "react";
import { useNavigate } from "react-router-dom";
import { usePHC } from "../context/PHCContext";
import { Stethoscope, UserRound, Tv, ShieldCheck } from "lucide-react";
import Logo from "../components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { login } = usePHC();

  const goStaff = () => {
    login("staff");
    navigate("/staff/dashboard");
  };

  const goMedicineOfficer = () => {
    login("medicine_officer");
    navigate("/medicine/dashboard");
  };

  const goCitizen = () => {
    login("citizen");
    navigate("/public");
  };

  const goTV = () => {
    navigate("/tv");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "var(--bg-color)",
      }}
    >
      <style>{`
        .roleShell {
          width: min(520px, 100%);
          border-radius: 18px;
          padding: 22px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        }

        .brandRow {
          display: flex;
          gap: 14px;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }

        .brandIcon {
          display: none;
        }

        .roleList {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }

        .roleCard {
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 14px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: #FFFFFF;
          cursor: pointer;
          transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
        }

        .roleCard:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          background: var(--surface-blue);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .roleBadge {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: var(--surface-blue);
          border: 1px solid var(--border);
          flex: 0 0 auto;
        }

        .roleTitle {
          font-size: 1.05rem;
          font-weight: 900;
          margin: 0;
          line-height: 1.1;
        }

        .roleDesc {
          margin: 0;
          opacity: 0.78;
          font-size: 0.9rem;
          margin-top: 2px;
        }

        .subtle {
          opacity: 0.8;
          font-size: 0.95rem;
          text-align: center;
          margin: 12px 0 0 0;
          color: var(--text-secondary);
        }

        .footerNote {
          margin-top: 14px;
          font-size: 0.78rem;
          opacity: 0.65;
          text-align: center;
          line-height: 1.35;
        }
      `}</style>

      <div className="roleShell">
        <div className="brandRow">
          <div style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Logo height={42} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: 0, color: "var(--trust-blue)", lineHeight: 1.1 }}>
              PHC Pulse Live
            </div>
            <div style={{ opacity: 0.8, fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "3px" }}>
              Operational visibility platform for PHCs
            </div>
          </div>
        </div>

        <p className="subtle">Choose a view to continue.</p>

        <div className="roleList">
          <button type="button" className="roleCard" onClick={goTV}>
            <div className="roleBadge">
              <Tv size={20} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="roleTitle">TV Display</p>
              <p className="roleDesc">Waiting-area status board (public)</p>
            </div>
          </button>

          <button type="button" className="roleCard" onClick={goCitizen}>
            <div className="roleBadge">
              <UserRound size={20} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="roleTitle">Citizen View</p>
              <p className="roleDesc">Public dashboard: readiness, wait time, guidance</p>
            </div>
          </button>

          <button type="button" className="roleCard" onClick={goStaff}>
            <div className="roleBadge">
              <Stethoscope size={20} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="roleTitle">PHC Staff Console</p>
              <p className="roleDesc">Update live operations, service status, and alerts</p>
            </div>
          </button>

          <button type="button" className="roleCard" onClick={goMedicineOfficer}>
            <div className="roleBadge">
              <ShieldCheck size={20} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p className="roleTitle">Medicine Accountability Officer</p>
              <p className="roleDesc">Internal control console for medicine stock, reconciliation, alerts, and audit review</p>
            </div>
          </button>
        </div>

        <div className="footerNote">
          This system displays operational indicators only. No personal patient records are stored here.
        </div>
      </div>
    </div>
  );
};

export default Login;
