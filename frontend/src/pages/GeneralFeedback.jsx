import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import { searchDepartments } from "../data/departmentsData";
import { feedbackService } from "../services/feedbackService";
import API from "../services/api";
import { useT } from "../hooks/useT";
import { useLanguage } from "../hooks/useLanguage";
import {
  FiStar, FiSend, FiCheckCircle, FiUser,
  FiMail, FiAlertCircle, FiMapPin,
  FiAlertTriangle, FiThumbsUp,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const T = {
  navy:"#0B2A4A", navyDark:"#071E35", navyLight:"#1C3F65",
  gold:"#C8961E", goldLight:"#E8B84B", surface:"#F0F4FA",
  card:"#FFFFFF", border:"#D8E2EF", text:"#0B2A4A",
  textSub:"#4A5568", textMuted:"#8896A6",
  red:"#DC2626", redLight:"#FEF2F2", redBorder:"#FECACA",
};

const inputStyle = {
  width:"100%", padding:"12px 16px", borderRadius:12,
  border:`1.5px solid ${T.border}`, background:T.surface,
  color:T.text, fontSize:14, outline:"none", transition:"border-color 0.2s",
};

const Field = ({ label, optional, required, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-2" style={{ color:T.text }}>
      {label}{" "}
      {optional && <span className="text-xs font-normal" style={{ color:T.textMuted }}>({optional})</span>}
      {required && <span className="text-xs font-normal" style={{ color:T.red }}> *</span>}
    </label>
    {children}
  </div>
);

const GeneralFeedback = () => {
  const navigate = useNavigate();
  const t = useT();
  const { language } = useLanguage();

  const TABS = [
    { id:"feedback",  label:t("share_experience"), icon:FiThumbsUp,     desc:t("feedback_helps") },
    { id:"complaint", label:t("system_feedback"),  icon:FiAlertTriangle, desc:t("feedback_helps") },
  ];

  const RATING_LABELS = ["", t("poor"), t("fair"), t("good"), t("very_good"), t("excellent")];

  const [activeTab,    setActiveTab]    = useState("feedback");
  const [rating,       setRating]       = useState(0);
  const [hover,        setHover]        = useState(0);
  const [comment,      setComment]      = useState("");
  const [deptQuery,    setDeptQuery]    = useState("");
  const [showSugg,     setShowSugg]     = useState(false);
  const [subject,      setSubject]      = useState("");
  const [sysMessage,   setSysMessage]   = useState("");
  const [visitorName,  setVisitorName]  = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const deptWrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!deptWrapRef.current) return;
      if (!deptWrapRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const deptSuggestions = useMemo(() => {
    const q = (deptQuery || "").trim();
    if (q.length < 2) return [];
    return searchDepartments(q).slice(0, 6);
  }, [deptQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId); setRating(0); setHover(0); setComment("");
    setDeptQuery(""); setSubject(""); setSysMessage(""); setSubmitted(false);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error(t("how_rate")); return; }
    setSubmitting(true);
    try {
      await feedbackService.create({
        department: deptQuery || "General", rating, comment,
        visitor: visitorName || "Anonymous", visitorEmail: visitorEmail || null,
      });
      toast.success(t("thank_you"));
      setSubmitted(true);
      setTimeout(() => navigate("/"), 2500);
    } catch { toast.error(t("error_submit_feedback")); }
    finally { setSubmitting(false); }
  };

  const handleSubmitSystemMsg = async (e) => {
    e.preventDefault();
    if (!subject.trim()) { toast.error(t("error_enter_subject")); return; }
    if (!sysMessage.trim()) { toast.error(t("error_enter_message")); return; }
    setSubmitting(true);
    try {
      await API.post("/system-complaints", {
        type: activeTab, subject: subject.trim(), message: sysMessage.trim(),
        visitor: visitorName || "Anonymous", visitorEmail: visitorEmail || null,
      });
      toast.success(t("thank_you"));
      setSubmitted(true);
      setTimeout(() => navigate("/"), 2500);
    } catch { toast.error(t("error_submit_try_again")); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12" style={{ background:T.surface }}>
          <motion.div className="text-center p-10 rounded-2xl max-w-md mx-4"
            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 20px 60px rgba(11,42,74,0.14)" }}
            initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:"spring", stiffness:200 }}>
            <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background:"rgba(11,42,74,0.08)" }}
              initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:260, delay:0.1 }}>
              <FiCheckCircle size={36} style={{ color:T.navy }} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ color:T.text }}>{t("thank_you")}</h2>
            <p className="text-sm mb-6" style={{ color:T.textSub }}>{t("submitted_msg")}</p>
            {activeTab === "feedback" && (
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={24} style={{ color:s<=rating?T.gold:T.border, fill:s<=rating?T.gold:"none" }} />
                ))}
              </div>
            )}
            <motion.button type="button" onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background:T.navy }} whileHover={{ opacity:0.9 }} whileTap={{ scale:0.97 }}>
              {t("return_home")}
            </motion.button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const activeRating = hover || rating;
  const currentTab = TABS.find((tb) => tb.id === activeTab);

  return (
    <Layout>
      <div className="min-h-screen py-10" style={{ background:T.surface }}>
        <div className="container mx-auto px-4 max-w-2xl">

          <motion.div className="text-center mb-8" initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color:T.text }}>{t("share_experience")}</h1>
            <p className="text-sm" style={{ color:T.textSub }}>{t("feedback_helps")}</p>
          </motion.div>

          {/* Tabs */}
          <motion.div className="grid grid-cols-2 gap-3 mb-6" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)}
                  className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl text-center transition-all"
                  style={{ background:isActive?"rgba(11,42,74,0.07)":T.card, border:`2px solid ${isActive?T.navy:T.border}`, cursor:"pointer" }}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:isActive?T.navy:T.surface }}>
                    <Icon size={17} style={{ color:isActive?"#fff":T.textMuted }} />
                  </div>
                  <span className="text-xs font-bold leading-tight" style={{ color:isActive?T.navy:T.textSub }}>{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.p key={activeTab+"-desc"} className="text-center text-xs mb-6 px-4" style={{ color:T.textMuted }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.25 }}>
            {currentTab.desc}
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} className="rounded-2xl overflow-hidden"
              style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 12px 50px rgba(11,42,74,0.12)" }}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.3 }}>
              <div style={{ height:4, background:`linear-gradient(90deg, ${T.navy}, ${T.navyLight})` }} />
              <div className="p-6 sm:p-8">

                {/* SERVICE FEEDBACK */}
                {activeTab === "feedback" && (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    <motion.div ref={deptWrapRef} className="relative" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
                      <Field label={t("dept_optional")} optional={t("optional")}>
                        <input type="text" value={deptQuery}
                          onChange={e => { setDeptQuery(e.target.value); setShowSugg(true); }}
                          onFocus={() => setShowSugg(true)} style={inputStyle}
                          placeholder={t("dept_placeholder")}
                          onFocusCapture={e => (e.target.style.borderColor=T.navy)}
                          onBlurCapture={e => (e.target.style.borderColor=T.border)} />
                      </Field>
                      <AnimatePresence>
                        {showSugg && deptSuggestions.length > 0 && (
                          <motion.div className="absolute z-20 mt-2 w-full rounded-2xl overflow-hidden"
                            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 16px 48px rgba(11,42,74,0.14)" }}
                            initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                            exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.2 }}>
                            <div className="px-4 py-2" style={{ borderBottom:`1px solid ${T.border}` }}>
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ color:T.textMuted }}>{t("recommended")}</p>
                            </div>
                            <div className="max-h-64 overflow-auto">
                              {deptSuggestions.map((d,i) => (
                                <motion.button key={d.id} type="button"
                                  onClick={() => { setDeptQuery(d.name); setShowSugg(false); }}
                                  className="w-full text-left px-4 py-3 transition-colors"
                                  style={{ borderBottom:`1px solid ${T.border}` }}
                                  onMouseEnter={e => (e.currentTarget.style.background=T.surface)}
                                  onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="font-bold text-sm truncate" style={{ color:T.text }}>{d.name}</div>
                                      <div className="text-xs mt-0.5 line-clamp-1" style={{ color:T.textSub }}>{d.description}</div>
                                    </div>
                                    <div className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                                      style={{ background:"rgba(11,42,74,0.07)", color:"#1C3F65", border:"1px solid rgba(11,42,74,0.13)" }}>
                                      <FiMapPin size={11} />{d.building}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div className="text-center" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
                      <label className="block text-sm font-semibold mb-4" style={{ color:T.text }}>
                        {t("how_rate")} <span style={{ color:T.red }}>*</span>
                      </label>
                      <div className="flex justify-center gap-3">
                        {[1,2,3,4,5].map(star => (
                          <motion.button key={star} type="button"
                            onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                            className="focus:outline-none" whileHover={{ scale:1.25 }} whileTap={{ scale:0.9 }}
                            transition={{ type:"spring", stiffness:400 }} aria-label={`${star}`}>
                            <FiStar size={36} style={{ color:star<=activeRating?T.gold:T.border, fill:star<=activeRating?T.gold:"none", transition:"color 0.15s, fill 0.15s" }} />
                          </motion.button>
                        ))}
                      </div>
                      <AnimatePresence mode="wait">
                        {activeRating > 0 && (
                          <motion.p key={activeRating} className="text-sm font-semibold mt-3" style={{ color:T.navyLight }}
                            initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }} transition={{ duration:0.2 }}>
                            {RATING_LABELS[activeRating]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
                      <Field label={t("your_feedback")} optional={t("optional")}>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                          style={{ ...inputStyle, resize:"none" }} placeholder={t("feedback_helps")}
                          onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
                      </Field>
                    </motion.div>

                    <VisitorFields t={t} visitorName={visitorName} setVisitorName={setVisitorName} visitorEmail={visitorEmail} setVisitorEmail={setVisitorEmail} />
                    <SubmitButton t={t} submitting={submitting} color={T.navy} />
                  </form>
                )}

                {/* SYSTEM FEEDBACK */}
                {activeTab === "complaint" && (
                  <form onSubmit={handleSubmitSystemMsg} className="space-y-6">
                    <motion.div className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background:"rgba(11,42,74,0.05)", border:`1px solid ${T.border}` }}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                      <FiAlertTriangle size={18} style={{ color:T.navy, flexShrink:0, marginTop:1 }} />
                      <p className="text-sm" style={{ color:T.textSub }}>{t("feedback_helps")}</p>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
                      <Field label={t("subject_label")} required>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                          style={inputStyle} placeholder={t("subject_placeholder")}
                          onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} maxLength={120} />
                      </Field>
                    </motion.div>

                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
                      <Field label={t("message_label")} required>
                        <textarea value={sysMessage} onChange={e => setSysMessage(e.target.value)} rows={5}
                          style={{ ...inputStyle, resize:"none" }}
                          placeholder={t("message_placeholder")}
                          onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
                        <p className="text-xs mt-1 text-right" style={{ color:T.textMuted }}>
                          {sysMessage.length} {t("chars_count")}
                        </p>
                      </Field>
                    </motion.div>

                    <VisitorFields t={t} visitorName={visitorName} setVisitorName={setVisitorName} visitorEmail={visitorEmail} setVisitorEmail={setVisitorEmail} />
                    <SubmitButton t={t} submitting={submitting} color={T.navy} />
                  </form>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.p className="mt-6 text-center text-xs" style={{ color:T.textMuted }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            {t("anonymous_note")}
          </motion.p>
        </div>
      </div>
    </Layout>
  );
};

