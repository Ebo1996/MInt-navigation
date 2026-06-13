import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { searchDepartments, departmentsData } from "../data/departmentsData";
import { getFloorLabel } from "../utils/floorLabels";
import { sectorService } from "../services/sectorService";
import { departmentService } from "../services/departmentService";
import { getSectorImage } from "../data/imageMap";
import { useT } from "../hooks/useT";
import { useLanguage } from "../hooks/useLanguage";
import {
  FiSearch, FiMapPin, FiStar, FiArrowRight,
  FiGrid, FiBell, FiChevronRight, FiX,
  FiMessageSquare, FiNavigation, FiInfo,
} from "react-icons/fi";
import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

/* ── Announcement type icon helper ── */
const typeIcon = (type) => ({
  info:       "ℹ️",
  warning:    "⚠️",
  urgent:     "🚨",
  event:      "📅",
  maintenance:"🔧",
}[type] ?? "📢");

/* ── Design tokens ── */
const T = {
  navy:     "#0B2A4A",
  navyDark: "#071E35",
  navyMid:  "#14304F",
  navyLight:"#1C3F65",
  gold:     "#C8961E",
  goldLight:"#E8B84B",
  surface:  "#F0F4FA",
  card:     "#FFFFFF",
  border:   "#D8E2EF",
  text:     "#0B2A4A",
  textSub:  "#4A5568",
  textMuted:"#8896A6",
};

/* ── 4 cinematic hero slides — each with its own MiNT photo ── */
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
];
const SLIDE_MS = 5000;

/* ── Announcement priority colours (bright, visible on light bg) ── */
const priorityStyle = (p) => ({
  urgent: { bg: "#FEF3C7", color: "#78350F", border: "#F59E0B" },
  high:   { bg: "#FEF9EE", color: "#92400E", border: "#FCD34D" },
  medium: { bg: "#FFF8E6", color: "#6B4400", border: "#F0C040" },
}[p] ?? { bg: "#FFF8E6", color: "#6B4400", border: "#F0C040" });




