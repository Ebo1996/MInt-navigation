import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/layout/Layout";
import { getDepartmentById } from "../data/departmentsData";
import { feedbackService } from "../services/feedbackService";
import { useT } from "../hooks/useT";
import {
  FiStar, FiSend, FiCheckCircle, FiArrowLeft,
  FiMapPin, FiClock, FiUser, FiMail, FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const T = {
  navy:"#0B2A4A", navyDark:"#071E35", navyLight:"#1C3F65",
  gold:"#C8961E", goldLight:"#E8B84B", surface:"#F0F4FA",
  card:"#FFFFFF", border:"#D8E2EF", text:"#0B2A4A",
  textSub:"#4A5568", textMuted:"#8896A6",
};

const inputStyle = {
  width:"100%", padding:"12px 16px", borderRadius:12,
  border:`1.5px solid ${T.border}`, background:T.surface,
  color:T.text, fontSize:14, outline:"none", transition:"border-color 0.2s",
};

const Field = ({ label, optional, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-2" style={{ color:T.text }}>
      {label}{optional && <span className="text-xs font-normal ml-1" style={{ color:T.textMuted }}>({optional})</span>}
    </label>
    {children}
  </div>
);

const Feedback = () => {
  const { deptId } = useParams();
  const navigate   = useNavigate();
  const t = useT();
  const [department, setDepartment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [comment,    setComment]    = useState("");
  const [visitorName,  setVisitorName]  = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");

  const RATING_LABELS = ["", t("poor"), t("fair"), t("good"), t("very_good"), t("excellent")];

  useEffect(() => {
    const dept = getDepartmentById(parseInt(deptId));
    setDepartment(dept);
    setLoading(false);
  }, [deptId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error(t("how_rate")); return; }
    setSubmitting(true);
    try {
      await feedbackService.create({
        department: department.id, sectorId: department.sectorId,
        building: department.building, rating, comment,
        visitor: visitorName || "Anonymous", visitorEmail: visitorEmail || null,
      });
      setSubmitted(true);
      toast.success(t("thank_you"));
      setTimeout(() => navigate(`/department/${department.id}`), 2000);
    } catch { toast.error(t("error_submit_feedback")); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background:T.surface }}>
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor:`${T.gold} transparent ${T.gold} ${T.gold}` }} />
      </div>
    </Layout>
  );

  if (!department) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center" style={{ background:T.surface }}>
        <motion.div className="text-center p-10 rounded-2xl"
          style={{ background:T.card, border:`1px solid ${T.border}` }}
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
          <h2 className="text-xl font-bold mb-3" style={{ color:T.text }}>{t("dept_not_found")}</h2>
          <Link to="/" className="text-sm font-semibold" style={{ color:T.gold }}>← {t("back_home")}</Link>
        </motion.div>
      </div>
    </Layout>
  );

  if (submitted) return (
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
          <p className="text-sm mb-5" style={{ color:T.textSub }}>{t("submitted_msg")}</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3,4,5].map(s => (
              <FiStar key={s} size={24} style={{ color:s<=rating?T.gold:T.border, fill:s<=rating?T.gold:"none" }} />
            ))}
          </div>
          <Link to={`/department/${department.id}`}
            className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background:T.navy }}>
            {t("return_dept")}
          </Link>
        </motion.div>
      </div>
    </Layout>
  );

  const activeRating = hover || rating;

  return (
    <Layout>
      <div className="min-h-screen py-10" style={{ background:T.surface }}>
        <div className="container mx-auto px-4 max-w-2xl">

          <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }}>
            <Link to={`/department/${department.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
              style={{ color:T.textSub }}>
              <FiArrowLeft size={14} /> {t("back_dept")}
            </Link>
          </motion.div>

          {/* Dept info */}
          <motion.div className="rounded-2xl p-5 mb-6"
            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 4px 20px rgba(11,42,74,0.08)" }}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.05 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  style={{ background:`linear-gradient(135deg, ${T.navy}, ${T.navyLight})` }}>
                  {department.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-base font-bold" style={{ color:T.text }}>{department.name}</h1>
                  <div className="flex items-center gap-3 text-xs mt-1" style={{ color:T.textMuted }}>
                    <span className="flex items-center gap-1"><FiMapPin size={11} style={{ color:T.gold }} />{t("bldg")} {department.building}</span>
                    <span className="w-1 h-1 rounded-full" style={{ background:T.border }} />
                    <span className="flex items-center gap-1"><FiClock size={11} style={{ color:T.gold }} />{department.walkingTime||t("walk_2min")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background:"rgba(200,150,30,0.10)", border:"1px solid rgba(200,150,30,0.22)" }}>
                <FiStar size={13} style={{ color:T.gold, fill:T.gold }} />
                <span className="font-bold text-sm" style={{ color:T.text }}>{department.rating}</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div className="rounded-2xl overflow-hidden"
            style={{ background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 8px 40px rgba(11,42,74,0.10)" }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}>
            <div style={{ height:4, background:`linear-gradient(90deg, ${T.navy}, ${T.navyLight})` }} />
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-center mb-1" style={{ color:T.text }}>{t("share_experience")}</h2>
              <p className="text-center text-sm mb-8" style={{ color:T.textSub }}>{t("feedback_helps")}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Stars */}
                <div className="text-center">
                  <label className="block text-sm font-semibold mb-4" style={{ color:T.text }}>{t("how_rate")}</label>
                  <div className="flex justify-center gap-3">
                    {[1,2,3,4,5].map(star => (
                      <motion.button key={star} type="button"
                        onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                        className="focus:outline-none" whileHover={{ scale:1.25 }} whileTap={{ scale:0.9 }}
                        transition={{ type:"spring", stiffness:400 }} aria-label={`Rate ${star}`}>
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
                </div>

                <Field label={t("your_feedback")} optional={t("optional")}>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                    style={{ ...inputStyle, resize:"none" }} placeholder={t("feedback_helps")}
                    onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
                </Field>

                <Field label={t("your_name")} optional={t("optional")}>
                  <div className="relative">
                    <FiUser size={15} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.textMuted }} />
                    <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)}
                      style={{ ...inputStyle, paddingLeft:40 }} placeholder={t("enter_name")}
                      onFocus={e => (e.target.style.borderColor=T.navy)} onBlur={e => (e.target.style.borderColor=T.border)} />
                  </div>
                </Field>

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

                <motion.button type="submit" disabled={submitting}
                  className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:T.navy }} whileHover={{ opacity:0.92 }} whileTap={{ scale:0.98 }}>
                  {submitting ? (
                    <><div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor:"rgba(255,255,255,0.6) transparent rgba(255,255,255,0.6) rgba(255,255,255,0.6)" }} />{t("submitting")}</>
                  ) : (
                    <><FiSend size={16} />{t("submit_feedback")}</>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.p className="mt-6 text-center text-xs" style={{ color:T.textMuted }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            {t("anonymous_note")}
          </motion.p>
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
