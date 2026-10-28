"use client";

import React, { useEffect, useState } from "react";
import { Theme } from "@/lib/types";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let currentTheme: Theme = "light";
    try {
      const saved = localStorage.getItem("stap-theme") as Theme | null;
      if (saved === "dark" || saved === "light") {
        currentTheme = saved;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        currentTheme = "dark";
      }
    } catch {
      // Ignore localStorage exceptions
    }

    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("stap-theme", nextTheme);
    } catch {
      // Ignore
    }
  };

  const isDark = theme === "dark";
  const ariaLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      className="tg"
      id="tg"
      type="button"
      aria-label={ariaLabel}
      onClick={toggleTheme}
    >
      {mounted ? (isDark ? "☀" : "☾") : "☾"}
    </button>
  );
};

