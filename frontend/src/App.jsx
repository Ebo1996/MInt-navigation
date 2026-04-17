import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

function HomeRedirect() {
  const { user, token } = useAuth();

  if (!token) return <LandingPage />;
  if (user?.role === "admin") return <Navigate to="/dashboard/analytics" replace />;
  if (user?.role === "general_manager") return <Navigate to="/dashboard" replace />;
  if (user?.role === "department_manager") return <Navigate to="/dashboard" replace />;

  return <LandingPage />;
}

function RoleBasedDashboard() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Navigate to="/dashboard/analytics" replace /> : <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "general_manager", "department_manager"]}>
              <RoleBasedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/feedback"
          element={
            <ProtectedRoute allowedRoles={["general_manager", "department_manager"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-department"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-manager"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin-dashboard/feedback" element={<Navigate to="/dashboard/feedback" replace />} />
        <Route path="/admin-dashboard/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="/admin-dashboard/settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
