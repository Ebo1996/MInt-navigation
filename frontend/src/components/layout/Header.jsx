import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiGlobe,
  FiChevronDown,
  FiHome,
  FiCompass,
  FiMessageCircle,
} from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";
import { useT } from "../../hooks/useT";

const T = {
  navy: "#086976",
  navyDark: "#086976",
  navyLight: "#0a8494",
  gold: "#C8961E",
  goldLight: "#E8B84B",
};

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "am", label: "Amharic", native: "አማርኛ", flag: "🇪🇹" },
];

const NAV_ITEMS = [
  {
    key: "home",
    to: "/",
    labelKey: "nav_home",
    Icon: FiHome,
    isActive: ({ pathname }) => pathname === "/",
  },
  {
    key: "sectors",
    to: "/sectors",
    labelKey: "nav_sectors",
    Icon: FiCompass,
    isActive: ({ pathname }) =>
      pathname === "/sectors" || pathname.startsWith("/sector/"),
  },
  {
    key: "feedback",
    to: "/feedback",
    labelKey: "nav_feedback",
    Icon: FiMessageCircle,
    isActive: ({ pathname }) => pathname === "/feedback",
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const t = useT();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentLang =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header
      className="sticky top-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled ? `rgba(8,105,118,0.97)` : T.navyDark,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 4px 40px rgba(8,105,118,0.55)" : "none",
      }}
    >
      {/* Top gold accent line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${T.gold}, ${T.goldLight}, ${T.gold}, transparent)`,
        }}
      />

      {/* Utility strip — desktop only */}
      <div
        className="hidden lg:block"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-1.5">
          <p
            className="text-xs tracking-wide"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            {t("gov_title")}
          </p>
          <a
            href="http://www.mint.gov.et"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium transition-all group"
            style={{ color: "rgba(255,255,255,0.40)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.goldLight)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.40)")
            }
          >
            <FiGlobe size={10} />
            www.mint.gov.et
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-6">
          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div
              className="flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "5px",
              }}
            >
              <img
                src="/ministry-logo.png"
                alt="MINT"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                MINT <span style={{ color: T.goldLight }}>Navigator</span>
              </div>
              <div
                className="text-xs hidden sm:block mt-0.5"
                style={{
                  color: "rgba(255,255,255,0.32)",
                  letterSpacing: "0.03em",
                }}
              >
                {t("logo_subtitle")}
              </div>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ key, to, labelKey, Icon, isActive }) => {
              const active = isActive(location);
              return (
                <Link
                  key={key}
                  to={to}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                  style={{
                    color: active ? "#fff" : "rgba(255,255,255,0.52)",
                    background: active
                      ? "rgba(255,255,255,0.07)"
                      : "transparent",
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.52)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon size={13} />
                  {t(labelKey)}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: T.goldLight }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT SIDE ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen((o) => !o)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${isLangOpen ? T.goldLight : "rgba(255,255,255,0.18)"}`,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  minWidth: 110,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = T.goldLight)
                }
                onMouseLeave={(e) => {
                  if (!isLangOpen)
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="flex-1 text-left">{currentLang.native}</span>
                <motion.span
                  animate={{ rotate: isLangOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={13} style={{ color: T.goldLight }} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLangOpen(false)}
                    />
                    <motion.div
                      className="absolute right-0 mt-1.5 w-44 rounded-xl overflow-hidden z-20"
                      style={{
                        background: T.navyDark,
                        border: `1.5px solid rgba(232,184,75,0.35)`,
                        boxShadow: "0 16px 48px rgba(8,105,118,0.70)",
                      }}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      {LANGUAGES.map((lang, i) => {
                        const isSelected = language === lang.code;
                        return (
                          <motion.button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setIsLangOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                            style={{
                              color: isSelected ? T.navyDark : "rgba(255,255,255,0.75)",
                              background: isSelected ? T.goldLight : "transparent",
                              borderBottom: i < LANGUAGES.length - 1
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "none",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "rgba(232,184,75,0.12)";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "transparent";
                            }}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <span className="text-base leading-none">{lang.flag}</span>
                            <span>{lang.native}</span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.80)",
              }}
              onClick={() => setIsOpen((o) => !o)}
              aria-label={t("toggle_menu")}
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FiX size={17} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FiMenu size={17} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden pb-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
            >
              <nav className="flex flex-col gap-1 pt-3">
                {NAV_ITEMS.map(({ key, to, labelKey, Icon, isActive }, i) => {
                  const active = isActive(location);
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={to}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase transition-all"
                        style={{
                          color: active ? "#fff" : "rgba(255,255,255,0.55)",
                          background: active
                            ? "rgba(200,150,30,0.10)"
                            : "transparent",
                          borderLeft: active
                            ? `3px solid ${T.gold}`
                            : "3px solid transparent",
                          letterSpacing: "0.09em",
                        }}
                      >
                        <Icon size={15} />
                        {t(labelKey)}
                      </Link>
                    </motion.div>
                  );
                })}
                {/* Mobile language switcher */}
                <div
                  className="flex gap-2 px-4 pt-2 border-t mt-2"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold flex-1 justify-center"
                      style={{
                        background:
                          language === lang.code
                            ? "rgba(200,150,30,0.15)"
                            : "rgba(255,255,255,0.05)",
                        border: `1px solid ${language === lang.code ? T.gold : "rgba(255,255,255,0.08)"}`,
                        color:
                          language === lang.code
                            ? T.goldLight
                            : "rgba(255,255,255,0.55)",
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.native}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
