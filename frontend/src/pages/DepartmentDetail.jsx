import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { sectorsData } from "../data/sectorsData";
import { getFloorLabel } from "../utils/floorLabels";
import { departmentService } from "../services/departmentService";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import {
  FiArrowLeft, FiMapPin, FiStar, FiClock, FiUser,
  FiPhone, FiMail, FiChevronRight, FiAward, FiBookOpen,
  FiNavigation, FiCheckCircle, FiTrendingUp, FiMessageCircle,
  FiLayers, FiShield,
} from "react-icons/fi";

/* ── Design tokens ── */
const T = {
  navy:      "#086976",
  navyDark:  "#071E35",
  navyLight: "#1C3F65",
  gold:      "#C8961E",
  goldLight: "#E8B84B",
  surface:   "#F0F4FA",
  card:      "#FFFFFF",
  border:    "#D8E2EF",
  text:      "#086976",
  textSub:   "#4A5568",
  textMuted: "#8896A6",
};

/* ── Smart splash images matched by dept name keywords ── */
const DEPT_SPLASH = {
  "minister":    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&h=500&fit=crop&q=90",
  "deputy":      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=500&fit=crop&q=90",
  "executive":   "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=500&fit=crop&q=90",
  "strategic":   "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=500&fit=crop&q=90",
  "secretariat": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&h=500&fit=crop&q=90",
  "technology":  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop&q=90",
  "innovation":  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=500&fit=crop&q=90",
  "startup":     "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=500&fit=crop&q=90",
  "research":    "https://images.unsplash.com/photo-1532094349884-543559059e2d?w=1200&h=500&fit=crop&q=90",
  "fund":        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=500&fit=crop&q=90",
  "finance":     "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=500&fit=crop&q=90",
  "treasury":    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=500&fit=crop&q=90",
  "procurement": "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=500&fit=crop&q=90",
  "audit":       "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=500&fit=crop&q=90",
  "policy":      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=500&fit=crop&q=90",
  "human":       "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=500&fit=crop&q=90",
  "women":       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=500&fit=crop&q=90",
  "social":      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=500&fit=crop&q=90",
  "facility":    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=500&fit=crop&q=90",
  "registry":    "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&h=500&fit=crop&q=90",
  "ict":         "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=500&fit=crop&q=90",
  "digital":     "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=500&fit=crop&q=90",
  "data":        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=500&fit=crop&q=90",
  "conference":  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=500&fit=crop&q=90",
  "tv":          "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=500&fit=crop&q=90",
  "cooperation": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=500&fit=crop&q=90",
};
const SPLASH_FALLBACKS = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=500&fit=crop&q=90",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=500&fit=crop&q=90",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=500&fit=crop&q=90",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=500&fit=crop&q=90",
];
const getSplash = (dept) => {
  if (dept.image) return dept.image;
  const n = (dept.name || "").toLowerCase();
  for (const [k, v] of Object.entries(DEPT_SPLASH)) { if (n.includes(k)) return v; }
  return SPLASH_FALLBACKS[(dept.id || 0) % SPLASH_FALLBACKS.length];
};

/* ── Reusable animated section card ── */
const Card = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={`rounded-2xl ${className}`}
    style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 2px 20px rgba(11,42,74,0.07)" }}
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

/* ── Section heading with left accent bar ── */
const Heading = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: T.gold }} />
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(11,42,74,0.07)", border: "1px solid rgba(11,42,74,0.12)" }}>
      {React.cloneElement(icon, { size: 15, color: T.navyLight })}
    </div>
    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: T.text, letterSpacing: "0.10em" }}>
      {title}
    </h2>
  </div>
);

/* ── Info row (phone / email / location) ── */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl"
    style={{ background: T.surface, border: `1px solid ${T.border}` }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(200,150,30,0.10)", border: "1px solid rgba(200,150,30,0.18)" }}>
      {React.cloneElement(icon, { size: 14, color: T.gold })}
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase" style={{ color: T.textMuted, letterSpacing: "0.08em" }}>{label}</div>
      <div className="text-base font-extrabold truncate" style={{ color: T.text }}>{value}</div>
    </div>
  </div>
);


