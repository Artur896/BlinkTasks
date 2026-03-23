import { useState, useEffect, useCallback, createContext, useContext } from "react";

export const ThemeContext = createContext(null);

function detectTheme() {
  const saved = localStorage.getItem("blinktasks_theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const THEMES = {
  dark: {
    "--bg":        "#0a0a0f",
    "--surface":   "#13131a",
    "--surface2":  "#1c1c27",
    "--border":    "#2a2a3d",
    "--border2":   "#3a3a55",
    "--text":      "#f0f0fa",
    "--muted":     "#6b6b8a",
    "--subtle":    "#3a3a55",
    "--accent":    "#7c6dff",
    "--accent2":   "#a78bfa",
    "--green":     "#22d3a5",
    "--red":       "#ff5f6d",
    "--amber":     "#f59e0b",
    "--overlay":   "rgba(0,0,0,0.82)",
    "--card-bg":   "#13131a",
    "--input-bg":  "#0a0a0f",
    "--shadow":    "0 24px 60px rgba(0,0,0,0.6)",
  },
  light: {
    "--bg":        "#1a1625",
    "--surface":   "#231e32",
    "--surface2":  "#2c2640",
    "--border":    "#3d3560",
    "--border2":   "#524a78",
    "--text":      "#eeeaff",
    "--muted":     "#9b94c4",
    "--subtle":    "#6b6494",
    "--accent":    "#a78bfa",
    "--accent2":   "#c4b5fd",
    "--green":     "#34d9b3",
    "--red":       "#ff6b78",
    "--amber":     "#fbbf24",
    "--overlay":   "rgba(10, 8, 24, 0.75)",
    "--card-bg":   "#231e32",
    "--input-bg":  "#1a1625",
    "--shadow":    "0 24px 60px rgba(0,0,0,0.5)",
  },
};

function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(THEMES[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(detectTheme);

  useEffect(() => { applyTheme(theme); }, [theme]);

  // Sincronizar con cambios del sistema
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("blinktasks_theme")) {
        const next = e.matches ? "dark" : "light";
        setThemeState(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("blinktasks_theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}