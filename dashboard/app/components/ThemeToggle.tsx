"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const isDark = saved ? saved === "dark" : typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(!!isDark);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", !!isDark);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next ? "dark" : "light");
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next);
    }
  };

  return (
    <button
      onClick={toggle}
      className="ml-auto rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-1 hover:bg-gray-100 dark:hover:bg-neutral-800"
      aria-label="Toggle theme"
    >
      {dark ? "Dark" : "Light"}
    </button>
  );
}
