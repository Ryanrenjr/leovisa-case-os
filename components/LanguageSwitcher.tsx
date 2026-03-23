import type { Lang } from "../lib/i18n";

type LanguageSwitcherProps = {
  currentLang: Lang;
  action: (formData: FormData) => void;
  redirectTo: string;
};

export default function LanguageSwitcher({
  currentLang,
  action,
  redirectTo,
}: LanguageSwitcherProps) {
  return (
    <div className="flex gap-2">
      <form action={action}>
        <input type="hidden" name="lang" value="en" />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          className={`rounded-lg border px-3 py-2 text-sm ${
            currentLang === "en"
              ? "border-white/20 bg-white text-black"
              : "border-white/10 text-white/80 hover:bg-white/10"
          }`}
        >
          English
        </button>
      </form>

      <form action={action}>
        <input type="hidden" name="lang" value="zh" />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          className={`rounded-lg border px-3 py-2 text-sm ${
            currentLang === "zh"
              ? "border-white/20 bg-white text-black"
              : "border-white/10 text-white/80 hover:bg-white/10"
          }`}
        >
          中文
        </button>
      </form>
    </div>
  );
}