const Home = () => {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults,   setShowResults]   = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnounce,  setShowAnnounce]  = useState(true);
  const [sectors,       setSectors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState({ totalDepts:0, totalSectors:0, avgRating:4.7 });

  /* slideshow */
  const [slideIndex,    setSlideIndex]    = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const slideTimer  = useRef(null);
  const progressRef = useRef(null);
  const searchRef   = useRef(null);
  const t = useT();
  const { language } = useLanguage();
  const sectorName = (s) => s.name?.[language] || s.name?.en || s.name || "";
  const sectorDesc = (s) => s.description?.[language] || s.description?.en || s.description || "";

  /* ── fetch data ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sectorsData, departments] = await Promise.all([
          sectorService.getPublicSectors(),
          departmentService.getAll(),
        ]);
        if (cancelled) return;
        setSectors(sectorsData || []);
        let avgRating = 0;
        try { const fb = await API.get("/feedback/stats"); avgRating = parseFloat(fb.data?.average || 0); } catch(_){}
        if (!cancelled) setStats({ totalDepts: departments?.length||0, totalSectors: sectorsData?.length||0, avgRating });
      } catch(err) { if (!cancelled) { console.error(err); setSectors([]); } }
      finally { if (!cancelled) setLoading(false); }
    })();
    fetchAnnouncements(/* cancelled ref handled inside */);
    return () => { cancelled = true; };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res  = await API.get("/announcements?active=true");
      const data = res.data.data || res.data || [];
      const now  = new Date();
      setAnnouncements(data.filter(a => a.isActive && (!a.endDate || new Date(a.endDate) >= now)).slice(0,3));
    } catch(_) { setAnnouncements([]); }
  };

  /* ── slideshow ── */
  const mountedRef = useRef(true);

  const startSlide = (idx) => {
    clearTimeout(slideTimer.current);
    cancelAnimationFrame(progressRef.current);
    setSlideIndex(idx);
    setSlideProgress(0);
    const t0 = performance.now();
    const tick = (now) => {
      if (!mountedRef.current) return; // stop if unmounted
      const pct = Math.min(((now - t0) / SLIDE_MS) * 100, 100);
      setSlideProgress(pct);
      if (pct < 100) progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);
    slideTimer.current = setTimeout(() => {
      if (!mountedRef.current) return; // stop if unmounted
      startSlide((idx + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);
  };

  useEffect(() => {
    mountedRef.current = true;
    startSlide(0);
    return () => {
      mountedRef.current = false;
      clearTimeout(slideTimer.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, []);

  /* ── search ── */
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchDepartments(searchQuery).slice(0, 30));
      setShowResults(true);
    }
    // Do NOT auto-show results when query is empty — that dropdown
    // renders over the whole page and blocks all clicks below it
  }, [searchQuery]);

  useEffect(() => {
    const close = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);


  return (
    <Layout>
      <div className="min-h-screen" style={{ background: T.surface }}>

        {/* ── AnnouncementBanner (time-based / emergency from component) ── */}
        <AnnouncementBanner />

        {/* ── FIX #2: Bright admin announcement bar ── */}
        <AnimatePresence>
          {showAnnounce && announcements.length > 0 && (
            <motion.div
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, height:0, overflow:"hidden" }} transition={{ duration:0.3 }}
              style={{ background:"#FFF8E6", borderBottom:"2px solid #E8A800", padding:"9px 0" }}
            >
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0 text-xs font-extrabold uppercase"
                    style={{ background:"#E8A800", color:"#5A3A00", letterSpacing:"0.08em" }}>
                    <FiBell size={12} /> {t("notice")}
                  </div>
                  {announcements.map((a) => {
                    const s = priorityStyle(a.priority);
                    return (
                      <div key={a._id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ background:s.bg, color:s.color, border:`1.5px solid ${s.border}` }}>
                        <span>{typeIcon(a.type)}</span>
                        <span className="font-bold">{a.title}</span>
                        <span className="hidden sm:inline" style={{ color:"#7A5800" }}>·</span>
                        <span className="hidden sm:inline truncate max-w-xs" style={{ color:"#7A5800" }}>{a.message}</span>
                      </div>
                    );
                  })}
                  <button onClick={() => setShowAnnounce(false)}
                    className="ml-auto flex-shrink-0 p-1 rounded-full hover:opacity-60"
                    style={{ color:"#A07030", background:"none", border:"none", cursor:"pointer" }}
                    aria-label="Dismiss">
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ════════════════════════════════════════
            CINEMATIC 4-SLIDE HERO
        ════════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ minHeight: "100vh", maxHeight: "100vh" }}>

          {/* ── Background photos — Ken-Burns zoom per slide ── */}
          {HERO_SLIDES.map((slide, i) => (
            <motion.div
              key={slide.bg}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${slide.bg}')`,
                opacity: slideIndex === i ? 1 : 0,
                transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
                willChange: "opacity",
              }}
              animate={slideIndex === i ? { scale: [1.08, 1.0] } : { scale: 1.08 }}
              transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
            />
          ))}

          {/* ── Cinematic overlays ── */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(170deg, rgba(4,12,24,0.88) 0%, rgba(7,20,38,0.78) 50%, rgba(4,12,24,0.90) 100%)",
          }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(200,150,30,0.06) 0%, transparent 65%)",
          }} />
          {/* Subtle scan lines texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            opacity: 0.018,
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)",
          }} />

          {/* ── SLIDE CONTENT ── */}
          <div className="relative z-10 h-full flex flex-col" style={{ minHeight: "100vh" }}>

            {/* spacer to push content down slightly */}
            <div style={{ height: 40 }} />

            {/* Main slide content area */}
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-7xl mx-auto px-6 md:px-10">
                <AnimatePresence mode="wait">

                  {/* ══ SLIDE 1: WAYFINDING ══ */}
                  {slideIndex === 0 && (
                    <motion.div key="slide-nav"
                      className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}>

                      {/* Left */}
                      <div>
                        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                          <div className="text-xs font-black uppercase mb-4 tracking-widest" style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>
                            MINT NAVIGATOR
                          </div>
                          <h1 className="font-black leading-none mb-2 uppercase" style={{
                            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                            color: "#FFFFFF",
                            letterSpacing: "-0.02em",
                            textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                            lineHeight: 1.0,
                          }}>
                            {language === "am" ? "ወዴት" : "WHERE"}
                          </h1>
                          <h1 className="font-black leading-none mb-2 uppercase" style={{
                            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                            color: "#E8B84B",
                            letterSpacing: "-0.02em",
                            textShadow: "0 4px 32px rgba(200,150,30,0.50)",
                            lineHeight: 1.0,
                          }}>
                            {language === "am" ? "መሄድ" : "WOULD YOU"}
                          </h1>
                          <h1 className="font-black leading-none mb-6 uppercase" style={{
                            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                            color: "#FFFFFF",
                            letterSpacing: "-0.02em",
                            textShadow: "0 4px 32px rgba(0,0,0,0.70)",
                            lineHeight: 1.0,
                          }}>
                            {language === "am" ? "ይፈልጋሉ?" : "LIKE TO GO?"}
                          </h1>

                          <div className="w-16 h-1 rounded-full mb-5" style={{ background: "linear-gradient(90deg, #E8B84B, transparent)" }} />

                          <p className="text-base font-medium mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 440 }}>
                            {language === "am"
                              ? "የኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር — ዲጂታል ናቪጌሽን ፖርታል · አዲስ አበባ"
                              : "Ministry of Innovation & Technology — Digital Navigation Portal · Addis Ababa"}
                          </p>

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-3">
                            <Link to="/sectors" style={{ textDecoration: "none" }}>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black uppercase text-sm"
                                style={{ background: "#E8B84B", color: "#071E35", letterSpacing: "0.10em" }}>
                                <FiNavigation size={15} />
                                {language === "am" ? "ዘርፎችን ያሰሱ" : "EXPLORE SECTORS"}
                              </motion.div>
                            </Link>
                            <Link to="/feedback" style={{ textDecoration: "none" }}>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black uppercase text-sm"
                                style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", letterSpacing: "0.10em", backdropFilter: "blur(8px)" }}>
                                <FiMessageSquare size={15} />
                                {language === "am" ? "አስተያየት" : "FEEDBACK"}
                              </motion.div>
                            </Link>
                          </div>
                        </motion.div>
                      </div>

                      {/* Right — search + stats */}
                      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                        {/* Search */}
                        <div ref={searchRef} className="rounded-2xl overflow-hidden mb-5"
                          style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 20px 60px rgba(0,0,0,0.40)" }}>
                          <form onSubmit={e => { e.preventDefault(); if(searchQuery.trim()) { setSearchResults(searchDepartments(searchQuery).slice(0,30)); setShowResults(true); } }}
                            className="flex items-center gap-2 px-4 py-3">
                            <FiSearch size={18} style={{ color: T.textMuted, flexShrink: 0 }} />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                              onFocus={() => { if (!searchQuery.trim()) { setSearchResults(departmentsData); } setShowResults(true); }}
                              placeholder={t("search_placeholder")}
                              className="flex-1 py-2 text-sm focus:outline-none bg-transparent font-medium"
                              style={{ color: T.text, border: "none" }} />
                            {searchQuery && (
                              <button onClick={() => { setSearchQuery(""); setSearchResults(departmentsData); setShowResults(true); }}
                                className="p-1 rounded-full" style={{ color: T.textMuted, background: "none", border: "none", cursor: "pointer" }}>
                                <FiX size={14} />
                              </button>
                            )}
                            <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-black text-white uppercase"
                              style={{ background: T.navy, border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
                              {t("search_btn")}
                            </button>
                          </form>
                          <AnimatePresence>
                            {showResults && searchResults.length > 0 && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }} style={{ borderTop: `1px solid ${T.border}` }}>
                                <div className="px-5 py-2 flex items-center justify-between" style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                                  <span className="text-xs font-bold uppercase" style={{ color: T.textMuted, letterSpacing: "0.10em" }}>
                                    {searchQuery.trim() ? `${t("results_for")} "${searchQuery}"` : t("all_departments")}
                                  </span>
                                  <span className="text-xs font-semibold" style={{ color: T.textMuted }}>{searchResults.length} {t("found")}</span>
                                </div>
                                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                  {searchResults.map((dept, i) => (
                                    <motion.div key={dept.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                      <Link to={`/department/${dept.id}`}
                                        onClick={() => { setSearchQuery(""); setShowResults(false); }}
                                        className="flex items-center justify-between px-5 py-3 transition-colors"
                                        style={{ borderBottom: `1px solid ${T.border}`, textDecoration: "none" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = T.surface)}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <div>
                                          <div className="text-sm font-semibold" style={{ color: T.text }}>{dept.name}</div>
                                          <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: T.textMuted }}>
                                            <FiMapPin size={10} />
                                            <span>{t("bldg")} {dept.building}</span><span>·</span>
                                            <span>{getFloorLabel(dept.floor)}</span>
                                          </div>
                                        </div>
                                        <FiChevronRight size={14} style={{ color: T.gold }} />
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { val: stats.totalDepts, label: language === "am" ? "ክፍሎች" : "DEPARTMENTS", icon: "🏢" },
                            { val: stats.totalSectors, label: language === "am" ? "ዘርፎች" : "SECTORS", icon: "🧭" },
                            { val: "A & B", label: language === "am" ? "ህንፃዎች" : "BUILDINGS", icon: "🏛️" },
                          ].map((s, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.05 }}
                              className="rounded-2xl p-4 text-center"
                              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)" }}>
                              <div className="text-lg mb-1">{s.icon}</div>
                              <div className="text-2xl font-black text-white">{s.val}</div>
                              <div className="text-xs font-bold mt-1 uppercase" style={{ color: "rgba(255,255,255,0.50)", letterSpacing: "0.10em" }}>{s.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ══ SLIDE 2: SECTORS ══ */}
                  {slideIndex === 1 && (
                    <motion.div key="slide-sectors"
                      className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}>

                      {/* Left */}
                      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                        <div className="text-xs font-black uppercase mb-4" style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>{language === "am" ? "ዘርፎቻችን" : "OUR SECTORS"}</div>
                        <h1 className="font-black leading-none mb-2 uppercase" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", color: "#E8B84B", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(200,150,30,0.50)", lineHeight: 1.0 }}>
                          {language === "am" ? "ዘርፎቻችንን" : "EXPLORE"}
                        </h1>
                        <h1 className="font-black leading-none mb-6 uppercase" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.0 }}>
                          {language === "am" ? "ያሰሱ" : "ALL SECTORS"}
                        </h1>
                        <div className="w-16 h-1 rounded-full mb-5" style={{ background: "linear-gradient(90deg, #E8B84B, transparent)" }} />
                        <p className="text-base font-medium mb-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 400 }}>
                          {language === "am"
                            ? "8 ዘርፎች በ2 ህንፃዎች ውስጥ · ሁሉንም ዕርዳታዎች ያግኙ"
                            : "8 sectors across 2 buildings · Find every service you need"}
                        </p>
                        <Link to="/sectors" style={{ textDecoration: "none" }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black uppercase text-sm"
                            style={{ background: "#E8B84B", color: "#071E35", letterSpacing: "0.10em" }}>
                            <FiGrid size={15} />
                            {language === "am" ? "ሁሉም ዘርፎች" : "VIEW ALL SECTORS"}
                            <FiArrowRight size={14} />
                          </motion.div>
                        </Link>
                      </motion.div>

                      {/* Right — scrolling sector list */}
                      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,184,75,0.25)", backdropFilter: "blur(16px)", maxHeight: 380 }}>
                        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)", background: "rgba(200,150,30,0.10)" }}>
                          <FiGrid size={13} style={{ color: "#E8B84B" }} />
                          <span className="text-xs font-black uppercase" style={{ color: "#E8B84B", letterSpacing: "0.14em" }}>
                            {language === "am" ? "ዘርፍ ማውጫ" : "SECTOR DIRECTORY"}
                          </span>
                        </div>
                        <div style={{ overflowY: "auto", maxHeight: 330 }}>
                          {(sectors.length > 0 ? sectors : [
                            { id:1, name:{en:"Executive Leadership",am:"ሥራ አስፈጻሚ አመራር"}, building:"A", floors:[6,7,8], departmentCount:6, icon:"🏛️" },
                            { id:2, name:{en:"Innovation & Technology",am:"ፈጠራ እና ቴክኖሎጂ"}, building:"A", floors:[1,2,3,5,6], departmentCount:6, icon:"💡" },
                            { id:3, name:{en:"Finance & Administration",am:"ፋይናንስ እና አስተዳደር"}, building:"A", floors:[2,3,4], departmentCount:4, icon:"💰" },
                            { id:4, name:{en:"Policy & Strategy",am:"ፖሊሲ እና ስትራቴጂ"}, building:"A", floors:[3,4,5], departmentCount:4, icon:"📋" },
                            { id:5, name:{en:"HR & Competency",am:"ሰው ሃብት እና ብቃት"}, building:"A", floors:[2,3,4], departmentCount:4, icon:"👥" },
                            { id:6, name:{en:"Operations & Services",am:"ሥራ አፈጻጸም"}, building:"A/B", floors:[3,1], departmentCount:4, icon:"⚙️" },
                            { id:7, name:{en:"Digital & ICT",am:"ዲጂታል እና ኢሲቲ"}, building:"A/B", floors:[1,2], departmentCount:4, icon:"🌐" },
                            { id:8, name:{en:"Support Services",am:"ድጋፍ አገልግሎቶች"}, building:"A", floors:[0,1,8], departmentCount:4, icon:"🛠️" },
                          ]).map((s, i) => (
                            <Link key={s.id} to={`/sector/${s.id}`} style={{ textDecoration: "none" }}>
                              <motion.div
                                className="flex items-center justify-between px-5 py-3.5"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
                                whileHover={{ background: "rgba(232,184,75,0.10)" }}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}>
                                <div className="flex items-center gap-3">
                                  <span style={{ fontSize: 18 }}>{s.icon || "🏢"}</span>
                                  <div>
                                    <div className="font-bold text-sm text-white">
                                      {s.name?.[language] || s.name?.en || s.name}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                      {language === "am" ? "ህንፃ" : "Bldg"} {s.building} · {s.departmentCount} {language === "am" ? "ክፍሎች" : "depts"}
                                    </div>
                                  </div>
                                </div>
                                <FiChevronRight size={14} style={{ color: "#E8B84B" }} />
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ══ SLIDE 3: FEEDBACK ══ */}
                  {slideIndex === 2 && (
                    <motion.div key="slide-feedback"
                      className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}>

                      {/* Left */}
                      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                        <div className="text-xs font-black uppercase mb-4" style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>{language === "am" ? "አስተያየት" : "FEEDBACK"}</div>
                        <h1 className="font-black leading-none mb-2 uppercase" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.0 }}>
                          {language === "am" ? "አስተያየትዎ" : "YOUR VOICE"}
                        </h1>
                        <h1 className="font-black leading-none mb-6 uppercase" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", color: "#E8B84B", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(200,150,30,0.50)", lineHeight: 1.0 }}>
                          {language === "am" ? "ያስፈልጋናል" : "MATTERS"}
                        </h1>
                        <div className="w-16 h-1 rounded-full mb-5" style={{ background: "linear-gradient(90deg, #E8B84B, transparent)" }} />
                        <p className="text-base font-medium mb-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 400 }}>
                          {language === "am"
                            ? "ለማንኛውም ክፍል ደረጃ ይስጡ። እናዳምጣለን እናሻሽላለን።"
                            : "Rate any department. We listen, respond, and improve every visit."}
                        </p>
                        <Link to="/feedback" style={{ textDecoration: "none" }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black uppercase text-sm"
                            style={{ background: "#E8B84B", color: "#071E35", letterSpacing: "0.10em" }}>
                            <FiMessageSquare size={15} />
                            {language === "am" ? "አስተያየት ይስጡ" : "LEAVE FEEDBACK"}
                            <FiArrowRight size={14} />
                          </motion.div>
                        </Link>
                      </motion.div>

                      {/* Right — animated star card */}
                      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-2xl p-8"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(232,184,75,0.25)", backdropFilter: "blur(16px)" }}>
                        <div className="text-center mb-6">
                          <p className="text-sm font-bold uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em" }}>
                            {language === "am" ? "ጉብኝትዎን ይገምግሙ" : "RATE YOUR VISIT"}
                          </p>
                          <div className="flex justify-center gap-3">
                            {[1,2,3,4,5].map(star => (
                              <motion.div key={star}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 + star * 0.15, type: "spring", stiffness: 300 }}>
                                <FiStar size={36} style={{ color: "#E8B84B", fill: "#E8B84B", filter: "drop-shadow(0 0 8px rgba(232,184,75,0.60))" }} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        {/* Sample feedback cards */}
                        {[
                          { text: language === "am" ? "በጣም ጥሩ አገልግሎት ነው!" : "Excellent service — responded quickly!", dept: language === "am" ? "የቴክኖሎጂ ማዕከል" : "Technology Center", rating: 5 },
                          { text: language === "am" ? "በፍጥነት ምላሽ ሰጡ።" : "Very helpful and professional staff.", dept: language === "am" ? "የፈጠራ ፈንድ" : "Innovation Fund", rating: 5 },
                        ].map((card, i) => (
                          <motion.div key={i}
                            className="rounded-xl p-4 mb-3"
                            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.2 }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm text-white font-medium leading-snug">"{card.text}"</p>
                              <div className="flex gap-0.5 flex-shrink-0">
                                {[...Array(card.rating)].map((_, j) => <FiStar key={j} size={11} style={{ color: "#E8B84B", fill: "#E8B84B" }} />)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(232,184,75,0.15)", color: "#E8B84B" }}>
                                ✓ {language === "am" ? "ምላሽ ተሰጥቷል" : "Responded"}
                              </span>
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{card.dept}</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ══ SLIDE 4: ABOUT + MINISTER ══ */}
                  {slideIndex === 3 && (
                    <motion.div key="slide-about"
                      className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}>

                      {/* Left */}
                      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                        <div className="text-xs font-black uppercase mb-4" style={{ color: "#E8B84B", letterSpacing: "0.22em" }}>{language === "am" ? "ስለ ሚኒስቴሩ" : "ABOUT THE MINISTRY"}</div>
                        <h1 className="font-black leading-none mb-2 uppercase" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.05 }}>
                          {language === "am" ? "የኢኖቬሽን" : "MINISTRY OF"}
                        </h1>
                        <h1 className="font-black leading-none mb-2 uppercase" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", color: "#E8B84B", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(200,150,30,0.50)", lineHeight: 1.05 }}>
                          {language === "am" ? "እና ቴክኖሎጂ" : "INNOVATION &"}
                        </h1>
                        <h1 className="font-black leading-none mb-6 uppercase" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 4px 32px rgba(0,0,0,0.70)", lineHeight: 1.05 }}>
                          {language === "am" ? "ሚኒስቴር" : "TECHNOLOGY"}
                        </h1>
                        <div className="w-16 h-1 rounded-full mb-5" style={{ background: "linear-gradient(90deg, #E8B84B, transparent)" }} />

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                          {[
                            { val: stats.totalDepts || "28", label: language === "am" ? "ክፍሎች" : "Departments" },
                            { val: stats.totalSectors || "8", label: language === "am" ? "ዘርፎች" : "Sectors" },
                            { val: "2", label: language === "am" ? "ህንፃዎች" : "Buildings" },
                          ].map((s, i) => (
                            <div key={i} className="text-center rounded-xl py-3"
                              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
                              <div className="text-2xl font-black" style={{ color: "#E8B84B" }}>{s.val}</div>
                              <div className="text-xs mt-1 font-semibold uppercase" style={{ color: "rgba(255,255,255,0.50)", letterSpacing: "0.08em" }}>{s.label}</div>
                            </div>
                          ))}
                        </div>

                        <a href="http://www.mint.gov.et" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black uppercase text-sm"
                            style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", letterSpacing: "0.10em", backdropFilter: "blur(8px)" }}>
                            <FiInfo size={15} />
                            {language === "am" ? "mint.gov.et ይጎብኙ" : "VISIT MINT.GOV.ET"}
                          </motion.div>
                        </a>
                      </motion.div>

                      {/* Right — Minister photo */}
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex flex-col items-center">
                        <motion.div
                          animate={{ boxShadow: ["0 0 20px rgba(232,184,75,0.30)", "0 0 50px rgba(232,184,75,0.60)", "0 0 20px rgba(232,184,75,0.30)"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="rounded-2xl overflow-hidden mb-5"
                          style={{ width: 260, height: 300, border: "3px solid rgba(232,184,75,0.60)" }}>
                          <img
                            src="http://www.mint.gov.et/documents/d/guest/1-38-jpg?imagePreview=1"
                            alt="Minister"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                            onError={e => { e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=260&h=300&fit=crop&q=90"; }}
                          />
                        </motion.div>
                        <div className="text-center rounded-2xl px-6 py-4"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(232,184,75,0.20)", backdropFilter: "blur(12px)" }}>
                          <div className="font-black text-white text-lg">Dr. Belete Molla</div>
                          <div className="text-sm mt-1 font-medium" style={{ color: "#E8B84B" }}>
                            {language === "am" ? "የኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር" : "Minister of Innovation & Technology"}
                          </div>
                          <div className="mt-2 text-xs font-semibold uppercase" style={{ color: "rgba(255,255,255,0.40)", letterSpacing: "0.12em" }}>
                            Federal Democratic Republic of Ethiopia
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* ── Bottom controls ── */}
            <div className="relative z-20 flex items-center justify-between px-8 md:px-12 pb-6">
              {/* Left: slide counter */}
              <div className="text-xs font-black" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em" }}>
                0{slideIndex + 1} / 0{HERO_SLIDES.length}
              </div>

              {/* Center: ጀምር / Start here — centered, bold, visible */}
              <motion.button
                onClick={() => document.getElementById("sectors")?.scrollIntoView({ behavior: "smooth" })}
                className="flex flex-col items-center gap-1 text-xs font-black uppercase"
                style={{ color: "#E8B84B", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.18em" }}
                whileHover={{ scale: 1.08 }}>
                <span style={{ fontSize: 13 }}>
                  {language === "am" ? "ጀምር · START HERE" : "START HERE · ጀምር"}
                </span>
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 14, lineHeight: 1 }}>▼</motion.span>
              </motion.button>

              {/* Right: slide dots */}
              <div className="flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => startSlide(i)} aria-label={`Slide ${i+1}`}
                    style={{
                      width: slideIndex === i ? 32 : 8, height: 8,
                      borderRadius: slideIndex === i ? 4 : "50%",
                      background: slideIndex === i ? "#E8B84B" : "rgba(255,255,255,0.30)",
                      border: "none", cursor: "pointer", padding: 0,
                      transition: "all 0.35s ease",
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 z-20"
            style={{ height: 3, width: `${slideProgress}%`, background: "linear-gradient(90deg, #C8961E, #E8B84B)", transition: "width 0.1s linear" }} />
        </div>

        {/* ── SECTORS GRID ── */}
        <main id="sectors" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
          <motion.div className="flex items-end justify-between mb-10"
            initial={{ opacity:1, y:0 }}
            transition={{ duration:0.5 }}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
                style={{ background:"rgba(11,42,74,0.07)", color:T.navyLight,
                  border:"1px solid rgba(11,42,74,0.12)", letterSpacing:"0.10em" }}>
                <FiGrid size={11} /> {t("browse_sector")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color:T.text }}>{t("ministry_sectors")}</h2>
              <p className="text-sm mt-1" style={{ color:T.textSub }}>
                {t("sectors_sub")}
              </p>
            </div>
            <span className="hidden sm:block text-xs font-bold px-4 py-2 rounded-full uppercase"
              style={{ background:T.border, color:T.textSub, letterSpacing:"0.09em" }}>
              {sectors.length} {sectors.length===1 ? t("sector_count_one") : t("sector_count_many")}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {loading ? (
              /* Skeleton cards while data loads */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: T.card, border: `1px solid ${T.border}`, height: 280 }}>
                  <div style={{ height: 168, background: T.border }} />
                  <div className="p-5 flex flex-col gap-3">
                    <div style={{ height: 14, background: T.border, borderRadius: 6, width: "70%" }} />
                    <div style={{ height: 10, background: T.border, borderRadius: 6, width: "90%" }} />
                    <div style={{ height: 10, background: T.border, borderRadius: 6, width: "60%" }} />
                  </div>
                </div>
              ))
            ) : (
              sectors.map((sector, index) => (
                <motion.div key={sector.id}
                  whileHover={{ y:-6, transition:{ duration:0.22 } }}>
                  <Link to={`/sector/${sector.id}`}
                    className="group flex flex-col rounded-2xl overflow-hidden h-full"
                    style={{ background:T.card, border:`1px solid ${T.border}`,
                      boxShadow:"0 2px 12px rgba(11,42,74,0.07)",
                      transition:"box-shadow .25s, border-color .25s", textDecoration:"none",
                      cursor:"pointer", display:"flex" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow="0 24px 56px rgba(11,42,74,0.18)"; e.currentTarget.style.borderColor=T.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(11,42,74,0.07)"; e.currentTarget.style.borderColor=T.border; }}>
                    <div className="relative overflow-hidden" style={{ height:168 }}>
                      <img src={getSectorImage(sector)}
                        alt={sectorName(sector)}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0"
                        style={{ background:"linear-gradient(to top, rgba(7,30,53,0.72) 0%, transparent 55%)" }} />
                      <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white px-2.5 py-1 rounded-lg"
                        style={{ background:T.navy, border:"1px solid rgba(255,255,255,0.16)" }}>
                        {t("bldg")} {sector.building}
                      </span>
                      <span className="absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background:T.gold, color:T.navyDark }}>
                        {sector.departmentCount||0} {t("depts_abbr")}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-extrabold text-base leading-snug mb-2" style={{ color:T.text }}>
                        {sectorName(sector)}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed flex-1" style={{ color:T.textSub }}>
                        {sectorDesc(sector).substring(0,90)}
                      </p>
                      <div className="flex items-center justify-between pt-3 mt-4"
                        style={{ borderTop:`1px solid ${T.border}` }}>
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color:T.text }}>
                          <FiMapPin size={11} style={{ color:T.gold }} /> {t("building")} {sector.building}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color:T.gold }}>
                          <FiStar size={11} style={{ fill:T.gold }} /> {sector.avgRating ? sector.avgRating.toFixed(1) : "—"}
                        </div>
                      </div>
                      {/* Full-width clickable CTA row */}
                      <div className="flex items-center justify-between mt-4 px-4 py-3 rounded-xl transition-all"
                        style={{
                          background:"rgba(11,42,74,0.08)",
                          border:`1px solid rgba(11,42,74,0.18)`,
                        }}>
                        <span className="text-xs font-bold uppercase" style={{ color:T.navy, letterSpacing:"0.12em" }}>
                          {t("view_details")}
                        </span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background:T.navy }}>
                          <FiArrowRight size={13} color="#fff" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </main>
        {/* ── QUICK ACTIONS ── */}
        <motion.div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background:T.border }} />
            <span className="text-xs font-bold uppercase"
              style={{ color:T.textMuted, letterSpacing:"0.13em" }}>{t("quick_actions")}</span>
            <div className="flex-1 h-px" style={{ background:T.border }} />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
              <Link to="/feedback"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white"
                style={{ background:T.navy, textDecoration:"none" }}>
                <FiStar size={14} /> {t("leave_feedback")} <FiChevronRight size={13} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </Layout>
  );
};
export default Home;
