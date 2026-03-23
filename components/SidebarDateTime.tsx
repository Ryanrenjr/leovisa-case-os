"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../lib/i18n";

type SidebarDateTimeProps = {
  lang: Lang;
};

export default function SidebarDateTime({ lang }: SidebarDateTimeProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dateText =
    lang === "zh"
      ? now.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
          weekday: "long",
        })
      : now.toLocaleDateString("en-GB", {
          month: "long",
          day: "numeric",
          weekday: "long",
        });

  const timeText = now.toLocaleTimeString(lang === "zh" ? "zh-CN" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mb-8 rounded-[28px] border border-[#e8edf3] bg-[#f8fafc] p-5">
      <p className="text-[15px] font-semibold text-[#8b95a1]">{dateText}</p>
      <h2 className="mt-2 text-[40px] font-extrabold tracking-[-0.04em] text-[#111827]">
        {timeText}
      </h2>
    </div>
  );
}