import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertCircle, FiSunrise, FiSun, FiMoon } from "react-icons/fi";
import { useT } from "../hooks/useT";

/* ── Design tokens ── */
const T = {
  navy:      "#0B2A4A",
  navyDark:  "#071E35",
  navyLight: "#1C3F65",
  gold:      "#C8961E",
  goldLight: "#E8B84B",
};

const AnnouncementBanner = () => {
  const t = useT();
  const [showBanner, setShowBanner] = useState(true);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  const getTimeBasedAnnouncement = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return {
      type: "morning",
      icon: <FiSunrise size={18} />,
      title: t("good_morning"),
      message: t("good_morning_msg"),
    };
    if (hour >= 12 && hour < 17) return {
      type: "afternoon",
      icon: <FiSun size={18} />,
      title: t("afternoon"),
      message: t("afternoon_msg"),
    };
    return {
      type: "evening",
      icon: <FiMoon size={18} />,
      title: t("evening"),
      message: t("evening_msg"),
    };
  };

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("announcementDismissed");
    if (isDismissed === "true") {
      setShowBanner(false);
      return;
    }
    setCurrentAnnouncement(getTimeBasedAnnouncement());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("announcementDismissed", "true");
  };

  if (!showBanner || !currentAnnouncement) return null;

  const isEmergency = currentAnnouncement.type === "emergency";

  const bannerBg     = isEmergency ? "#FFF0CC" : "#FFF8E6";
  const bannerBorder = isEmergency ? "#E8A800" : "#D4A017";
  const titleColor   = isEmergency ? "#7A3A00" : "#5A3A00";
  const msgColor     = isEmergency ? "#8B4500" : "#6B4400";
  const iconColor    = isEmergency ? "#C8700A" : "#C8961E";

  return (
    <AnimatePresence>
      <motion.div
        style={{ background: bannerBg, borderBottom: `2px solid ${bannerBorder}` }}
        initial={{ opacity: 0, y: -36 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -36 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">

              {/* Icon */}
              <div className="flex-shrink-0">
                {isEmergency ? (
                  <motion.div
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FiAlertCircle size={20} style={{ color: iconColor }} />
                  </motion.div>
                ) : (
                  React.cloneElement(currentAnnouncement.icon, { style: { color: iconColor } })
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-extrabold text-xs uppercase tracking-widest"
                    style={{ color: titleColor, letterSpacing: "0.12em" }}
                  >
                    {currentAnnouncement.title}
                  </span>
                  <span className="text-sm truncate" style={{ color: msgColor }}>
                    {currentAnnouncement.message}
                  </span>
                </div>
              </div>
            </div>

            {/* Dismiss */}
            <motion.button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: titleColor, background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Dismiss"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
