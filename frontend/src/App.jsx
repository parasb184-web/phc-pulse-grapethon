import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PHCProvider, usePHC } from './context/PHCContext';

import Welcome from "./pages/Welcome";
import HowToUse from "./pages/HowToUse";
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import MedicineDashboard from './pages/MedicineDashboard';
import PublicView from './pages/PublicView';
import TVScreen from './pages/TVScreen';
import GuideBot from './pages/GuideBot';
import TeleOPD from './pages/TeleOPD';
import CitizenLearn from "./pages/CitizenLearn";

const ProtectedRoute = ({ children, allowedRole = 'staff' }) => {
  const { role } = usePHC();
  if (role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <PHCProvider>
      <Router>
        <Routes>
          {/* Welcome / intro */}
          <Route path="/" element={<Welcome />} />
          <Route path="/how-to" element={<HowToUse />} />

          {/* Role selection */}
          <Route path="/login" element={<Login />} />

          {/* Staff protected */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Medicine Officer protected */}
          <Route
            path="/medicine/*"
            element={
              <ProtectedRoute allowedRole="medicine_officer">
                <MedicineDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public */}
          <Route path="/public" element={<PublicView />} />
          <Route path="/learn" element={<CitizenLearn />} />

          {/* Features */}
          <Route path="/bot" element={<GuideBot />} />
          <Route path="/teleopd" element={<TeleOPD />} />
          <Route path="/tv" element={<TVScreen />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </PHCProvider>
  );
}

export default App;