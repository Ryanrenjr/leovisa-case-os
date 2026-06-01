"use client";

import { useEffect, useState } from "react";

export default function ScrollTopButton({ lang }: { lang: "en" | "zh" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 480);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#3182f6] text-lg font-bold text-white shadow-[0_12px_32px_rgba(49,130,246,0.35)] hover:bg-[#1b64da]"
      aria-label={lang === "zh" ? "回到顶部" : "Back to top"}
      title={lang === "zh" ? "回到顶部" : "Back to top"}
    >
      ↑
    </button>
  );
}
