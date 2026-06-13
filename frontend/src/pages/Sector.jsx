import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { getFloorLabel } from "../utils/floorLabels";
import { departmentService } from "../services/departmentService";
import { sectorService } from "../services/sectorService";
import { getDeptImage } from "../data/imageMap";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import {
  FiArrowLeft, FiMapPin, FiChevronRight, FiLayers,
  FiClock, FiUser, FiBriefcase, FiStar,
} from "react-icons/fi";

const T = {
  navy:"#0B2A4A", navyDark:"#071E35", navyMid:"#14304F", navyLight:"#1C3F65",
  gold:"#C8961E", goldLight:"#E8B84B", surface:"#F0F4FA", card:"#FFFFFF",
  border:"#D8E2EF", text:"#0B2A4A", textSub:"#4A5568", textMuted:"#8896A6",
};
const BADGE = { bg:"rgba(11,42,74,0.08)", color:"#1C3F65", border:"rgba(11,42,74,0.14)" };

const Sector = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = useT();
  const [sector,      setSector]      = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [rawDepts,    setRawDepts]    = useState([]);
  const [rawSector,   setRawSector]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const sectorId = parseInt(id, 10);
        const [sectorData, allDepts] = await Promise.all([
          sectorService.getPublicSectorById(sectorId),
          departmentService.getAll(),
        ]);
        setRawSector(sectorData);
        setRawDepts((allDepts || []).filter((d) => d.sectorId === sectorId));
      } catch (err) {
        console.error("Failed to load sector data:", err);
        setRawSector(null);
        setRawDepts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!rawSector) { setSector(null); return; }
    const lang = language || "en";
    setSector({
      ...rawSector,
      name:        rawSector.name?.[lang]        || rawSector.name?.en        || rawSector.name        || "",
      description: rawSector.description?.[lang] || rawSector.description?.en || rawSector.description || "",
    });
    setDepartments(rawDepts.map((d) => ({
      id:          d.id,
      name:        d.name?.[lang]        || d.name?.en        || t("unnamed_dept"),
      description: d.description?.[lang] || d.description?.en || "",
      building:    d.building || "A",
      floor:       d.floor ?? 0,
      room:        d.room || "",
      head:        d.head || "",
      services:    Array.isArray(d.services?.[lang]) && d.services[lang].length > 0
                     ? d.services[lang]
                     : Array.isArray(d.services?.en) ? d.services.en : [],
      walkingTime: d.walkingTime || "",
      rating:      d.rating || 0,
      image:       getDeptImage(d),
    })));
  }, [rawSector, rawDepts, language]);

  const departmentsByBuilding = useMemo(() => {
    const map = {};
    for (const d of departments) {
      const b = d.building || "A";
      if (!map[b]) map[b] = [];
      map[b].push(d);
    }
    return map;
  }, [departments]);

  const buildingKeys = useMemo(() => Object.keys(departmentsByBuilding).sort(), [departmentsByBuilding]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.surface }}>
        <motion.div className="text-center" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.4 }}>
          <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto"
            style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
          <p className="mt-5 text-sm font-semibold" style={{ color:T.textSub }}>{t("loading_dept")}</p>
        </motion.div>
      </div>
    </Layout>
  );

  if (!sector) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.surface }}>
        <motion.div className="text-center p-10 rounded-2xl"
          style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 4px 24px rgba(11,42,74,0.08)" }}
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
          <h2 className="text-xl font-bold mb-3" style={{ color:T.text }}>{t("sector_not_found")}</h2>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color:T.gold }}>
            <FiArrowLeft size={14} /> {t("back_home")}
          </Link>
        </motion.div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen pb-16" style={{ background: T.surface }}>

        {/* HERO */}
        <div className="relative overflow-hidden"
          style={{ background:`linear-gradient(155deg, ${T.navyDark} 0%, ${T.navy} 55%, ${T.navyMid} 100%)` }}>
          <motion.div className="absolute pointer-events-none"
            style={{ width:500, height:500, borderRadius:"50%",
              background:"radial-gradient(circle, rgba(200,150,30,0.08) 0%, transparent 70%)", top:"-30%", right:"-5%" }}
            animate={{ x:[0,-20,0], y:[0,20,0] }} transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }} />

          <div className="container mx-auto px-4 pt-10 pb-20 relative z-10">
            <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5 }}>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-80"
                style={{ color:"rgba(255,255,255,0.45)" }}>
                <FiArrowLeft size={14} /> {t("back_home")}
              </Link>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>
                <div className="flex items-center gap-4 mb-3">
                  <motion.div className="text-3xl p-3 rounded-2xl flex-shrink-0"
                    style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)" }}
                    whileHover={{ scale:1.08, rotate:5 }} transition={{ type:"spring", stiffness:300 }}>
                    {sector.icon || "🏛️"}
                  </motion.div>
                  <div>
                    <div className="text-xs font-bold uppercase mb-1"
                      style={{ color:T.goldLight, letterSpacing:"0.14em" }}>
                      {t("ministry_sector")}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white" style={{ letterSpacing:"-0.02em" }}>
                      {sector.name}
                    </h1>
                  </div>
                </div>
                <p className="text-sm md:text-base leading-relaxed max-w-2xl" style={{ color:"rgba(255,255,255,0.45)" }}>
                  {sector.description}
                </p>
              </motion.div>

              <motion.div className="flex items-center gap-6 px-6 py-4 rounded-2xl flex-shrink-0"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)" }}
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5, delay:0.2 }}>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color:T.goldLight }}>{(sector.avgRating||4.5).toFixed(1)}</div>
                  <div className="text-xs uppercase mt-0.5" style={{ color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em" }}>
                    {t("rating")}
                  </div>
                </div>
                <div className="w-px h-8" style={{ background:"rgba(255,255,255,0.12)" }} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{departments.length}</div>
                  <div className="text-xs uppercase mt-0.5" style={{ color:"rgba(255,255,255,0.35)", letterSpacing:"0.12em" }}>
                    {t("departments")}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-4 mt-6 max-w-7xl">

          {/* Sub-header */}
          <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 rounded-2xl px-5 py-4"
            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 4px 20px rgba(11,42,74,0.08)" }}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.3 }}>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2" style={{ color:T.text }}>
                <FiMapPin size={16} style={{ color:T.gold }} />
                {sector.name}
              </h2>
              <p className="text-xs mt-1" style={{ color:T.textMuted }}>{t("dept_grouped")}</p>
            </div>
            <span className="text-xs font-bold uppercase px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background:T.surface, color:T.textSub, border:`1px solid ${T.border}`, letterSpacing:"0.10em" }}>
              {departments.length} {t("departments")}
            </span>
          </motion.div>

          {/* Building sections */}
          {buildingKeys.map((building) => (
            <section key={building} className="mb-12 last:mb-4">
              {buildingKeys.length > 1 && (
                <motion.h3 className="text-sm font-extrabold uppercase mb-5 flex items-center gap-2"
                  style={{ color:T.textMuted, letterSpacing:"0.16em" }}
                  initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ duration:0.4 }}>
                  <span className="w-7 h-7 rounded flex items-center justify-center text-white text-sm font-extrabold"
                    style={{ background:T.navy }}>{building}</span>
                  {t("building")} {building}
                </motion.h3>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {departmentsByBuilding[building].map((dept, idx) => {
                  const floorLabel   = getFloorLabel(dept.floor);
                  const isRestricted = !dept.head || dept.head === "TBD";
                  return (
                    <motion.article key={dept.id}
                      initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                      viewport={{ once:true }} transition={{ duration:0.5, delay:idx*0.07 }}
                      whileHover={{ y:-6, transition:{ duration:0.25 } }}
                      className="group relative rounded-2xl overflow-hidden"
                      style={{ background:T.card, border:`1px solid ${T.border}`,
                        borderLeft:`4px solid ${T.navy}`, boxShadow:"0 2px 12px rgba(11,42,74,0.07)",
                        transition:"box-shadow 0.3s, border-color 0.3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 20px 50px rgba(11,42,74,0.18)"; e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.borderLeftColor=T.gold; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 2px 12px rgba(11,42,74,0.07)"; e.currentTarget.style.borderColor=T.border; e.currentTarget.style.borderLeftColor=T.navy; }}>

                      <span className="absolute top-3 right-3 z-20 text-xs font-bold uppercase px-2.5 py-1 rounded-full"
                        style={{ background:isRestricted?"rgba(11,42,74,0.10)":"rgba(28,63,101,0.10)",
                          color:isRestricted?T.navyMid:T.navyLight,
                          border:`1px solid ${isRestricted?"rgba(11,42,74,0.20)":"rgba(28,63,101,0.20)"}`,
                          letterSpacing:"0.08em" }}>
                        {isRestricted ? t("restricted") : t("active")}
                      </span>

                      <div className="h-44 w-full overflow-hidden relative">
                        <img src={dept.image} alt={dept.name} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { e.target.src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=220&fit=crop&q=85"; }} />
                        <div className="absolute inset-0"
                          style={{ background:"linear-gradient(to top, rgba(7,30,53,0.55) 0%, transparent 55%)" }} />
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-bold leading-snug mb-2 pr-20" style={{ color:T.text }}>
                          {dept.name}
                        </h3>
                        <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color:T.textSub }}>
                          {dept.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-sm font-extrabold px-3 py-1.5 rounded-lg"
                            style={{ background:BADGE.bg, color:BADGE.color, border:`1px solid ${BADGE.border}` }}>
                            <FiLayers size={13} />{floorLabel}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg"
                            style={{ background:BADGE.bg, color:BADGE.color, border:`1px solid ${BADGE.border}` }}>
                            <FiClock size={13} />{dept.walkingTime || t("walk_min_default")}
                          </span>
                          {dept.rating > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background:"rgba(200,150,30,0.10)", color:"#7A5A00", border:"1px solid rgba(200,150,30,0.22)" }}>
                              <FiStar size={10} />{dept.rating.toFixed(1)}
                            </span>
                          )}                        </div>

                        {dept.head && dept.head !== "TBD" && (
                          <div className="flex items-start gap-2 mb-3 text-sm" style={{ color:T.textSub }}>
                            <FiUser size={14} style={{ color:T.textMuted, marginTop:2, flexShrink:0 }} />
                            <div>
                              <span className="font-semibold" style={{ color:T.text }}>{dept.head}</span>
                              <span className="block text-xs uppercase mt-0.5"
                                style={{ color:T.textMuted, letterSpacing:"0.08em" }}>{t("dept_head")}</span>
                            </div>
                          </div>
                        )}

                        {dept.services && dept.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {dept.services.slice(0, 2).map((svc, i) => (
                              <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md"
                                style={{ background:T.surface, color:T.textSub, border:`1px solid ${T.border}` }}>
                                {svc}
                              </span>
                            ))}
                            {dept.services.length > 2 && (
                              <span className="text-xs font-bold" style={{ color:T.gold }}>
                                +{dept.services.length - 2} {t("more")}
                              </span>
                            )}
                          </div>
                        )}

                        <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                          <Link to={`/department/${dept.id}`}
                            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-extrabold text-white transition-opacity hover:opacity-90"
                            style={{ background:`linear-gradient(90deg, ${T.navy}, ${T.navyLight})`, letterSpacing:"0.04em" }}>
                            {t("view_details")}
                            <FiChevronRight size={15} />
                          </Link>
                        </motion.div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Bottom strip */}
          <motion.div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-4"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.5 }}>
            <div className="lg:col-span-3 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background:T.card, border:`1px solid ${T.border}` }}>
              <div className="flex-shrink-0">
                <h3 className="text-xs font-bold uppercase flex items-center gap-2"
                  style={{ color:T.textMuted, letterSpacing:"0.12em" }}>
                  <FiMapPin size={13} style={{ color:T.gold }} />{t("floor_directory")}
                </h3>
                <p className="text-xs mt-0.5 hidden sm:block" style={{ color:T.textMuted }}>{t("floor_ref")}</p>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {["G",1,2,3,4,5].map((lvl) => {
                  const label = lvl === "G" ? getFloorLabel(0) : getFloorLabel(lvl);
                  return (
                    <motion.div key={String(lvl)} className="px-3 py-1.5 rounded-full text-xs font-bold tabular-nums"
                      style={{ background:BADGE.bg, color:BADGE.color, border:`1px solid ${BADGE.border}` }}
                      whileHover={{ scale:1.08 }}>{label}</motion.div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl px-5 py-5 flex flex-col justify-center gap-4 text-white"
              style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyDark})`, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 flex-shrink-0" style={{ background:"rgba(255,255,255,0.10)" }}>
                  <FiBriefcase size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t("need_guidance")}</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color:"rgba(255,255,255,0.50)" }}>
                    {t("guidance_sub")} {sector.building}.
                  </p>
                </div>
              </div>
              <motion.a href="mailto:contact@mint.gov.et"
                className="w-full sm:w-auto sm:self-start py-2.5 px-5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90 text-center"
                style={{ background:T.gold, color:T.navyDark, display:"inline-block", textDecoration:"none" }}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                {t("contact_support")}
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Sector;
