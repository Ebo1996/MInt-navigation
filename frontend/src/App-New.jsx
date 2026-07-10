import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";

// New pages
import Home from "./pages/Home-New";
import Sector from "./pages/Sector";
import DepartmentDetail from "./pages/DepartmentDetail-New";

// Existing pages
import Feedback from "./pages/Feedback";
import GeneralFeedback from "./pages/GeneralFeedback";

// Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import DepartmentManager from "./pages/admin/DepartmentManager";
import FeedbackManager from "./pages/admin/FeedbackManager";
import Settings from "./pages/admin/Settings";

// Feedback Analytics imports
import AnalyticsLayout from "./pages/feedback-analytics/AnalyticsLayout";
import Overview from "./pages/feedback-analytics/Overview";
import DepartmentRankings from "./pages/feedback-analytics/DepartmentRankings";
import DepartmentDetailAnalytics from "./pages/feedback-analytics/DepartmentDetailAnalytics";
import ReportGenerator from "./pages/feedback-analytics/ReportGenerator";
import Inbox from "./pages/feedback-analytics/Inbox";
import Insights from "./pages/feedback-analytics/Insights";
import ProfileSettings from "./pages/feedback-analytics/ProfileSettings";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/admin" />;
};

// Feedback Analyst route (checks role)
const FeedbackAnalystRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const isAnalyst =
    user.role === "feedback_analyst" || user.role === "superadmin";

  return isAuthenticated && isAnalyst ? children : <Navigate to="/admin" />;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/sector/:sectorId" element={<Sector />} />
          <Route path="/department/:departmentId" element={<DepartmentDetail />} />
          
          {/* Legacy Routes (keep for compatibility) */}
          <Route path="/departments" element={<Navigate to="/" replace />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/general-feedback" element={<GeneralFeedback />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DepartmentManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeedbackManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Feedback Analytics Routes */}
          <Route
            path="/analytics"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <Overview />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/rankings"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <DepartmentRankings />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/department/:id"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <DepartmentDetailAnalytics />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/reports"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <ReportGenerator />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/inbox"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <Inbox />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/insights"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <Insights />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          <Route
            path="/analytics/profile"
            element={
              <FeedbackAnalystRoute>
                <AnalyticsLayout>
                  <ProfileSettings />
                </AnalyticsLayout>
              </FeedbackAnalystRoute>
            }
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
