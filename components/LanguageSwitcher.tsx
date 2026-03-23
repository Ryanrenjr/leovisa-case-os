"use client";

type LanguageSwitcherProps = {
  currentLang: "en" | "zh";
  action: (formData: FormData) => void;
  redirectTo?: string;
};

export default function LanguageSwitcher({
  currentLang,
  action,
  redirectTo = "/",
}: LanguageSwitcherProps) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <button
        type="submit"
        name="lang"
        value="en"
        className={`flex-1 rounded-[18px] px-4 py-3 text-[18px] font-semibold transition ${
          currentLang === "en"
            ? "bg-white text-[#111827] shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
            : "bg-transparent text-[#4b5563] hover:bg-white/80"
        }`}
      >
        English
      </button>

      <button
        type="submit"
        name="lang"
        value="zh"
        className={`flex-1 rounded-[18px] px-4 py-3 text-[18px] font-semibold transition ${
          currentLang === "zh"
            ? "bg-white text-[#111827] shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
            : "bg-transparent text-[#4b5563] hover:bg-white/80"
        }`}
      >
        中文
      </button>
    </form>
  );
}