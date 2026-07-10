import React, { createContext, useState, useEffect, useMemo } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  // Invalidate sector/dept cache on mount so language-aware data is always fresh
  useEffect(() => {
    import("../services/cache").then(({ cache }) => {
      cache.invalidate("sectors:public");
      cache.invalidate("departments:all");
    });
  }, []);

  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem("preferredLanguage", code);
    // Invalidate cache so pages re-fetch with correct language context
    import("../services/cache").then(({ cache }) => {
      cache.invalidate("sectors:public");
      cache.invalidate("departments:all");
      for (let i = 1; i <= 20; i++) cache.invalidate(`sectors:public:${i}`);
    });
  };

  const value = useMemo(() => ({ language, changeLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
