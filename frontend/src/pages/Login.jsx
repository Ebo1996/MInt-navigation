import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function getRedirectPath(role) {
  if (role === "admin") return "/dashboard/analytics";
  if (role === "general_manager") return "/dashboard";
  if (role === "department_manager") return "/dashboard";
  return "/";
}

function Login() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token && user) {
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login({ email: form.email, password: form.password });
      const fallback = getRedirectPath(loggedInUser.role);
      const from = location.state?.from?.pathname;
      navigate(from && from !== "/login" ? from : fallback, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-mint-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/50 bg-white/40 p-7 shadow-2xl backdrop-blur-xl transition duration-300 hover:shadow-mint-200/60 md:p-9"
      >
        <h1 className="mb-2 text-3xl font-bold text-mint-900">Sign in</h1>
        <p className="mb-7 text-sm text-mint-800">Access Smart Visitor Guidance System</p>

        {error ? (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-mint-900">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-mint-700" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-mint-200 bg-white/80 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-mint-400 focus:ring-2 focus:ring-mint-200"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-mint-900">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-mint-700" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-mint-200 bg-white/80 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-mint-400 focus:ring-2 focus:ring-mint-200"
                placeholder="Enter password"
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-mint-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-mint-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

export default Login;
