import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { sectorService } from "../services/sectorService";
import { getSectorImage } from "../data/imageMap";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import { FiMapPin, FiStar, FiArrowRight, FiGrid } from "react-icons/fi";

const T = {
  navy:      "#0B2A4A",
  navyDark:  "#071E35",
  navyLight: "#1C3F65",
  gold:      "#C8961E",
  goldLight: "#E8B84B",
  surface:   "#F0F4FA",
  card:      "#FFFFFF",
  border:    "#D8E2EF",
  text:      "#0B2A4A",
  textSub:   "#4A5568",
  textMuted: "#8896A6",
};

const Sectors = () => {
  const { language } = useLanguage();
  const t = useT();
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getName = (s) => s.name?.[language] || s.name?.en || s.name || "";
  const getDesc = (s) => s.description?.[language] || s.description?.en || s.description || "";

  useEffect(() => {
    sectorService.getPublicSectors()
      .then((data) => setSectors(data || []))
      .catch(() => setSectors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: T.surface }}>

        {/* HERO */}
        <div style={{
          background: `linear-gradient(155deg, ${T.navyDark} 0%, ${T.navy} 55%, ${T.navyLight} 100%)`,
          padding: "56px 0 48px",
        }}>
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-5"
                style={{ background: "rgba(200,150,30,0.15)", border: `1px solid ${T.goldLight}`, color: T.goldLight, letterSpacing: "0.14em" }}>
                <FiGrid size={12} /> {t("ministry_full")}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
                {t("ministry_sectors")}
              </h1>
              <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                {t("sectors_sub")}
              </p>
              {!loading && (
                <motion.div className="flex justify-center gap-6 mt-8"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: T.goldLight }}>{sectors.length}</div>
                    <div className="text-xs uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>{t("stat_sectors")}</div>
                  </div>
                  <div className="w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {sectors.reduce((sum, s) => sum + (s.departmentCount || 0), 0)}
                    </div>
                    <div className="text-xs uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>{t("departments")}</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* GRID */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: `${T.gold} transparent ${T.gold} ${T.gold}` }} />
            </div>
          ) : sectors.length === 0 ? (
            <div className="text-center py-24" style={{ color: T.textMuted }}>
              <FiGrid size={40} className="mx-auto mb-3 opacity-30" />
              <p>{t("no_sectors_found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {sectors.map((sector, index) => (
                <motion.div key={sector.id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                  <Link to={`/sector/${sector.id}`}
                    className="group flex flex-col rounded-2xl overflow-hidden h-full"
                    style={{
                      background: T.card, border: `1px solid ${T.border}`,
                      boxShadow: "0 2px 12px rgba(11,42,74,0.07)",
                      transition: "box-shadow .25s, border-color .25s", textDecoration: "none",
                      cursor: "pointer", display: "flex",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 24px 56px rgba(11,42,74,0.18)"; e.currentTarget.style.borderColor = T.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(11,42,74,0.07)"; e.currentTarget.style.borderColor = T.border; }}>

                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ height: 168 }}>
                      <img src={getSectorImage(sector)} alt={getName(sector)} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(7,30,53,0.68) 0%, transparent 55%)" }} />
                      <span className="absolute top-2.5 left-2.5 text-xs font-bold text-white px-2.5 py-1 rounded-lg"
                        style={{ background: T.navy, border: "1px solid rgba(255,255,255,0.16)" }}>
                        {t("bldg")} {sector.building}
                      </span>
                      <span className="absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: T.gold, color: T.navyDark }}>
                        {sector.departmentCount || 0} {t("depts_abbr")}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-extrabold text-base leading-snug mb-2" style={{ color: T.text }}>{getName(sector)}</h3>
                      <p className="text-sm font-medium leading-relaxed flex-1" style={{ color: T.textSub }}>
                        {getDesc(sector).substring(0, 90)}
                      </p>
                      <div className="flex items-center justify-between pt-3 mt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: T.text }}>
                          <FiMapPin size={11} style={{ color:T.gold }} /> {t("building")} {sector.building}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: T.gold }}>
                          <FiStar size={11} style={{ fill:T.gold }} /> {(sector.avgRating || "—")}
                        </div>
                      </div>
                      {/* Full-width clickable CTA */}
                      <div className="flex items-center justify-between mt-4 px-4 py-3 rounded-xl"
                        style={{
                          background:"rgba(11,42,74,0.08)",
                          border:`1px solid rgba(11,42,74,0.18)`,
                        }}>
                        <span className="text-xs font-bold uppercase" style={{ color:T.navy, letterSpacing: "0.12em" }}>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Sectors;
