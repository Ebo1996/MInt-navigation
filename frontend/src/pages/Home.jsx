import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import { sectorService } from "../services/sectorService";
import { departmentService } from "../services/departmentService";
import { getSectorImage } from "../data/imageMap";
import { useT } from "../hooks/useT";
import { useLanguage } from "../hooks/useLanguage";
import {
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiGrid,
  FiBell,
  FiChevronRight,
  FiX,
  FiMessageSquare,
  FiNavigation,
  FiInfo,
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/* ── Announcement type icon helper ── */
const typeIcon = (type) =>
  ({
    info: "INFO",
    warning: "WARN",
    urgent: "URGENT",
    event: "EVENT",
    maintenance: "MAINT",
  })[type] ?? "NOTICE";

/* ── Design tokens ── */
const T = {
  navy: "#007687",
  navyDark: "#005e6e",
  navyMid: "#006d7d",
  navyLight: "#008fa2",
  gold: "#C8961E",
  goldLight: "#E8B84B",
  surface: "#F0F7F6",
  card: "#FFFFFF",
  border: "#C8E6E4",
  text: "#0d3533",
  textSub: "#3a5f5d",
  textMuted: "#6a9c99",
};

/* ── 4 cinematic hero slides ── */
const HERO_SLIDES = [
  {
    bg: "http://www.mint.gov.et/documents/d/guest/1-38-jpg?imagePreview=1",
    slideKey: "nav",
  },
  {
    bg: "http://www.mint.gov.et/documents/d/guest/wic-jpg?imagePreview=1",
    slideKey: "sectors",
  },
  {
    bg: "http://www.mint.gov.et/documents/d/guest/iac-picture-jpg?imagePreview=1",
    slideKey: "feedback",
  },
  {
    bg: "http://www.mint.gov.et/documents/20117/0/1+%2820%29.jpg/6210604d-b36e-5d04-3483-137fa7f256c5?version=1.0&t=1737979615080&imagePreview=1",
    slideKey: "about",
  },
  {
    bg: "http://www.mint.gov.et/documents/d/guest/bel3-1-jpg?imagePreview=1",
    slideKey: "bel3",
  },
];
const SLIDE_MS = 5000;

/* ── Announcement priority colours ── */
const priorityStyle = (p) =>
  ({
    urgent: { bg: "#FEF3C7", color: "#78350F", border: "#F59E0B" },
    high: { bg: "#FEF9EE", color: "#92400E", border: "#FCD34D" },
    medium: { bg: "#FFF8E6", color: "#6B4400", border: "#F0C040" },
  })[p] ?? { bg: "#FFF8E6", color: "#6B4400", border: "#F0C040" };

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnounce, setShowAnnounce] = useState(true);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDepts: 0,
    totalSectors: 0,
    avgRating: 4.7,
  });

  const [slideIndex, setSlideIndex] = useState(0);
  const sliderControlRef = useRef(null);
  const t = useT();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const sectorName = (s) => s.name?.[language] || s.name?.en || s.name || "";
  const sectorDesc = (s) =>
    s.description?.[language] || s.description?.en || s.description || "";

  /* ── fetch data ── */
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [sectorsData, departments] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);
        if (cancelled) return;
        setSectors(sectorsData || []);
        let avgRating = 0;
        try {
          const fb = await API.get("/feedback/stats");
          avgRating = parseFloat(fb.data?.average || 0);
        } catch (_) {}
        if (!cancelled)
          setStats({
            totalDepts: departments?.length || 0,
            totalSectors: sectorsData?.length || 0,
            avgRating,
          });
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setSectors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await API.get("/announcements?active=true");
        const data = res.data.data || res.data || [];
        const now = new Date();
        setAnnouncements(
          data
            .filter(
              (a) => a.isActive && (!a.endDate || new Date(a.endDate) >= now),
            )
            .slice(0, 3),
        );
      } catch (_) {
        setAnnouncements([]);
      }
    };

    fetchData();
    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── slideshow ── */
  useEffect(() => {
    let alive = true;
    let timer = null;

    const runSlide = (idx) => {
      if (!alive) return;
      setSlideIndex(idx);
      timer = setTimeout(() => {
        if (!alive) return;
        runSlide((idx + 1) % HERO_SLIDES.length);
      }, SLIDE_MS);
    };

    sliderControlRef.current = (idx) => {
      clearTimeout(timer);
      runSlide(idx);
    };

    runSlide(0);

    return () => {
      alive = false;
      clearTimeout(timer);
      sliderControlRef.current = null;
    };
  }, []);

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: T.surface }}>
        {/* Announcement bar */}
        <AnimatePresence>
          {showAnnounce && announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
              style={{
                background: "#FFF8E6",
                borderBottom: "2px solid #E8A800",
                padding: "9px 0",
              }}
            >
              <div className="max-w-6xl mx-auto px-4">
                <div
                  className="flex items-center gap-3 overflow-x-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0 text-xs font-extrabold uppercase"
                    style={{
                      background: "#E8A800",
                      color: "#5A3A00",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <FiBell size={12} /> {t("notice")}
                  </div>
                  {announcements.map((a) => {
                    const s = priorityStyle(a.priority);
                    return (
                      <div
                        key={a._id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{
                          background: s.bg,
                          color: s.color,
                          border: `1.5px solid ${s.border}`,
                        }}
                      >
                        <span>{typeIcon(a.type)}</span>
                        <span className="font-bold">{a.title}</span>
                        <span
                          className="hidden sm:inline"
                          style={{ color: "#7A5800" }}
                        >
                          ·
                        </span>
                        <span
                          className="hidden sm:inline truncate max-w-xs"
                          style={{ color: "#7A5800" }}
                        >
                          {a.message}
                        </span>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setShowAnnounce(false)}
                    className="ml-auto flex-shrink-0 p-1 rounded-full hover:opacity-60"
                    style={{
                      color: "#A07030",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Dismiss"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div
          className="relative overflow-hidden"
          style={{ minHeight: "100vh", maxHeight: "100vh" }}
        >
          {/* Background photos */}
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.bg}
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: `url('${slide.bg}')`,
                opacity: slideIndex === i ? 1 : 0,
                transform: slideIndex === i ? "scale(1.0)" : "scale(1.08)",
                transition:
                  "opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 5s linear",
                willChange: "opacity, transform",
              }}
            />
          ))}

          {/* Overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(170deg, rgba(0,60,70,0.55) 0%, rgba(0,78,90,0.45) 50%, rgba(0,60,70,0.58) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(200,150,30,0.06) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.018,
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)",
            }}
          />

          {/* Content */}
          <div
            className="relative z-10 h-full flex flex-col"
            style={{ minHeight: "100vh" }}
          >
            <div className="hidden md:block" style={{ height: 40 }} />
            <div className="block md:hidden" style={{ height: 70 }} />

            <div className="flex-1 flex items-center">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* ===== LEFT — STATIC ACROSS ALL SLIDES ===== */}
                  <div>
                    <div
                      className="text-xs font-black uppercase mb-3 md:mb-4 tracking-widest"
                      style={{ color: "#E8B84B", letterSpacing: "0.22em" }}
                    >
                      MINT NAVIGATOR
                    </div>
                    <h1
                      className="font-black leading-none mb-1 md:mb-2 uppercase"
                      style={{
                        fontSize: "clamp(2rem, 8vw, 5.5rem)",
                        color: "#FFFFFF",
                        letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                        lineHeight: 1.0,
                      }}
                    >
                      {t("hero_where")}
                    </h1>
                    <h1
                      className="font-black leading-none mb-1 md:mb-2 uppercase"
                      style={{
                        fontSize: "clamp(2rem, 8vw, 5.5rem)",
                        color: "#E8B84B",
                        letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(200,150,30,0.50)",
                        lineHeight: 1.0,
                      }}
                    >
                      {t("hero_would_you")}
                    </h1>
                    <h1
                      className="font-black leading-none mb-4 md:mb-6 uppercase"
                      style={{
                        fontSize: "clamp(2rem, 8vw, 5.5rem)",
                        color: "#FFFFFF",
                        letterSpacing: "-0.02em",
                        textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                        lineHeight: 1.0,
                      }}
                    >
                      {t("hero_like_to_go")}
                    </h1>

                    <div
                      className="w-16 h-1 rounded-full mb-4 md:mb-5"
                      style={{
                        background:
                          "linear-gradient(90deg, #E8B84B, transparent)",
                      }}
                    />

                    <p
                      className="text-sm md:text-base font-medium mb-6 md:mb-8 leading-relaxed"
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        maxWidth: 440,
                      }}
                    >
                      {t("hero_sub")}
                    </p>

                    {/* Buttons row */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      {/* Buttons group */}
                      <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                        <Link to="/sectors" style={{ textDecoration: "none" }}>
                          <div
                            className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-black uppercase text-xs md:text-sm"
                            style={{
                              background: "#E8B84B",
                              color: "#071E35",
                              letterSpacing: "0.10em",
                              cursor: "pointer",
                            }}
                          >
                            <FiNavigation size={14} />
                            {language === "am"
                              ? "ዘርፎችን ያሰሱ"
                              : "EXPLORE SECTORS"}
                          </div>
                        </Link>

                        {/* ── FEEDBACK button — static ── */}
                        <Link to="/feedback" style={{ textDecoration: "none" }}>
                          <div
                            className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-3.5 font-black uppercase text-xs md:text-sm"
                            style={{
                              background: "rgba(255,255,255,0.10)",
                              color: "#fff",
                              border: "2.5px solid #E8B84B",
                              letterSpacing: "0.10em",
                              backdropFilter: "blur(8px)",
                              cursor: "pointer",
                              borderRadius: "0.75rem",
                            }}
                          >
                            <FiMessageSquare size={15} />
                            {t("hero_feedback_btn")}
                          </div>
                        </Link>
                      </div>


                    </div>
                  </div>

                  {/* ===== RIGHT — hidden on mobile, visible on lg+ ===== */}
                  <div className="hidden lg:block" style={{ minHeight: 460, position: "relative" }}>
                    <AnimatePresence mode="wait">
                      {/* RIGHT 1: HOW TO NAVIGATE */}
                      {slideIndex === 0 && (
                        <motion.div
                          key="right-how-to"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          {/* header */}
                          <div className="mb-5">
                            <div
                              className="text-xs font-black uppercase mb-1"
                              style={{ color: "#E8B84B", letterSpacing: "0.22em" }}
                            >
                              {t("how_to_nav")}
                            </div>
                            <h2
                              className="font-black uppercase"
                              style={{
                                fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
                                color: "#FFFFFF",
                                textShadow: "0 4px 32px rgba(0,0,0,0.60)",
                                lineHeight: 1.1,
                              }}
                            >
                              {t("three_steps")}
                            </h2>
                          </div>

                          {/* steps */}
                          <div className="flex flex-col gap-3">
                            {[
                              {
                                num: "1",
                                icon: <FiGrid size={16} />,
                                title: t("step1_title"),
                                desc: t("step1_desc"),
                                highlight: true,
                              },
                              {
                                num: "2",
                                icon: <FiInfo size={16} />,
                                title: t("step2_title"),
                                desc: t("step2_desc"),
                                highlight: false,
                              },
                              {
                                num: "3",
                                icon: <FiMapPin size={16} />,
                                title: t("step3_title"),
                                desc: t("step3_desc"),
                                highlight: false,
                              },
                            ].map((step, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.13, duration: 0.4 }}
                                className="flex items-start gap-4 p-4 rounded-2xl"
                                style={{
                                  background: step.highlight
                                    ? "rgba(232,184,75,0.14)"
                                    : "rgba(255,255,255,0.06)",
                                  border: step.highlight
                                    ? "1.5px solid rgba(232,184,75,0.55)"
                                    : "1px solid rgba(255,255,255,0.09)",
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                {/* circle number */}
                                <div
                                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                                  style={{
                                    background: step.highlight ? "#E8B84B" : "rgba(232,184,75,0.18)",
                                    color: step.highlight ? "#071E35" : "#E8B84B",
                                    border: "2px solid rgba(232,184,75,0.60)",
                                  }}
                                >
                                  {step.num}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span style={{ color: "#E8B84B" }}>{step.icon}</span>
                                    <span className="font-black text-white text-sm">
                                      {step.title}
                                    </span>
                                  </div>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: "rgba(255,255,255,0.58)" }}
                                  >
                                    {step.desc}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* tip */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.10)",
                            }}
                          >
                            <FiNavigation size={13} style={{ color: "#E8B84B", flexShrink: 0 }} />
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                              {t("nav_tip")}
                              <span style={{ color: "#E8B84B", fontWeight: 700 }}>
                                {t("nav_tip_link")}
                              </span>
                              {t("nav_tip_end")}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* RIGHT 2: SECTOR DIRECTORY */}
                      {slideIndex === 1 && (
                        <motion.div
                          key="right-sectors"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <div className="mb-5">
                            <div
                              className="text-xs font-black uppercase mb-2"
                              style={{
                                color: "#E8B84B",
                                letterSpacing: "0.22em",
                              }}
                            >
                              {t("our_sectors")}
                            </div>
                            <h2
                              className="font-black uppercase mb-2"
                              style={{
                                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                                color: "#FFFFFF",
                                textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                                lineHeight: 1.05,
                              }}
                            >
                              {language === "am"
                                ? "ሁሉንም ዘርፎች ያሰሱ"
                                : t("explore_sectors_btn")}
                            </h2>
                            <p
                              className="text-sm font-medium"
                              style={{ color: "rgba(255,255,255,0.70)" }}
                            >
                              {language === "am"
                                ? "8 ዘርፎች በ2 ህንፃዎች ውስጥ"
                                : t("sectors_across")}
                            </p>
                          </div>

                          <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(232,184,75,0.25)",
                              backdropFilter: "blur(16px)",
                            }}
                          >
                            <div
                              className="px-5 py-3 flex items-center gap-2"
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(200,150,30,0.10)",
                              }}
                            >
                              <FiGrid size={13} style={{ color: "#E8B84B" }} />
                              <span
                                className="text-xs font-black uppercase"
                                style={{
                                  color: "#E8B84B",
                                  letterSpacing: "0.14em",
                                }}
                              >
                                {language === "am"
                                  ? "ዘርፍ ማውጫ"
                                  : t("sector_dir")}
                              </span>
                            </div>
                            <div style={{ overflowY: "auto", maxHeight: 280 }}>
                              {(sectors.length > 0
                                ? sectors
                                : [
                                    {
                                      id: 1,
                                      name: {
                                        en: "Executive Leadership",
                                        am: "ሥራ አስፈጻሚ አመራር",
                                      },
                                      building: "A",
                                      departmentCount: 6,
                                    },
                                    {
                                      id: 2,
                                      name: {
                                        en: "Innovation & Technology",
                                        am: "ፈጠራ እና ቴክኖሎጂ",
                                      },
                                      building: "A",
                                      departmentCount: 6,
                                    },
                                    {
                                      id: 3,
                                      name: {
                                        en: "Finance & Administration",
                                        am: "ፋይናንስ እና አስተዳደር",
                                      },
                                      building: "A",
                                      departmentCount: 4,
                                    },
                                    {
                                      id: 4,
                                      name: {
                                        en: "Policy & Strategy",
                                        am: "ፖሊሲ እና ስትራቴጂ",
                                      },
                                      building: "A",
                                      departmentCount: 4,
                                    },
                                    {
                                      id: 5,
                                      name: {
                                        en: "HR & Competency",
                                        am: "ሰው ሃብት እና ብቃት",
                                      },
                                      building: "A",
                                      departmentCount: 4,
                                    },
                                    {
                                      id: 6,
                                      name: {
                                        en: "Operations & Services",
                                        am: "ሥራ አፈጻጸም",
                                      },
                                      building: "A/B",
                                      departmentCount: 4,
                                    },
                                    {
                                      id: 7,
                                      name: {
                                        en: "Digital & ICT",
                                        am: "ዲጂታል እና ኢሲቲ",
                                      },
                                      building: "A/B",
                                      departmentCount: 4,
                                    },
                                    {
                                      id: 8,
                                      name: {
                                        en: "Support Services",
                                        am: "ድጋፍ አገልግሎቶች",
                                      },
                                      building: "A",
                                      departmentCount: 4,
                                    },
                                  ]
                              ).map((s, i) => (
                                <Link
                                  key={s.id}
                                  to={`/sector/${s.id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <motion.div
                                    className="flex items-center justify-between px-5 py-3"
                                    style={{
                                      borderBottom:
                                        "1px solid rgba(255,255,255,0.07)",
                                      cursor: "pointer",
                                    }}
                                    whileHover={{
                                      background: "rgba(232,184,75,0.10)",
                                    }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{
                                          background: "rgba(232,184,75,0.15)",
                                          border:
                                            "1px solid rgba(232,184,75,0.25)",
                                        }}
                                      >
                                        <FiGrid
                                          size={14}
                                          style={{ color: "#E8B84B" }}
                                        />
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm text-white">
                                          {s.name?.[language] ||
                                            s.name?.en ||
                                            s.name}
                                        </div>
                                        <div
                                          className="text-xs mt-0.5"
                                          style={{
                                            color: "rgba(255,255,255,0.45)",
                                          }}
                                        >
                                          {t("bldg")}{" "}
                                          {s.building} · {s.departmentCount}{" "}
                                          {t("depts_abbr")}
                                        </div>
                                      </div>
                                    </div>
                                    <FiChevronRight
                                      size={14}
                                      style={{ color: "#E8B84B" }}
                                    />
                                  </motion.div>
                                </Link>
                              ))}
                            </div>
                          </div>

                          <Link
                            to="/sectors"
                            style={{ textDecoration: "none" }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black uppercase text-sm mt-4"
                              style={{
                                background: "#E8B84B",
                                color: "#071E35",
                                letterSpacing: "0.10em",
                              }}
                            >
                              <FiGrid size={15} />
                              {language === "am"
                                ? "ሁሉም ዘርፎች"
                                : t("view_all_sectors")}
                              <FiArrowRight size={14} />
                            </motion.div>
                          </Link>
                        </motion.div>
                      )}

                      {/* RIGHT 3: FEEDBACK */}
                      {slideIndex === 2 && (
                        <motion.div
                          key="right-feedback"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: "absolute", inset: 0 }}
                        >
                          <div
                            className="rounded-2xl p-8 h-full"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(232,184,75,0.25)",
                              backdropFilter: "blur(16px)",
                            }}
                          >
                            <div className="text-center mb-6">
                              <div
                                className="text-xs font-black uppercase mb-2"
                                style={{
                                  color: "#E8B84B",
                                  letterSpacing: "0.22em",
                                }}
                              >
                                {language === "am"
                                  ? "አስተያየት ያስፈልጋናል"
                                  : t("your_voice")}
                              </div>
                              <p
                                className="text-sm font-bold uppercase mb-4"
                                style={{
                                  color: "rgba(255,255,255,0.55)",
                                  letterSpacing: "0.14em",
                                }}
                              >
                                {language === "am"
                                  ? "ጉብኝትዎን ይገምግሙ"
                                  : t("rate_visit")}
                              </p>
                              <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FiStar
                                    key={star}
                                    size={32}
                                    style={{
                                      color: "#E8B84B",
                                      fill: "#E8B84B",
                                      filter:
                                        "drop-shadow(0 0 8px rgba(232,184,75,0.60))",
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            {[
                              {
                                text: language === "am"
                                    ? "በጣም ጥሩ አገልግሎት ነው!"
                                    : "Excellent service — responded quickly!",
                                dept: language === "am"
                                    ? "የቴክኖሎጂ ማዕከል"
                                    : "Technology Center",
                                rating: 5,
                              },
                              {
                                text: language === "am"
                                    ? "በፍጥነት ምላሽ ሰጡ።"
                                    : "Very helpful and professional staff.",
                                dept: language === "am"
                                    ? "የፈጠራ ፈንድ"
                                    : "Innovation Fund",
                                rating: 5,
                              },
                            ].map((card, i) => (
                              <div
                                key={i}
                                className="rounded-xl p-4 mb-3"
                                style={{
                                  background: "rgba(255,255,255,0.08)",
                                  border: "1px solid rgba(255,255,255,0.10)",
                                }}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm text-white font-medium leading-snug">
                                    "{card.text}"
                                  </p>
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    {[...Array(card.rating)].map((_, j) => (
                                      <FiStar
                                        key={j}
                                        size={11}
                                        style={{
                                          color: "#E8B84B",
                                          fill: "#E8B84B",
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                                    style={{
                                      background: "rgba(232,184,75,0.15)",
                                      color: "#E8B84B",
                                    }}
                                  >
                                    ✓{" "}
                                    {t("responded_badge")}
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: "rgba(255,255,255,0.40)" }}
                                  >
                                    {card.dept}
                                  </span>
                                </div>
                              </div>
                            ))}

                            <Link
                              to="/feedback"
                              style={{ textDecoration: "none" }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black uppercase text-sm mt-2"
                                style={{
                                  background: "#E8B84B",
                                  color: "#071E35",
                                  letterSpacing: "0.10em",
                                }}
                              >
                                <FiMessageSquare size={15} />
                                {t("leave_fb_btn")}
                                <FiArrowRight size={14} />
                              </motion.div>
                            </Link>
                          </div>
                        </motion.div>
                      )}

                      {/* RIGHT 4: ABOUT / MINISTER */}
                      {slideIndex === 3 && (
                        <motion.div
                          key="right-about"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: "absolute", inset: 0 }}
                          className="flex flex-col"
                        >
                          <div className="text-center mb-4">
                            <div
                              className="text-xs font-black uppercase mb-2"
                              style={{
                                color: "#E8B84B",
                                letterSpacing: "0.22em",
                              }}
                            >
                              {language === "am"
                                ? "ስለ ሚኒስቴሩ"
                                : t("about_ministry")}
                            </div>
                            <h2
                              className="font-black uppercase"
                              style={{
                                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                                color: "#FFFFFF",
                                textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                              }}
                            >
                              {language === "am"
                                ? "የኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር"
                                : t("ministry_full")}
                            </h2>
                          </div>

                          {/* Name card (left) + Image (right) side by side */}
                          <div className="flex items-center gap-4 mb-4">
                            {/* LEFT — name/title card */}
                            <div
                              className="flex-1 rounded-2xl px-5 py-5"
                              style={{
                                background: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(232,184,75,0.20)",
                                backdropFilter: "blur(12px)",
                              }}
                            >
                              <div className="font-black text-white text-lg leading-tight">
                                Dr. Belete Molla
                              </div>
                              <div
                                className="text-sm mt-1 font-medium"
                                style={{ color: "#E8B84B" }}
                              >
                                {language === "am"
                                  ? "የኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር"
                                  : "Minister of Innovation & Technology"}
                              </div>
                              <div
                                className="mt-2 text-xs font-semibold uppercase"
                                style={{
                                  color: "rgba(255,255,255,0.40)",
                                  letterSpacing: "0.12em",
                                }}
                              >
                                Federal Democratic Republic of Ethiopia
                              </div>
                            </div>

                            {/* RIGHT — minister image */}
                            <motion.div
                              animate={{
                                boxShadow: [
                                  "0 0 20px rgba(232,184,75,0.30)",
                                  "0 0 50px rgba(232,184,75,0.60)",
                                  "0 0 20px rgba(232,184,75,0.30)",
                                ],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="rounded-2xl overflow-hidden flex-shrink-0"
                              style={{
                                width: 160,
                                height: 180,
                                border: "3px solid rgba(232,184,75,0.60)",
                              }}
                            >
                              <img
                                src="http://www.mint.gov.et/documents/d/guest/bel-3-jpg?imagePreview=1"
                                alt="Dr. Belete Molla"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "center top",
                                }}
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=260&h=300&fit=crop&q=90";
                                }}
                              />
                            </motion.div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 w-full mb-4">
                            {[
                              {
                                val: stats.totalDepts || "40",
                                label: t("stat_depts"),
                              },
                              {
                                val: stats.totalSectors || "8",
                                label: t("stat_sectors"),
                              },
                              {
                                val: "2",
                                label: t("building"),
                              },
                            ].map((s, i) => (
                              <div
                                key={i}
                                className="text-center rounded-xl py-3"
                                style={{
                                  background: "rgba(255,255,255,0.07)",
                                  border: "1px solid rgba(255,255,255,0.10)",
                                }}
                              >
                                <div
                                  className="text-2xl font-black"
                                  style={{ color: "#E8B84B" }}
                                >
                                  {s.val}
                                </div>
                                <div
                                  className="text-xs mt-1 font-semibold uppercase"
                                  style={{
                                    color: "rgba(255,255,255,0.50)",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  {s.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <a
                            href="http://www.mint.gov.et"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black uppercase text-sm"
                              style={{
                                background: "rgba(255,255,255,0.10)",
                                color: "#fff",
                                border: "1.5px solid rgba(255,255,255,0.25)",
                                letterSpacing: "0.10em",
                                backdropFilter: "blur(8px)",
                              }}
                            >
                              <FiInfo size={15} />
                              {t("visit_mint")}
                            </motion.div>
                          </a>
                        </motion.div>
                      )}

                      {/* RIGHT 5: BEL3 IMAGE */}
                      {slideIndex === 4 && (
                        <motion.div
                          key="right-bel3"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.5 }}
                          style={{ position: "absolute", inset: 0 }}
                          className="flex flex-col justify-center"
                        >
                          <div className="text-center mb-5">
                            <div
                              className="text-xs font-black uppercase mb-2"
                              style={{ color: "#E8B84B", letterSpacing: "0.22em" }}
                            >
                              {t("the_ministry")}
                            </div>
                            <h2
                              className="font-black uppercase"
                              style={{
                                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                                color: "#FFFFFF",
                                textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                              }}
                            >
                              {language === "am"
                                ? "የኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር"
                                : t("ministry_full")}
                            </h2>
                          </div>

                          <motion.div
                            animate={{
                              boxShadow: [
                                "0 0 20px rgba(232,184,75,0.30)",
                                "0 0 50px rgba(232,184,75,0.60)",
                                "0 0 20px rgba(232,184,75,0.30)",
                              ],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="rounded-2xl overflow-hidden mx-auto"
                            style={{
                              width: "100%",
                              maxWidth: 360,
                              height: 240,
                              border: "3px solid rgba(232,184,75,0.60)",
                            }}
                          >
                            <img
                              src="http://www.mint.gov.et/documents/d/guest/bel3-1-jpg?imagePreview=1"
                              alt="MInT Building"
                              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                            />
                          </motion.div>

                          <Link to="/sectors" style={{ textDecoration: "none", marginTop: 20, display: "inline-block" }}>
                            <motion.div
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black uppercase text-sm"
                              style={{
                                background: "#E8B84B",
                                color: "#071E35",
                                letterSpacing: "0.10em",
                              }}
                            >
                              <FiNavigation size={15} />
                              {t("explore_sectors_btn")}
                            </motion.div>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="relative z-20 flex items-center justify-between px-8 md:px-12 pb-6">
              <div
                className="text-xs font-black"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.14em",
                }}
              >
                0{slideIndex + 1} / 0{HERO_SLIDES.length}
              </div>

              <motion.button
                onClick={() => navigate("/sectors")}
                className="flex flex-col items-center gap-1"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0px rgba(232,184,75,0.9)",
                      "0 0 0 8px rgba(232,184,75,0.35)",
                      "0 0 0 18px rgba(232,184,75,0.0)",
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeOut",
                  }}
                  style={{
                    borderRadius: "50%",
                    border: "4px solid #E8B84B",
                    outline: "3px solid rgba(232,184,75,0.5)",
                    outlineOffset: "3px",
                    overflow: "hidden",
                    width: 110,
                    height: 110,
                    boxShadow: "0 0 28px rgba(232,184,75,0.55)",
                  }}
                >
                  <img
                    src="https://st4.depositphotos.com/1842549/21058/i/450/depositphotos_210581260-stock-photo-start-here-icon-start-here.jpg"
                    alt="Start Here"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </motion.div>
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ fontSize: 14, lineHeight: 1, color: "#E8B84B" }}
                >
                  ▼
                </motion.span>
              </motion.button>

              <div className="flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => sliderControlRef.current?.(i)}
                    aria-label={`Slide ${i + 1}`}
                    style={{
                      width: slideIndex === i ? 32 : 8,
                      height: 8,
                      borderRadius: slideIndex === i ? 4 : "50%",
                      background:
                        slideIndex === i ? "#E8B84B" : "rgba(255,255,255,0.30)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.35s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            key={slideIndex}
            className="absolute bottom-0 left-0 z-20"
            style={{
              height: 3,
              background: "linear-gradient(90deg, #C8961E, #E8B84B)",
              animation: `slideProgress ${SLIDE_MS}ms linear forwards`,
            }}
          />
          <style>{`@keyframes slideProgress { from { width: 0% } to { width: 100% } }`}</style>
        </div>

        {/* SECTORS GRID */}
        <main
          id="sectors"
          className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20"
        >
          <motion.div
            className="flex items-end justify-between mb-10"
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                style={{
                  background: "rgba(11,42,74,0.07)",
                  color: T.navyLight,
                  border: "1px solid rgba(11,42,74,0.12)",
                  letterSpacing: "0.10em",
                }}
              >
                <FiGrid size={11} /> {t("browse_sector")}
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: T.text }}
              >
                {t("ministry_sectors")}
              </h2>
              <p className="text-sm mt-1" style={{ color: T.textSub }}>
                {t("sectors_sub")}
              </p>
            </div>
            <span
              className="hidden sm:block text-xs font-bold px-4 py-2 rounded-full uppercase"
              style={{
                background: T.border,
                color: T.textSub,
                letterSpacing: "0.09em",
              }}
            >
              {sectors.length}{" "}
              {sectors.length === 1
                ? t("sector_count_one")
                : t("sector_count_many")}
            </span>
          </motion.div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${sectors.length === 3 ? "lg:grid-cols-3" : sectors.length === 2 ? "lg:grid-cols-2" : sectors.length >= 4 ? "xl:grid-cols-4" : ""}`}
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      height: 420,
                    }}
                  >
                    <div style={{ height: 240, background: T.border }} />
                    <div className="p-6 flex flex-col gap-3">
                      <div
                        style={{
                          height: 16,
                          background: T.border,
                          borderRadius: 6,
                          width: "70%",
                        }}
                      />
                      <div
                        style={{
                          height: 12,
                          background: T.border,
                          borderRadius: 6,
                          width: "90%",
                        }}
                      />
                      <div
                        style={{
                          height: 12,
                          background: T.border,
                          borderRadius: 6,
                          width: "60%",
                        }}
                      />
                    </div>
                  </div>
                ))
              : sectors.map((sector) => (
                  <motion.div
                    key={sector.id}
                    className="flex"
                    whileHover={{ y: -6, transition: { duration: 0.22 } }}
                  >
                    <Link
                      to={`/sector/${sector.id}`}
                      className="group flex flex-col rounded-2xl overflow-hidden w-full"
                      style={{
                        background: T.card,
                        border: `1px solid ${T.border}`,
                        boxShadow: "0 2px 12px rgba(11,42,74,0.07)",
                        transition: "box-shadow .25s, border-color .25s",
                        textDecoration: "none",
                        cursor: "pointer",
                        display: "flex",
                        minHeight: 440,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 24px 56px rgba(11,42,74,0.18)";
                        e.currentTarget.style.borderColor = T.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 12px rgba(11,42,74,0.07)";
                        e.currentTarget.style.borderColor = T.border;
                      }}
                    >
                      <div
                        className="relative overflow-hidden"
                        style={{ height: 240 }}
                      >
                        <img
                          src={getSectorImage(sector)}
                          alt={sectorName(sector)}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,94,110,0.72) 0%, transparent 55%)",
                          }}
                        />
                        <span
                          className="absolute top-3 left-3 text-xs font-bold text-white px-3 py-1.5 rounded-lg"
                          style={{
                            background: T.navy,
                            border: "1px solid rgba(255,255,255,0.16)",
                          }}
                        >
                          {t("bldg")} {sector.building}
                        </span>
                        <span
                          className="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: T.gold, color: T.navyDark }}
                        >
                          {sector.departmentCount || 0} {t("desks") || "desks"}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3
                          className="font-extrabold text-lg leading-snug mb-3"
                          style={{ color: T.text }}
                        >
                          {sectorName(sector)}
                        </h3>
                        <p
                          className="text-sm font-medium leading-relaxed flex-1"
                          style={{ color: T.textSub }}
                        >
                          {sectorDesc(sector).substring(0, 120)}
                        </p>
                        <div
                          className="flex items-center justify-between pt-4 mt-4"
                          style={{ borderTop: `1px solid ${T.border}` }}
                        >
                          <div
                            className="flex items-center gap-1.5 text-sm font-bold"
                            style={{ color: T.text }}
                          >
                            <FiMapPin size={13} style={{ color: T.gold }} />{" "}
                            {t("building")} {sector.building}
                          </div>
                          <div
                            className="flex items-center gap-1.5 text-sm font-bold"
                            style={{ color: T.gold }}
                          >
                            <FiStar size={13} style={{ fill: T.gold }} />{" "}
                            {sector.avgRating
                              ? sector.avgRating.toFixed(1)
                              : "—"}
                          </div>
                        </div>
                        <div
                          className="flex items-center justify-between mt-4 px-5 py-3.5 rounded-xl transition-all"
                          style={{
                            background: "rgba(0,118,135,0.10)",
                            border: `1px solid rgba(0,118,135,0.22)`,
                          }}
                        >
                          <span
                            className="text-sm font-bold uppercase"
                            style={{ color: T.navy, letterSpacing: "0.12em" }}
                          >
                            {t("view_details")}
                          </span>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: T.navy }}
                          >
                            <FiArrowRight size={14} color="#fff" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </main>

        {/* QUICK ACTIONS */}
        <motion.div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: T.border }} />
            <span
              className="text-xs font-bold uppercase"
              style={{ color: T.textMuted, letterSpacing: "0.13em" }}
            >
              {t("quick_actions")}
            </span>
            <div className="flex-1 h-px" style={{ background: T.border }} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white"
                style={{ background: T.navy, textDecoration: "none" }}
              >
                <FiStar size={14} /> {t("leave_feedback")}{" "}
                <FiChevronRight size={13} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
