# PHC Pulse Live

PHC Pulse Live is a lightweight real-time transparency and operational intelligence platform for Primary Health Centres (PHCs).

It is not a hospital management system or an EMR platform.

## 1. Project Overview

PHC Pulse Live helps PHCs publish operational visibility to citizens while giving staff a practical console for live updates and internal review.  
The project combines:

- public-facing readiness and queue visibility
- waiting-area TV display
- staff operations controls
- medicine accountability workflows
- rule-based decision-support signals

## 2. Problem Statement

At many PHCs, citizens and staff face avoidable uncertainty:

- citizens do not know expected waiting time before travel
- doctor availability is not always visible
- service disruptions are communicated late
- medicine accountability trails are often fragmented

This causes crowding, repeat queries at help desks, and avoidable delays.

## 3. Our Solution

PHC Pulse Live provides one connected flow:

- **Staff Console** updates queue, doctor status, alerts, and symptom counts
- **Medicine Officer Console** records inward, issues, reconciliation, and alert resolution
- **Citizen View** and **TV View** show safe public summaries
- **Backend APIs** maintain source-of-truth for core operational and medicine data
- **Rule-based insight endpoints** provide demand, wait, depletion, anomaly, and early-warning signals

## 4. Why It Matters

- improves transparency without exposing sensitive internal ledgers
- supports faster operational decisions during high-load windows
- demonstrates a practical path from demo UI to backend-backed workflows
- keeps architecture small enough for PHC deployment constraints and hackathon iteration speed

## 5. Key Features

- Live PHC status updates (queue, doctors, alerts, emergency flag)
- Public readiness and wait indicators
- TV-friendly operational display
- Medicine accountability ledger:
  - stock inward
  - issue log
  - reconciliation + adjustment trail
  - anomaly alerts + resolution workflow
  - audit trail
- Rule-based decision support:
  - demand trend and short-horizon outlook
  - queue wait forecast + best arrival window
  - medicine depletion estimate and risk band
  - anomaly flags (mismatch, sudden drop, unusual spike, repeated adjustments, stock-out pattern)
- Token alert registration prototype (notification-ready)
- Epidemic early-warning prototype from symptom spike rules
- Nearby PHC comparison prototype panel for citizen guidance

## 6. User Roles / Views

- **Citizen View (`/public`)**
  - readiness summary, wait estimate, queue notification registration prototype, nearby comparison prototype
- **TV Display (`/tv`)**
  - waiting-area operational visibility
- **PHC Staff Console (`/staff/*`)**
  - operations dashboard, epidemic panel, learning/awareness management
- **Medicine Accountability Officer Console (`/medicine/*`)**
  - internal medicine ledger, reconciliation, alerts, audit trail

## 7. Technical Highlights

- Deterministic, explainable forecasting logic (not marketed as advanced ML)
- Clear separation of public medicine summary vs internal accountability records
- API-first integration for medicine and insights flows
- Safe frontend fallback behavior when backend calls fail
- SQLite-backed backend suitable for local demo and lightweight deployment

## 8. Backend Role / Architecture Summary

Backend is an Express + SQLite service and acts as source-of-truth for operational and medicine workflows.

### Core modules

- `routes/phc.js` + `services/phcService.js`: PHC status read/update
- `routes/medicines.js` + `services/medicineService.js`: medicine ledger workflows
- `routes/inventory.js`: compatibility-style medicine endpoints
- `routes/insights.js`: rule-based demand/wait/nearby comparison signals
- `routes/alerts.js`: token alert registration + epidemic warning signals
- `database.js`: schema creation + seed data

### Persistence

- SQLite file: `backend/database.sqlite`
- Frontend also keeps local demo resilience state (`localStorage`) where needed

### API coverage (selected)

- `GET /api/phc/status`
- `PATCH /api/phc/status`
- `GET /api/medicines`
- `POST /api/medicines/inward`
- `POST /api/medicines/issue`
- `POST /api/medicines/reconciliation`
- `PATCH /api/medicines/alerts/:id/resolve`
- `GET /api/insights/demand`
- `GET /api/insights/wait-time`
- `GET /api/insights/nearby-comparison`
- `POST /api/alerts/register`
- `GET /api/alerts/epidemic-signals`

## 9. Project Structure

```text
phc-pulse-grapethon-main/
  backend/
    routes/
    services/
    utils/
    database.js
    server.js
  frontend/
    src/
      pages/
      pages/staff/
      components/
      context/
      services/
  README.md
```

## 10. Tech Stack

### Frontend

- React 18
- Vite 5
- React Router
- Lucide React icons
- Framer Motion

### Backend

- Node.js
- Express 5
- SQLite (`sqlite`, `sqlite3`)
- `dotenv`, `cors`

### Optional / experimental in repo

- Firebase libraries are present
- `/api/ai/*` route exists with Gemini-key support and fallback behavior

## 11. Setup / Local Run

## Prerequisites

- Node.js (LTS recommended)
- npm

## Run backend

```bash
cd backend
npm install
npm run dev
```

Backend default: `http://localhost:5000`

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default (Vite): `http://localhost:5173`

If needed, set `VITE_API_URL` for frontend API target.

## 12. Demo / Prototype Scope (Honest Boundary)

This repository is a working prototype with meaningful backend integration, but some capabilities remain prototype-level:

- token alert registration stores requests; live SMS/WhatsApp delivery is not wired
- epidemic signal is rule-based trend flagging, not a full surveillance pipeline
- nearby PHC comparison is a lightweight prototype model (deterministic assumptions + current PHC context)
- auth is role-selection based for demo use; production-grade auth/RBAC is not fully implemented

## 13. Future Scope

- production authentication + strict RBAC
- live notification gateway integration (SMS/WhatsApp)
- stronger multi-PHC data ingestion and routing logic
- richer longitudinal analytics dashboards
- hardened monitoring, audit controls, and deployment profiles

