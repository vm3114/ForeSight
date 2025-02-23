"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-4 left-4 p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
