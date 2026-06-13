import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useT } from "../../hooks/useT";
import {
  FiMail, FiPhone, FiMapPin, FiGlobe,
  FiTwitter, FiFacebook, FiLinkedin, FiYoutube,
  FiShield, FiExternalLink, FiArrowRight,
  FiMessageCircle,
} from "react-icons/fi";

const T = {
  navy:      "#0B2A4A",
  navyDark:  "#071E35",
  navyLight: "#1C3F65",
  gold:      "#C8961E",
  goldLight: "#E8B84B",
};

export default function Footer() {
  const t    = useT();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: T.navyDark, position: "relative", overflow: "hidden" }}>

      {/* Subtle radial background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 10% 50%, rgba(200,150,30,0.04) 0%, transparent 60%), radial-gradient(ellipse at 90% 20%, rgba(28,63,101,0.20) 0%, transparent 55%)",
      }} />

      {/* Top gold accent */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}, ${T.goldLight}, ${T.gold}, transparent)` }} />

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-14 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">

          {/* ── BRAND (spans 4 cols) ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden flex-shrink-0"
                style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.10)", padding:"6px" }}>
                <img src="/ministry-logo.png" alt="MINT" className="h-9 w-auto object-contain" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">
                  MINT <span style={{ color: T.goldLight }}>Navigator</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.30)" }}>
                  {t("digital_portal")}
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.40)", maxWidth:320 }}>
              {t("footer_about")}
            </p>

            {/* Leave feedback CTA */}
            

            {/* Social links */}
            <div className="flex gap-2 pt-1">
              {[
                { icon:<FiTwitter  size={14}/>, href:"https://twitter.com",   label:"Twitter"  },
                { icon:<FiFacebook size={14}/>, href:"https://facebook.com",  label:"Facebook" },
                { icon:<FiLinkedin size={14}/>, href:"https://linkedin.com",  label:"LinkedIn" },
                { icon:<FiYoutube  size={14}/>, href:"https://youtube.com",   label:"YouTube"  },
              ].map(s => (
                <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.40)" }}
                  whileHover={{ scale: 1.10, y: -1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; e.currentTarget.style.borderColor = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.40)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* ── QUICK NAV (2 cols) ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase mb-5 tracking-widest" style={{ color: T.goldLight, letterSpacing:"0.16em" }}>
              {t("quick_nav")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: t("nav_home"),     path:"/" },
                { name: t("nav_sectors"),  path:"/sectors" },
                { name: t("nav_feedback"), path:"/feedback" },
              ].map(item => (
                <li key={item.path}>
                  <Link to={item.path}
                    className="flex items-center gap-2 text-sm transition-all group"
                    style={{ color:"rgba(255,255,255,0.40)", textDecoration:"none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0 transition-all" style={{ background: T.gold, opacity: 0.50 }} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RESOURCES (2 cols) ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase mb-5 tracking-widest" style={{ color: T.goldLight, letterSpacing:"0.16em" }}>
              {t("resources")}
            </h4>
            <ul className="space-y-2.5">
              {[t("help_desk"), t("privacy"), t("terms"), t("accessibility")].map(item => (
                <li key={item}>
                  <a href="#"
                    className="flex items-center gap-2 text-sm transition-all"
                    style={{ color:"rgba(255,255,255,0.40)", textDecoration:"none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background:"rgba(255,255,255,0.22)" }} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CONTACT (4 cols) ── */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-black uppercase mb-5 tracking-widest" style={{ color: T.goldLight, letterSpacing:"0.16em" }}>
              {t("contact_us")}
            </h4>
            <div className="rounded-2xl p-5 space-y-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              {[
                { icon:<FiMapPin size={13}/>, text: t("address"),          href: null },
                { icon:<FiPhone  size={13}/>, text: "+251 11 126 5737",    href: "tel:+251111265737" },
                { icon:<FiMail   size={13}/>, text: "contact@mint.gov.et", href: "mailto:contact@mint.gov.et" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background:"rgba(200,150,30,0.10)", color: T.gold }}>
                    {c.icon}
                  </div>
                  {c.href ? (
                    <a href={c.href} className="text-sm transition-colors"
                      style={{ color:"rgba(255,255,255,0.50)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.50)")}>
                      {c.text}
                    </a>
                  ) : (
                    <span className="text-sm" style={{ color:"rgba(255,255,255,0.50)" }}>{c.text}</span>
                  )}
                </div>
              ))}

              <div className="pt-2 border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
                <a href="http://www.mint.gov.et" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold transition-all group"
                  style={{ color: T.goldLight }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  <FiGlobe size={11} />
                  www.mint.gov.et
                  <FiExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height:"1px", background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", marginBottom:"1.5rem" }} />

        {/* ── BOTTOM BAR ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs order-2 md:order-1 text-center md:text-left"
            style={{ color:"rgba(255,255,255,0.22)", letterSpacing:"0.03em" }}>
            © {year} {t("ministry_full")}. {t("all_rights")}
          </p>

          {/* Secure badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl order-1 md:order-2"
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <FiShield size={12} style={{ color: T.gold }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.25)", letterSpacing:"0.12em" }}>
              {t("secure_portal")}
            </span>
          </div>

          {/* Ethiopian flag colors */}
          <div className="flex items-center gap-1.5 order-3">
            {["#078930", "#FCDD09", "#EF2118"].map((c, i) => (
              <div key={i} className="rounded-sm" style={{ width:18, height:6, background:c, opacity:0.70 }} />
            ))}
            <span className="ml-1 text-xs" style={{ color:"rgba(255,255,255,0.20)", letterSpacing:"0.06em" }}>🇪🇹</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
