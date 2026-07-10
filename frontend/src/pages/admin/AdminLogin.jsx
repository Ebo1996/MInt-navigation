import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { adminService } from "../../services/adminService";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockCountdown, setLockCountdown] = useState("");

  const navigate = useNavigate();

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    const isAuth = localStorage.getItem("adminAuthenticated") === "true";
    const token  = localStorage.getItem("adminToken");
    if (isAuth && token) {
      const user = JSON.parse(localStorage.getItem("adminUser") || "{}");
      if (user.role === "feedback_analyst") navigate("/feedback-analytics", { replace: true });
      else if (user.role === "sector_manager" || user.role === "department_head") navigate("/sector-dashboard", { replace: true });
      else navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // ⏱️ Countdown timer when rate-limited
  React.useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLockCountdown("");
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setLockCountdown(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminService.login(credentials);

      // ✅ Persist token AND full user profile for route guards
      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          _id: response._id,
          username: response.username,
          email: response.email,
          role: response.role,
          sectorId: response.sectorId,
          departmentId: response.departmentId,
          wing: response.wing,
          name: response.name,
        }),
      );

      toast.success("Login successful");

      // ROLE-BASED REDIRECT
      const userRole = response.role;

      if (userRole === "feedback_analyst") {
        setTimeout(() => navigate("/feedback-analytics"), 800);
      } else if (userRole === "sector_manager" || userRole === "department_head") {
        setTimeout(() => navigate("/sector-dashboard"), 800);
      } else {
        setTimeout(() => navigate("/admin/dashboard"), 800);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        // Rate limited — lock the form for 15 minutes
        const unlockAt = Date.now() + 15 * 60 * 1000;
        setLockedUntil(unlockAt);
        toast.error("Too many login attempts. Try again in 15 minutes.", {
          duration: 6000,
          icon: "🚫",
        });
      } else if (status === 401) {
        toast.error("Invalid username or password.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#C8961E] selection:text-white font-sans relative overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #071E35 0%, #086976 55%, #1C3F65 100%)' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#086976",
            color: "#fff",
            border: "1px solid #C8961E",
          },
        }}
      />

      {/* Gold radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(200,150,30,0.08) 0%, transparent 70%)', filter:'blur(60px)'}}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(200,150,30,0.06) 0%, transparent 70%)', filter:'blur(80px)'}}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Compact brand badge */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(200,150,30,0.20)", backdropFilter:"blur(10px)" }}>
            <img
              src="/ministry-logo.png"
              alt="MiNT"
              className="h-9 w-auto object-contain flex-shrink-0"
            />
            <div className="border-l border-white/10 pl-3">
              <div className="text-base font-extrabold text-white leading-tight">
                MINT<span style={{ color:"#E8B84B" }}>Navigator</span>
              </div>
              <div className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.45)" }}>
                Admin Portal
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-center" style={{ color:"rgba(200,150,30,0.75)" }}>
            Ministry of Innovation &amp; Technology
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mt-8">
        <div className="py-10 px-4 sm:rounded-2xl sm:px-10 overflow-hidden" style={{background:'rgba(255,255,255,0.05)', backdropFilter:'blur(12px)', border:'1px solid rgba(200,150,30,0.2)', boxShadow:'0 25px 50px rgba(0,0,0,0.4)'}}>
          {/* Gold accent bar at top */}
          <div style={{height:4, background:'linear-gradient(90deg,#C8961E,#E8B84B,#C8961E)', marginBottom:'2rem', borderRadius:2}} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{color:'rgba(232,184,75,0.9)'}}>
                Username
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
                  style={{color: focused === "user" ? '#E8B84B' : 'rgba(255,255,255,0.4)'}}
                >
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onFocus={() => setFocused("user")}
                  onBlur={() => setFocused("")}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="block w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 focus:outline-none transition-all"
                  style={{
                    background:'#086976',
                    border: focused === "user" ? '1px solid #C8961E' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: focused === "user" ? '0 0 0 2px rgba(200,150,30,0.2)' : 'none'
                  }}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{color:'rgba(232,184,75,0.9)'}}>
                Password
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300"
                  style={{color: focused === "pass" ? '#E8B84B' : 'rgba(255,255,255,0.4)'}}
                >
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused("")}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="block w-full pl-12 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 focus:outline-none transition-all tracking-wider"
                  style={{
                    background:'#086976',
                    border: focused === "pass" ? '1px solid #C8961E' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: focused === "pass" ? '0 0 0 2px rgba(200,150,30,0.2)' : 'none'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{color:'rgba(255,255,255,0.4)'}}
                  onMouseEnter={e => e.currentTarget.style.color='#E8B84B'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded cursor-pointer"
                  style={{accentColor:'#C8961E'}}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm cursor-pointer"
                  style={{color:'rgba(255,255,255,0.6)'}}
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium transition-colors"
                  style={{color:'#E8B84B'}}
                  onMouseEnter={e => e.currentTarget.style.color='#C8961E'}
                  onMouseLeave={e => e.currentTarget.style.color='#E8B84B'}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Rate limit warning banner */}
            {lockedUntil && (
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{background:'rgba(220,38,38,0.15)', border:'1px solid rgba(220,38,38,0.4)', color:'#fca5a5'}}>
                <span className="text-lg">🚫</span>
                <div>
                  <p className="font-semibold" style={{color:'#fca5a5'}}>
                    Account temporarily locked
                  </p>
                  <p>
                    Too many failed attempts. Try again in{" "}
                    <span className="font-bold text-white">
                      {lockCountdown}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !!lockedUntil}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading || lockedUntil ? '#a07010' : '#C8961E',
                  color: '#071E35',
                  boxShadow:'0 0 20px rgba(200,150,30,0.25)',
                  focusRingColor:'#C8961E'
                }}
                onMouseEnter={e => { if (!loading && !lockedUntil) e.currentTarget.style.background='#a07010'; }}
                onMouseLeave={e => { if (!loading && !lockedUntil) e.currentTarget.style.background='#C8961E'; }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#071E35]/30 border-t-[#071E35] rounded-full animate-spin"></div>
                ) : lockedUntil ? (
                  `Locked — ${lockCountdown}`
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
