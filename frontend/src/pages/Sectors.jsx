import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import { sectorService } from "../services/sectorService";
import { getSectorImage } from "../data/imageMap";
import { useLanguage } from "../hooks/useLanguage";
import { useT } from "../hooks/useT";
import {
  FiArrowRight, FiMapPin, FiStar, FiLayers,
  FiGrid, FiUsers, FiChevronRight,
} from "react-icons/fi";

const C = {
  bg:    "#F4F7FB",
  navy:  "#086976",
  navyD: "#071E35",
  navyL: "#1C3F65",
  gold:  "#C8961E",
  goldL: "#E8B84B",
  white: "#FFFFFF",
  border:"#DDE6F2",
  text:  "#0C1A2C",
  sub:   "#4A5E72",
  muted: "#8096AD",
};

const SECTOR_BG = [
  "linear-gradient(135deg,#071E35 0%,#1C3F65 100%)",
  "linear-gradient(135deg,#0d4429 0%,#1b7a4a 100%)",
  "linear-gradient(135deg,#1a0a4a 0%,#3b1e80 100%)",
];

export default function Sectors() {
  const { language } = useLanguage();
  const t = useT();
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getName = s => s.name?.[language] || s.name?.en || s.name || "";
  const getDesc = s => s.description?.[language] || s.description?.en || s.description || "";

  useEffect(() => {
    sectorService.getPublicSectors()
      .then(d => setSectors(d || []))
      .catch(() => setSectors([]))
      .finally(() => setLoading(false));
  }, []);

  const totalDesks = sectors.reduce((a, s) => a + (s.departmentCount || 0), 0);

  return (
    <Layout>
      <div style={{ background: C.bg, minHeight: "100vh" }}>

        {/* ══ HERO ══ */}
        <div style={{ background: `linear-gradient(160deg, ${C.navyD} 0%, ${C.navy} 55%, ${C.navyL} 100%)`, position: "relative", overflow: "hidden" }}>
          {/* deco shapes */}
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"320px", height:"320px", borderRadius:"50%", background:"rgba(232,184,75,0.07)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"20%", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />

          <div className="max-w-6xl mx-auto px-6 py-16 relative">
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* LEFT — title + stats */}
              <div>
                {/* pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-6"
                  style={{ background:"rgba(232,184,75,0.15)", border:"1px solid rgba(232,184,75,0.35)", color:C.goldL, letterSpacing:"0.15em" }}>
                  <FiGrid size={11} /> {t("ministry_full")}
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white mb-4"
                  style={{ letterSpacing:"-0.03em", lineHeight:1.1 }}>
                  {t("ministry_sectors_line1")}<br />
                  <span style={{ color:C.goldL }}>{t("ministry_sectors_line2")}</span>
                </h1>

                <p className="text-base md:text-lg max-w-lg mb-10"
                  style={{ color:"rgba(255,255,255,0.55)", lineHeight:1.7 }}>
                  {t("sectors_sub")}
                </p>

                {/* stats bar */}
                {!loading && (
                  <motion.div className="flex flex-wrap gap-4"
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
                    {[
                      { val: sectors.length,                label:t("stat_sectors"), icon:<FiGrid size={14}/> },
                      { val: sectors.reduce((a,s) => a + (s.departmentCount||0),0), label:t("stat_depts"), icon:<FiLayers size={14}/> },
                      { val: "A & B",                       label:t("building"),     icon:<FiMapPin size={14}/> },
                    ].map((st,i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                        style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(8px)" }}>
                        <div style={{ color:C.goldL }}>{st.icon}</div>
                        <div>
                          <div className="text-xl font-black text-white">{st.val}</div>
                          <div className="text-xs uppercase" style={{ color:"rgba(255,255,255,0.40)", letterSpacing:"0.10em" }}>{st.label}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* RIGHT — How it works orientation guide */}
              <motion.div
                initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, delay:0.2 }}
                className="rounded-3xl p-6"
                style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(232,184,75,0.25)", backdropFilter:"blur(12px)" }}>

                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:"rgba(232,184,75,0.20)", border:"1px solid rgba(232,184,75,0.40)" }}>
                    <FiChevronRight size={13} style={{ color:C.goldL }} />
                  </div>
                  <span className="text-xs font-black uppercase" style={{ color:C.goldL, letterSpacing:"0.18em" }}>
                    {t("how_to_nav_sectors")}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    {
                      step: "1",
                      icon: <FiGrid size={18} />,
                      title: t("sectors_step1_title"),
                      desc: t("sectors_step1_desc"),
                    },
                    {
                      step: "2",
                      icon: <FiLayers size={18} />,
                      title: t("sectors_step2_title"),
                      desc: t("sectors_step2_desc"),
                    },
                    {
                      step: "3",
                      icon: <FiMapPin size={18} />,
                      title: t("sectors_step3_title"),
                      desc: t("sectors_step3_desc"),
                    },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: 0.4 + i * 0.12 }}
                      className="flex items-start gap-4 p-4 rounded-2xl"
                      style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
                      {/* step number */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                        style={{ background: i === 0 ? C.goldL : "rgba(232,184,75,0.15)", color: i === 0 ? C.navyD : C.goldL, border:`1.5px solid ${C.goldL}` }}>
                        {item.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ color:C.goldL }}>{item.icon}</span>
                          <span className="font-black text-white text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color:"rgba(255,255,255,0.55)" }}>
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background:"rgba(232,184,75,0.10)", border:"1px solid rgba(232,184,75,0.20)" }}>
                  <FiUsers size={13} style={{ color:C.goldL, flexShrink:0 }} />
                  <p className="text-xs" style={{ color:"rgba(255,255,255,0.50)" }}>
                    {t("sectors_help_tip")} <span style={{ color:C.goldL, fontWeight:700 }}>{t("sectors_reception")}</span>
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>

        {/* ══ SECTORS GRID ══ */}
        <div className="max-w-6xl mx-auto px-6 py-14">

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin"
                style={{ borderColor:`${C.gold} transparent ${C.gold} ${C.gold}` }} />
            </div>
          ) : sectors.length === 0 ? (
            <div className="text-center py-32" style={{ color:C.muted }}>
              <FiGrid size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold">{t("no_sectors_found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {sectors.map((sector, idx) => {
                const bg   = SECTOR_BG[idx % SECTOR_BG.length];
                const name = getName(sector);
                const desc = getDesc(sector);
                const img  = getSectorImage(sector);
                return (
                  <motion.div key={sector.id}
                    initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.5, delay: idx * 0.1 }}
                    whileHover={{ y:-6, transition:{ duration:0.2 } }}>
                    <Link to={`/sector/${sector.id}`} style={{ textDecoration:"none", display:"block" }}>
                      <div className="rounded-3xl overflow-hidden group cursor-pointer"
                        style={{
                          boxShadow:"0 4px 24px rgba(11,42,74,0.10)",
                          transition:"box-shadow 0.25s",
                          border:`1px solid ${C.border}`,
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow="0 24px 60px rgba(11,42,74,0.22)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow="0 4px 24px rgba(11,42,74,0.10)"}>

                        {/* image */}
                        <div style={{ position:"relative", height:"220px", overflow:"hidden" }}>
                          <img src={img} alt={name} loading="lazy"
                            style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.7s" }}
                            className="group-hover:scale-110"
                            onError={e => { e.target.src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=280&fit=crop&q=85"; }} />
                          {/* dark overlay */}
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(7,20,40,0.85) 0%, rgba(7,20,40,0.20) 60%, transparent 100%)", pointerEvents:"none" }} />

                          {/* top badges */}
                          <div style={{ position:"absolute", top:"14px", left:"14px" }}>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                              style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(8px)", letterSpacing:"0.06em" }}>
                              {t("bldg")} {sector.building}
                            </span>
                          </div>
                          <div style={{ position:"absolute", top:"14px", right:"14px" }}>
                            <span className="text-xs font-black px-3 py-1.5 rounded-full"
                              style={{ background:C.goldL, color:C.navyD, letterSpacing:"0.04em" }}>
                              {sector.departmentCount || 0} {t("depts_abbr")}
                            </span>
                          </div>

                          {/* bottom — sector number */}
                          <div style={{ position:"absolute", bottom:"14px", left:"14px" }}>
                            <span className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                              style={{ background:"rgba(200,150,30,0.20)", color:C.goldL, border:"1px solid rgba(232,184,75,0.30)", letterSpacing:"0.12em" }}>
                              {t("ministry_sector")} {idx+1}
                            </span>
                          </div>
                        </div>

                        {/* body */}
                        <div style={{ background:C.white, padding:"24px" }}>
                          <h3 className="font-extrabold text-xl mb-2 leading-snug" style={{ color:C.text }}>
                            {name}
                          </h3>
                          <p className="text-sm leading-relaxed mb-5" style={{ color:C.sub }}>
                            {desc.length > 110 ? desc.substring(0,110)+"…" : desc}
                          </p>

                          {/* meta row */}
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color:C.muted }}>
                              <FiMapPin size={12} style={{ color:C.gold }} />
                              {t("building")} {sector.building}
                            </div>
                            {sector.avgRating && (
                              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color:C.gold }}>
                                <FiStar size={12} style={{ fill:C.gold }} />
                                {typeof sector.avgRating === "number" ? sector.avgRating.toFixed(1) : sector.avgRating}
                              </div>
                            )}
                          </div>

                          {/* CTA */}
                          <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl group-hover:opacity-90 transition-opacity"
                            style={{ background:`linear-gradient(90deg, ${C.navy}, ${C.navyL})` }}>
                            <span className="text-sm font-extrabold text-white" style={{ letterSpacing:"0.04em" }}>
                              {t("browse_sector")}
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background:"rgba(255,255,255,0.15)" }}>
                              <FiArrowRight size={15} color="#fff" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* info strip */}
          {!loading && sectors.length > 0 && (
            <motion.div className="mt-14 rounded-3xl overflow-hidden"
              style={{ background:`linear-gradient(135deg, ${C.navyD}, ${C.navy})`, border:"1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.5 }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-7">
                <div>
                  <h3 className="text-lg font-black text-white mb-1">
                    {t("need_guidance")}
                  </h3>
                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.50)" }}>
                    {t("guidance_sub")} A {t("or_building_b", undefined) || "or Building B"}.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <a href="mailto:contact@mint.gov.et"
                    className="px-6 py-3 rounded-2xl text-sm font-bold"
                    style={{ background:C.goldL, color:C.navyD, textDecoration:"none" }}>
                    {t("contact_us")}
                  </a>
                  <a href="tel:+251111265737"
                    className="px-6 py-3 rounded-2xl text-sm font-bold"
                    style={{ background:"rgba(255,255,255,0.10)", color:"#fff", textDecoration:"none", border:"1px solid rgba(255,255,255,0.20)" }}>
                    {t("contact_support")}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