const VisitorFields = ({ t, visitorName, setVisitorName, visitorEmail, setVisitorEmail }) => (
  <>
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
      <Field label={t("your_name")} optional={t("optional")}>
        <div className="relative">
          <FiUser size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.textMuted }} />
          <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)}
            style={{ ...inputStyle, paddingLeft:40 }} placeholder={t("enter_name")}
            onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
        </div>
      </Field>
    </motion.div>
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
      <Field label={t("email_label")} optional={t("optional")}>
        <div className="relative">
          <FiMail size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.textMuted }} />
          <input type="email" value={visitorEmail} onChange={e => setVisitorEmail(e.target.value)}
            style={{ ...inputStyle, paddingLeft:40 }} placeholder={t("email_placeholder")}
            onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
        </div>
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color:T.textMuted }}>
          <FiAlertCircle size={10} />{t("email_note")}
        </p>
      </Field>
    </motion.div>
  </>
);

const SubmitButton = ({ t, submitting, color }) => (
  <motion.button type="submit" disabled={submitting}
    className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ background:color }} whileHover={{ opacity:0.92 }} whileTap={{ scale:0.98 }}
    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
    {submitting ? (
      <><div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor:"rgba(255,255,255,0.6) transparent rgba(255,255,255,0.6) rgba(255,255,255,0.6)" }} />{t("submitting")}</>
    ) : (
      <><FiSend size={16} />{t("submit_feedback")}</>
    )}
  </motion.button>
);

export default GeneralFeedback;
