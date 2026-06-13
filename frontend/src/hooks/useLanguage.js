import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback object so Header.jsx doesn't crash if context isn't ready
    return {
      language: localStorage.getItem("preferredLanguage") || "en",
      changeLanguage: () => {},
    };
  }
  return context;
}
