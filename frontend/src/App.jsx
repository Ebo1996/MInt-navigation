import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";

// Scroll to top on every route change (SPA behavior)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Page Imports
import Home from "./pages/Home";
import Sector from "./pages/Sector";
import Sectors from "./pages/Sectors";
import DepartmentDetail from "./pages/DepartmentDetail";
import Feedback from "./pages/Feedback";
import GeneralFeedback from "./pages/GeneralFeedback";

// Admin Imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import DepartmentManager from "./pages/admin/DepartmentManager";
import Settings from "./pages/admin/Settings";
import Announcements from "./pages/admin/Announcements";
import SectorManagers from "./pages/admin/SectorManagers";

// Sector Manager Imports
import SectorManagerLayout from "./components/sector-manager/SectorManagerLayout";
import SectorDashboard from "./components/sector-manager/SectorDashboard";
import SectorsManager from "./pages/admin/SectorsManager";
import SystemComplaints from "./pages/admin/SystemComplaints";
// Feedback Analytics Imports
import AnalyticsLayout from "./pages/feedback-analytics/AnalyticsLayout";
import Overview from "./pages/feedback-analytics/Overview";
import DepartmentRankings from "./pages/feedback-analytics/DepartmentRankings";
import DepartmentDetailAnalytics from "./pages/feedback-analytics/DepartmentDetailAnalytics";
import ReportGenerator from "./pages/feedback-analytics/ReportGenerator";
import Inbox from "./pages/feedback-analytics/Inbox";
import Insights from "./pages/feedback-analytics/Insights";
import ProfileSettings from "./pages/feedback-analytics/ProfileSettings";

/**
 * AUTHENTICATION GUARDS
 */

// General Protected Route
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  // Redirect sector managers from admin pages to their dashboard
  if (
    user.role === "sector_manager" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/sector-dashboard" replace />;
  }

  // Redirect feedback analysts away from admin shell (login lives at /admin/login)
  if (
    user.role === "feedback_analyst" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/feedback-analytics" replace />;
  }

  return children;
};

// Role-Based Analyst Route
const FeedbackAnalystRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isAnalyst =
    user.role === "feedback_analyst" || user.role === "superadmin";

  return isAuthenticated && isAnalyst ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

// Role-Based Sector Manager Route
const SectorManagerRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isSectorManager =
    user.role === "sector_manager" || user.role === "superadmin";

  return isAuthenticated && isSectorManager ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

/**
 * MAIN APPLICATION COMPONENT
 */
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/sector/:id" element={<Sector />} />
          <Route path="/departments" element={<Navigate to="/" replace />} />
          <Route path="/department/:id" element={<DepartmentDetail />} />
          <Route path="/feedback/:deptId" element={<Feedback />} />
          <Route path="/feedback" element={<GeneralFeedback />} />

          {/* ADMIN LOGIN (must not share path "/" with layout — duplicate `/admin` caused blank UI) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN PORTAL (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="departments" element={<DepartmentManager />} />
            <Route path="settings" element={<Settings />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="sector-managers" element={<SectorManagers />} />
            <Route path="sectors" element={<SectorsManager />} />
            <Route path="system-inbox" element={<SystemComplaints />} />
          </Route>

          {/* SECTOR MANAGER PORTAL */}
          <Route
            path="/sector-dashboard"
            element={
              <SectorManagerRoute>
                <SectorManagerLayout />
              </SectorManagerRoute>
            }
          >
            <Route index element={<SectorDashboard />} />
          </Route>

          {/* FEEDBACK ANALYTICS PORTAL */}
          <Route
            path="/feedback-analytics"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout />
              </FeedbackAnalystRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="rankings" element={<DepartmentRankings />} />
            <Route
              path="department/:id"
              element={<DepartmentDetailAnalytics />}
            />
            <Route path="reports" element={<ReportGenerator />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
