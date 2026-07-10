import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiArrowRight } from "react-icons/fi";

export default function PortalLanding() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Admin Portal",
      subtitle: "System administration & management",
      icon: "⚙️",
      role: "Administrator",
      gradient: "linear-gradient(135deg, #071E35 0%, #086976 100%)",
      border: "rgba(8,105,118,0.6)",
      path: "/admin/login",
    },
    {
      title: "Department Head",
      subtitle: "Department feedback & performance",
      icon: "🏢",
      role: "Department Head",
      gradient: "linear-gradient(135deg, #071E35 0%, #1C3F65 100%)",
      border: "rgba(28,63,101,0.6)",
      path: "/admin/login",
    },
    {
      title: "Feedback Analyst",
      subtitle: "Analytics & report generation",
      icon: "📊",
      role: "Feedback Analyst",
      gradient: "linear-gradient(135deg, #1a0a4a 0%, #3b1e80 100%)",
      border: "rgba(59,30,128,0.6)",
      path: "/admin/login",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(155deg, #071E35 0%, #086976 55%, #1C3F65 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
        style={{ background: "#C8961E" }} />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-5"
        style={{ background: "#E8B84B" }} />

      {/* Logo */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            🇪🇹
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">
              MINT<span style={{ color: "#E8B84B" }}>Navigator</span>
            </h1>
            <p className="text-xs text-blue-200 opacity-80 mt-0.5">
              Ministry of Innovation & Technology
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full mx-auto w-fit"
          style={{ background: "rgba(200,150,30,0.15)", border: "1px solid rgba(200,150,30,0.30)" }}>
          <FiShield size={12} style={{ color: "#E8B84B" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#E8B84B" }}>
            Staff Portal — Select Your Role
          </span>
        </div>
      </motion.div>

      {/* Portal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {portals.map((p, i) => (
          <motion.button
            key={p.title}
            onClick={() => navigate(p.path)}
            className="group text-left rounded-2xl p-6 transition-all duration-300 cursor-pointer"
            style={{
              background: p.gradient,
              border: `1.5px solid ${p.border}`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.45)" }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="text-3xl mb-4">{p.icon}</div>
            <h3 className="text-white font-bold text-base mb-1">{p.title}</h3>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.50)" }}>
              {p.subtitle}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(232,184,75,0.15)", color: "#E8B84B", border: "1px solid rgba(232,184,75,0.25)" }}>
                {p.role}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                style={{ background: "rgba(255,255,255,0.10)" }}>
                <FiArrowRight size={14} color="#fff" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        className="mt-10 text-xs text-center"
        style={{ color: "rgba(255,255,255,0.30)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Authorised personnel only · Federal Democratic Republic of Ethiopia
      </motion.p>
    </div>
  );
}