/* ════════════════════════════════════════════════ */
const DepartmentDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = useT();
  const [department, setDepartment] = useState(null);
  const [rawDept,    setRawDept]    = useState(null);
  const [sector,     setSector]     = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const dept = await departmentService.getById(id);
        setRawDept(dept || null);
        if (dept) setSector(sectorsData.find(s => s.id === dept.sectorId) || null);
      } catch (e) {
        console.error(e);
        setRawDept(null); setDepartment(null); setSector(null);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  // Re-map when language changes
  useEffect(() => {
    if (!rawDept) return;
    const lang = language || "en";
    setDepartment({
      ...rawDept,
      name:        rawDept.name?.[lang]        || rawDept.name?.en        || t("unnamed_dept"),
      description: rawDept.description?.[lang] || rawDept.description?.en || "",
      services:    Array.isArray(rawDept.services?.[lang]) && rawDept.services[lang].length > 0
                     ? rawDept.services[lang]
                     : Array.isArray(rawDept.services?.en) ? rawDept.services.en : [],
      directions:  rawDept.directions?.[lang]  || rawDept.directions?.en  || "",
      phone:       rawDept.contact             || "",
      image:       rawDept.departmentImage     || rawDept.image           || null,
    });
    // Also update sector name for breadcrumb
    const found = sectorsData.find(s => s.id === rawDept.sectorId);
    if (found) {
      setSector({
        ...found,
        name: found.name?.[lang] || found.name?.en || found.name || "",
      });
    }
  }, [rawDept, language]);

  const initials = (name) => {
    if (!name || name === "TBD") return "?";
    const p = name.split(" ");
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length-1][0]).toUpperCase();
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.surface }}>
        <motion.div className="text-center" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
          <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto"
            style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
          <p className="mt-5 text-sm font-semibold" style={{ color:T.textSub }}>{t("loading_dept")}</p>
        </motion.div>
      </div>
    </Layout>
  );

  if (!department) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.surface }}>
        <motion.div className="text-center p-10 rounded-2xl"
          style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 4px 24px rgba(11,42,74,0.08)" }}
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
          <h2 className="text-xl font-bold mb-3" style={{ color:T.text }}>{t("dept_not_found")}</h2>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color:T.gold }}>
            <FiArrowLeft size={14} /> {t("back_home")}
          </Link>
        </motion.div>
      </div>
    </Layout>
  );

  const splash = getSplash(department);
  const steps  = department.directions
    ? department.directions.split(".").map(s => s.trim()).filter(Boolean)
    : [
        `${t("dir_elevator")} ${getFloorLabel(department.floor)}`,
        department.floor % 2 === 0 ? t("dir_turn_right") : t("dir_turn_left"),
        `${t("dir_walk_to")} ${department.room}`,
        `${t("dir_look_for")} "${department.name}" ${t("dir_sign")}`,
      ];
  const walkIn = department.services?.slice(0, 3) || [];
  const byAppt = department.services?.slice(3)    || [];


  return (
    <Layout>
      <div className="min-h-screen pb-20" style={{ background: T.surface }}>

        {/* ══════════ HERO ══════════ */}
        <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
          {/* Background image with Ken-Burns zoom */}
          <motion.div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage:`url('${splash}')` }}
            initial={{ scale:1.08 }} animate={{ scale:1 }}
            transition={{ duration:1.4, ease:"easeOut" }} />

          {/* Layered overlays for perfect text legibility */}
          <div className="absolute inset-0"
            style={{ background:"linear-gradient(to top, rgba(5,14,26,0.96) 0%, rgba(7,20,38,0.55) 45%, rgba(7,20,38,0.20) 100%)" }} />
          <div className="absolute inset-0"
            style={{ background:"linear-gradient(90deg, rgba(5,14,26,0.40) 0%, transparent 60%)" }} />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background:`linear-gradient(90deg, ${T.navy}, ${T.gold}, ${T.navyLight})` }} />

          {/* Back button */}
          <motion.div className="absolute top-5 left-5 z-20"
            initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}>
            <Link to={rawDept?.wing && sector?.id
                ? `/wing/${sector.id}/${encodeURIComponent(rawDept.wing)}`
                : sector?.id ? `/sector/${sector.id}` : "/"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background:"rgba(11,42,74,0.60)", border:"1px solid rgba(255,255,255,0.18)", backdropFilter:"blur(10px)" }}>
              <FiArrowLeft size={14} /> {t("back_sector")}
            </Link>
          </motion.div>

          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-10 pb-8">
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.15 }}>
              {/* Sector breadcrumb */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                  style={{ background:"rgba(200,150,30,0.18)", color:T.goldLight,
                    border:"1px solid rgba(200,150,30,0.30)", letterSpacing:"0.12em" }}>
                  {sector?.name || t("ministry_sector")}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
                style={{ letterSpacing:"-0.03em", textShadow:"0 2px 20px rgba(0,0,0,0.60)", maxWidth:700 }}>
                {department.name}
              </h1>
              {/* Quick location strip */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { icon:<FiMapPin size={13}/>,    label:`${t("building")} ${department.building}` },
                  { icon:<FiLayers size={13}/>,    label:getFloorLabel(department.floor)   },
                  { icon:<FiMapPin size={13}/>,    label:`${t("room")} ${department.room}`         },
                  { icon:<FiClock size={13}/>,     label:department.walkingTime||t("walk_default") },
                ].map((b,i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.95)",
                      border:"1px solid rgba(255,255,255,0.18)", backdropFilter:"blur(6px)" }}>
                    {b.icon}{b.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════ RATING STRIP ══════════ */}
        <div className="max-w-6xl mx-auto px-4 -mt-1 relative z-20">
          <motion.div className="rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4"
            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 12px 40px rgba(11,42,74,0.13)" }}
            initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}>
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={16}
                    style={{ color:T.gold, fill: s <= Math.round(department.rating||0) ? T.gold : "none" }} />
                ))}
              </div>
              {department.rating > 0 ? (
                <>
                  <span className="text-2xl font-bold tabular-nums" style={{ color:T.text }}>{department.rating}</span>
                  <span className="text-sm" style={{ color:T.textMuted }}>
                    ({department.reviewCount||0} {t("reviews")})
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold" style={{ color:T.textMuted }}>{t("no_ratings_yet")}</span>
              )}
            </div>
            {/* Status badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background:"rgba(11,42,74,0.07)", border:"1px solid rgba(11,42,74,0.12)" }}>
              <FiShield size={13} style={{ color:T.navyLight }} />
              <span className="text-xs font-bold uppercase" style={{ color:T.navyLight, letterSpacing:"0.10em" }}>
                {(!department.head || department.head==="TBD") ? t("restricted_access") : t("active_dept")}
              </span>
            </div>
          </motion.div>
        </div>


        {/* ══════════ MAIN GRID ══════════ */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* About */}
              <Card delay={0.1}>
                <div className="p-6 md:p-7">
                  <Heading icon={<FiBookOpen />} title={t("about_dept")} />
                  <p className="text-sm leading-relaxed" style={{ color:T.textSub }}>
                    {department.description}
                  </p>
                </div>
              </Card>

              {/* How to Find Us */}
              <Card delay={0.15}>
                <div className="p-6 md:p-7">
                  <Heading icon={<FiNavigation />} title={t("how_to_find")} />
                  <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${T.border}` }}>
                    {steps.map((step, idx) => (
                      <motion.div key={idx}
                        className="flex items-start gap-4 px-5 py-4"
                        style={{ borderBottom: idx < steps.length-1 ? `1px solid ${T.border}` : "none",
                          background: idx % 2 === 0 ? T.surface : T.card }}
                        initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }}
                        viewport={{ once:true }} transition={{ delay:idx*0.07 }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                          style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                            boxShadow:"0 2px 8px rgba(11,42,74,0.25)" }}>
                          {idx+1}
                        </div>
                        <span className="text-sm leading-relaxed pt-0.5" style={{ color:T.textSub }}>{step}</span>
                      </motion.div>
                    ))}
                    <div className="flex items-center gap-2 px-5 py-3"
                      style={{ background:"rgba(200,150,30,0.06)", borderTop:`1px solid rgba(200,150,30,0.18)` }}>
                      <FiClock size={13} style={{ color:T.gold }} />
                      <span className="text-xs font-semibold" style={{ color:T.textSub }}>
                        {t("walk_time")}: <strong style={{ color:T.text }}>{department.walkingTime||"3–5 minutes"}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Services */}
              {(walkIn.length > 0 || byAppt.length > 0) && (
                <Card delay={0.2}>
                  <div className="p-6 md:p-7">
                    <Heading icon={<FiAward />} title={t("services_offered")} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {walkIn.length > 0 && (
                        <div className="rounded-xl p-4" style={{ background:T.surface, border:`1px solid ${T.border}` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <FiCheckCircle size={13} style={{ color:T.navyLight }} />
                            <span className="text-xs font-bold uppercase" style={{ color:T.navyLight, letterSpacing:"0.09em" }}>
                              {t("walk_in")}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {walkIn.map((s,i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{ color:T.textSub }}>
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background:T.navy }} />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {byAppt.length > 0 && (
                        <div className="rounded-xl p-4" style={{ background:T.surface, border:`1px solid ${T.border}` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <FiCheckCircle size={13} style={{ color:T.navyLight }} />
                            <span className="text-xs font-bold uppercase" style={{ color:T.navyLight, letterSpacing:"0.09em" }}>
                              {t("by_appointment")}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {byAppt.map((s,i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{ color:T.textSub }}>
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background:T.navy }} />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>


            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">

              {/* Head of Department */}
              <Card delay={0.1}>
                <div className="p-5">
                  <Heading icon={<FiUser />} title={t("dept_head_title")} />
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4 p-4 rounded-xl mb-4"
                    style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}>
                    <motion.div
                      className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                      style={{ border:"2px solid rgba(255,255,255,0.30)", boxShadow:"0 4px 16px rgba(0,0,0,0.25)" }}
                      whileHover={{ scale:1.08 }}>
                      <img
                        src={`https://randomuser.me/api/portraits/${department.id % 2 === 0 ? "men" : "women"}/${(department.id || 1) % 70 + 1}.jpg`}
                        alt={department.head || "Head"}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.display = "flex";
                          e.target.parentNode.style.alignItems = "center";
                          e.target.parentNode.style.justifyContent = "center";
                          e.target.parentNode.style.background = "rgba(255,255,255,0.15)";
                          e.target.parentNode.style.fontSize = "1.2rem";
                          e.target.parentNode.style.fontWeight = "bold";
                          e.target.parentNode.style.color = "#fff";
                          e.target.parentNode.textContent = initials(department.head);
                        }}
                      />
                    </motion.div>
                    <div>
                      <div className="font-bold text-white leading-tight">{department.head || "TBD"}</div>
                      <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.55)" }}>
                        {department.headTitle || t("dept_head")}
                      </div>
                    </div>
                  </div>
                  {/* Contact rows */}
                  <div className="space-y-2">
                    {department.phone && <InfoRow icon={<FiPhone />} label={t("phone")} value={department.phone} />}
                    {department.email && <InfoRow icon={<FiMail />}  label={t("email")} value={department.email} />}
                    <InfoRow icon={<FiMapPin />} label={t("location")}
                      value={`${t("bldg")} ${department.building} · ${getFloorLabel(department.floor)} · ${t("room")} ${department.room}`} />
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <motion.div className="rounded-2xl p-5 text-white"
                style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyDark})`,
                  border:"1px solid rgba(255,255,255,0.06)", boxShadow:"0 8px 32px rgba(11,42,74,0.22)" }}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.5, delay:0.15 }}>
                <p className="text-xs font-bold uppercase mb-4"
                  style={{ color:"rgba(255,255,255,0.40)", letterSpacing:"0.14em" }}>{t("quick_stats")}</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val:department.reviewCount||0,                               label:t("reviews"),         icon:<FiStar size={14}/> },
                    { val:department.rating > 0 ? department.rating : "—",         label:t("rating"),           icon:<FiTrendingUp size={14}/> },
                    { val:department.walkingTime||"—",                             label:t("walk_time_short"),  icon:<FiClock size={14}/> },
                    { val:getFloorLabel(department.floor),                         label:t("floor"),            icon:<FiLayers size={14}/> },
                  ].map((s,i) => (
                    <motion.div key={i} className="rounded-xl p-3"
                      style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.10)" }}
                      initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
                      viewport={{ once:true }} transition={{ delay:0.2+i*0.07 }}
                      whileHover={{ scale:1.04 }}>
                      <div className="flex items-center gap-1.5 mb-1" style={{ color:T.goldLight }}>{s.icon}</div>
                      <div className="text-lg font-bold leading-tight" style={{ color:T.goldLight }}>{s.val}</div>
                      <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.38)" }}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* What to Bring */}
              <Card delay={0.2}>
                <div className="p-5">
                  <Heading icon={<FiBookOpen />} title={t("what_to_bring")} />
                  <ul className="space-y-2.5">
                    {[t("bring_1"), t("bring_2"), t("bring_3")].map((item,i) => (
                      <motion.li key={i} className="flex items-start gap-3 text-sm"
                        style={{ color:T.textSub }}
                        initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }}
                        viewport={{ once:true }} transition={{ delay:i*0.07 }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background:"rgba(11,42,74,0.08)", border:"1px solid rgba(11,42,74,0.14)" }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background:T.navy }} />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Leave Feedback CTA */}
              <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.5, delay:0.25 }}
                whileHover={{ y:-3, transition:{ duration:0.2 } }}>
                <Link to={`/feedback/${department.id}`}
                  className="group block w-full rounded-2xl p-5"
                  style={{ background:T.card, border:`2px solid ${T.border}`,
                    boxShadow:"0 4px 20px rgba(11,42,74,0.08)",
                    transition:"border-color 0.25s, box-shadow 0.25s", textDecoration:"none" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.boxShadow="0 12px 40px rgba(11,42,74,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.boxShadow="0 4px 20px rgba(11,42,74,0.08)"; }}>
                  <div className="flex items-center gap-4">
                    <motion.div className="rounded-xl p-3 text-white flex-shrink-0"
                      style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}
                      whileHover={{ rotate:8 }} transition={{ type:"spring", stiffness:300 }}>
                      <FiMessageCircle size={20} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color:T.text }}>{t("leave_feedback_btn")}</div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color:T.textSub }}>
                        {t("feedback_sub")}
                      </p>
                    </div>
                    <FiChevronRight size={18} style={{ color:T.gold, flexShrink:0 }} />
                  </div>
                </Link>
              </motion.div>

            </div>{/* end right col */}
          </div>{/* end grid */}
        </div>{/* end main */}
      </div>
    </Layout>
  );
};

export default DepartmentDetail;
