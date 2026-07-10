import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../i18n/translations";

/**
 * useT() — returns a translation function t(key)
 * Usage:  const t = useT();  then  t("nav_home")  → "Home" or "መነሻ"
 */
export function useT() {
  const ctx = useContext(LanguageContext);
  const lang = ctx?.language || localStorage.getItem("preferredLanguage") || "en";
  const dict = translations[lang] || translations["en"];

  return (key) => dict[key] ?? translations["en"][key] ?? key;
}
