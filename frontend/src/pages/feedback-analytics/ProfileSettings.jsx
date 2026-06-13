import { useState, useEffect } from "react";
import { FiSave, FiUser, FiMail, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";

const T = {
  navy: "#0B2A4A", navyDark: "#071E35", navyLight: "#1C3F65",
  gold: "#C8961E", goldLight: "#E8B84B",
  surface: "#F0F4FA", card: "#FFFFFF", border: "#D8E2EF",
  text: "#0B2A4A", textSub: "#4A5568", textMuted: "#8896A6",
};

export default function ProfileSettings() {
  const [user, setUser]       = useState(null);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("adminUser") || "null");
      setUser(u);
      setName(u?.name || "");
      setEmail(u?.email || "");
    } catch(_) {}
  }, []);

  const save = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = { ...user, name, email };
      localStorage.setItem("adminUser", JSON.stringify(updated));
      setUser(updated);
      setTimeout(() => {
        toast.success("Profile updated successfully");
        setLoading(false);
      }, 600);
    } catch(_) {
      toast.error("Failed to save profile");
      setLoading(false);
    }
  };

  const initials = (n) => n ? n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "M";

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black" style={{ color: T.navy }}>Profile Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: T.textMuted }}>Manage your General Feedback Manager account</p>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, border:`1px solid rgba(255,255,255,0.06)` }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight})`, color: T.navyDark }}>
          {initials(name)}
        </div>
        <div>
          <div className="text-lg font-black text-white">{name || "Manager"}</div>
          <div className="text-sm mt-0.5" style={{ color: T.goldLight }}>General Feedback Manager</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{email || "—"}</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={save} className="rounded-2xl p-5 space-y-4"
        style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(11,42,74,0.06)" }}>
        <h3 className="text-sm font-bold" style={{ color: T.navy }}>Account Information</h3>

        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>Display Name</label>
          <div className="relative">
            <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
              onFocus={e => (e.target.style.borderColor = T.gold)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>Email Address</label>
          <div className="relative">
            <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
              onFocus={e => (e.target.style.borderColor = T.gold)}
              onBlur={e => (e.target.style.borderColor = T.border)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: T.textMuted }}>Role</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(11,42,74,0.05)", border:`1px solid ${T.border}` }}>
            <FiShield size={14} style={{ color: T.gold }} />
            <span className="text-sm font-semibold" style={{ color: T.text }}>General Feedback Manager</span>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: T.navy, color: T.goldLight }}
            onMouseEnter={e => (e.currentTarget.style.background = T.navyLight)}
            onMouseLeave={e => (e.currentTarget.style.background = T.navy)}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:`${T.goldLight} transparent`}} /> Saving…</>
              : <><FiSave size={14}/> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
