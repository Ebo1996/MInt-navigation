import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { departmentService } from "../services/departmentService";
import { sectorService } from "../services/sectorService";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import {
  FiArrowLeft, FiChevronRight, FiHome, FiLayers,
  FiArrowRight, FiUsers, FiMapPin,
} from "react-icons/fi";

/* ── colour palette ── */
const C = {
  bg:        "#F7F9FC",
  navy:      "#086976",
  navyD:     "#071E35",
  navyL:     "#1C3F65",
  gold:      "#C8961E",
  goldL:     "#E8B84B",
  white:     "#FFFFFF",
  border:    "#E2EAF4",
  text:      "#0D1B2A",
  sub:       "#526070",
  muted:     "#8FA0B4",
};

/* accent gradient per wing index */
const ACCENTS = [
  ["#1a3a5c","#2d5986"],
  ["#1b4d35","#2e7d52"],
  ["#5c2a00","#8b4400"],
  ["#2a1a5c","#4a2e8b"],
  ["#1a4d4d","#2e7d7d"],
  ["#5c1a3a","#8b2e5c"],
  ["#1a3a1a","#2e5c2e"],
  ["#1a1a5c","#2e2e8b"],
];



export default function Sector() {
  const { id }        = useParams();
  const { language }  = useLanguage();
  const t             = useT();

  const [sector,     setSector]     = useState(null);
  const [wings,      setWings]      = useState([]);
  const [totalDesks, setTotalDesks] = useState(0);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const sid  = parseInt(id, 10);
        const lang = language || "en";
        const [sectorData, allDepts] = await Promise.all([
          sectorService.getPublicSectorById(sid),
          departmentService.getAll(),
        ]);
        setSector({
          ...sectorData,
          name:        sectorData.name?.[lang]        || sectorData.name?.en        || sectorData.name        || "",
          description: sectorData.description?.[lang] || sectorData.description?.en || sectorData.description || "",
        });
        const depts = (allDepts || []).filter(d => d.sectorId === sid);
        setTotalDesks(depts.length);
        const map = {};
        for (const d of depts) {
          const w = d.wing || "General";
          if (!map[w]) map[w] = { name: w, deskCount: 0, buildings: new Set() };
          map[w].deskCount++;
          if (d.building) map[w].buildings.add(d.building);
        }
        setWings(Object.values(map).map(w => ({ ...w, building: [...w.buildings].join("/") })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, language]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: `${C.gold} transparent ${C.gold} ${C.gold}` }} />
          <p className="text-sm font-medium" style={{ color: C.muted }}>{t("loading_dept")}</p>        </div>      </div>
    </Layout>
  );

  if (!sector) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center p-10 rounded-3xl shadow-xl" style={{ background: C.white }}>
          <p className="text-lg font-bold mb-4" style={{ color: C.text }}>{t("sector_not_found")}</p>
          <Link to="/sectors" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: C.gold }}>
            <FiArrowLeft size={14} /> {t("nav_sectors")}
          </Link>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: C.bg }}>

        {/* ══ HERO BANNER ══ */}
        <div className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${C.navyD} 0%, ${C.navy} 60%, ${C.navyL} 100%)` }}>
          {/* decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: C.goldL }} />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full opacity-5"
            style={{ background: C.goldL }} />

          <div className="relative max-w-6xl mx-auto px-5 py-10">
            {/* breadcrumb */}
            <motion.nav className="flex items-center gap-2 text-xs mb-8"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "rgba(255,255,255,0.45)" }}>
                <FiHome size={11} /> {t("nav_home")}
              </Link>
              <FiChevronRight size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
              <Link to="/sectors" className="hover:opacity-80 transition-opacity"
                style={{ color: "rgba(255,255,255,0.45)" }}>{t("nav_sectors")}</Link>
              <FiChevronRight size={10} style={{ color: "rgba(255,255,255,0.25)" }} />
              <span className="font-semibold" style={{ color: C.goldL }}>{sector.name}</span>
            </motion.nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              {/* title block */}
              <motion.div className="flex-1"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4"
                  style={{ background: "rgba(232,184,75,0.15)", border: "1px solid rgba(232,184,75,0.35)", color: C.goldL, letterSpacing: "0.14em" }}>
                  <FiLayers size={10} /> {t("ministry_sector")}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight"
                  style={{ letterSpacing: "-0.03em" }}>
                  {sector.name}
                </h1>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {sector.description}
                </p>
              </motion.div>

              {/* stat pills */}
              <motion.div className="flex gap-3 flex-wrap lg:flex-nowrap"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                {[
                  { val: wings.length,  label: t("departments"), icon: <FiLayers size={16} /> },
                  { val: totalDesks,    label: t("depts_abbr"),   icon: <FiUsers size={16} /> },
                  { val: `${t("bldg")} ${sector.building}`, label: t("building"), icon: <FiMapPin size={16} /> },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl min-w-[100px]"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                    <div style={{ color: C.goldL }}>{s.icon}</div>
                    <div className="text-2xl font-black text-white mt-1">{s.val}</div>
                    <div className="text-xs uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.40)", letterSpacing: "0.10em" }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ══ DEPARTMENTS ══ */}
        <div className="max-w-6xl mx-auto px-5 py-12">

          {/* section label */}
          <motion.div className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div>
              <h2 className="text-xl font-black" style={{ color: C.text }}>{t("departments")}</h2>
              <p className="text-sm mt-0.5" style={{ color: C.muted }}>{t("dept_grouped")}</p>
            </div>
            <span className="text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: C.navy, color: C.goldL }}>
              {wings.length} {t("stat_sectors")}
            </span>
          </motion.div>

          {/* department cards — 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wings.map((wing, idx) => {
              const [from, to] = ACCENTS[idx % ACCENTS.length];
              return (
                <motion.div key={wing.name}
                  className="h-full"
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.35, delay: idx * 0.04 }}
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}>
                  <Link
                    to={`/wing/${id}/${encodeURIComponent(wing.name)}`}
                    style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <div className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer"
                      style={{
                        height: "100%",
                        minHeight: 160,
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 2px 12px rgba(11,42,74,0.06)",
                        transition: "box-shadow 0.2s, border-color 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(11,42,74,0.13)"; e.currentTarget.style.borderColor = C.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(11,42,74,0.06)"; e.currentTarget.style.borderColor = C.border; }}>

                      {/* top accent bar */}
                      <div className="h-1.5 w-full flex-shrink-0"
                        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />

                      <div className="flex flex-col flex-1 p-5">
                        {/* icon + title row */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${from}22, ${to}33)`, border: `1px solid ${from}44` }}>
                            <FiLayers size={18} style={{ color: from }} />
                          </div>
                          <h3 className="font-bold text-sm leading-snug pt-1 flex-1" style={{ color: C.text }}>
                            {wing.name}
                          </h3>
                        </div>

                        {/* meta pills */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-3"
                          style={{ borderTop: `1px solid ${C.border}` }}>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                            style={{ background: `${from}18`, color: from }}>
                            <FiUsers size={11} /> {wing.deskCount} {t("depts_abbr")}
                          </span>
                          {wing.building && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                              style={{ background: "rgba(11,42,74,0.06)", color: C.navyL }}>
                              <FiMapPin size={11} /> {t("bldg")} {wing.building}
                            </span>
                          )}
                          <span className="ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
                            style={{ background: C.navy }}>
                            <FiArrowRight size={13} color="#fff" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
