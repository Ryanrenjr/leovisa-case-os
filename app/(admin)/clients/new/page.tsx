import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "./actions";
import { getLangFromCookie } from "../../../../lib/i18n";

type NewClientPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const NATIONALITY_OPTIONS = [
  "Chinese",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Japanese",
  "Korean",
  "Singaporean",
  "Malaysian",
  "Thai",
  "Indian",
  "Portuguese",
  "Greek",
  "Turkish",
  "Cypriot",
  "Hungarian",
  "UAE",
  "Other",
];

export default async function NewClientPage({
  searchParams,
}: NewClientPageProps) {
  const params = await searchParams;
  const error = params.error || "";

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-6">
          <Link
            href="/clients"
            className="inline-flex items-center text-sm font-semibold text-[#6b7684] hover:text-[#3182f6]"
          >
            {lang === "zh" ? "← 返回客户列表" : "← Back to Clients"}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="toss-title">
            {lang === "zh" ? "新建客户" : "Create Client"}
          </h1>
          <p className="toss-subtitle">
            {lang === "zh"
              ? "创建一个新的客户档案。"
              : "Create a new client profile."}
          </p>
        </div>

        {error === "missing_english_name" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-600">
              {lang === "zh"
                ? "英文名不能为空，请先填写英文名。"
                : "English name is required. Please fill it in first."}
            </p>
          </div>
        )}

        <form action={createClient} className="space-y-6">
          <div className="toss-card p-7">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "基本信息" : "Basic Information"}
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "中文名" : "Chinese Name"}
                </label>
                <input
                  type="text"
                  name="chineseName"
                  className="toss-input"
                  placeholder={lang === "zh" ? "例如：张三" : "e.g. Zhang San"}
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "英文名" : "English Name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="englishName"
                  required
                  className="toss-input"
                  placeholder={lang === "zh" ? "例如：San Zhang" : "e.g. San Zhang"}
                />
                <p className="mt-2 text-xs text-[#8b95a1]">
                  {lang === "zh" ? "这是必填项。" : "This field is required."}
                </p>
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  className="toss-input"
                  placeholder="e.g. sanzhang@example.com"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "电话" : "Phone"}
                </label>
                <input
                  type="text"
                  name="phone"
                  className="toss-input"
                  placeholder="e.g. +44 7123 456789"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">WeChat</label>
                <input
                  type="text"
                  name="wechat"
                  className="toss-input"
                  placeholder="e.g. sanzhang_wechat"
                />
              </div>

              <div>
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "国籍" : "Nationality"}
                </label>
                <input
                  type="text"
                  name="nationality"
                  list="nationality-options"
                  className="toss-input"
                  placeholder={
                    lang === "zh"
                      ? "输入或搜索国籍"
                      : "Type or search nationality"
                  }
                />
                <datalist id="nationality-options">
                  {NATIONALITY_OPTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="md:col-span-2">
                <label className="toss-label mb-2 block">
                  {lang === "zh" ? "备注" : "Notes"}
                </label>
                <textarea
                  name="notes"
                  rows={5}
                  className="toss-textarea"
                  placeholder={lang === "zh" ? "客户备注..." : "Client notes..."}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="toss-primary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "创建客户" : "Create Client"}
            </button>

            <Link
              href="/clients"
              className="toss-secondary-button px-6 py-3 text-sm font-semibold"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}