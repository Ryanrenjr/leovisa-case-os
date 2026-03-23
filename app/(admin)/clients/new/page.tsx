import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "./actions";
import { getLangFromCookie } from "../../../../lib/i18n";

export default async function NewClientPage() {
  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-white/70 underline underline-offset-4"
        >
          {lang === "zh" ? "← 返回客户列表" : "← Back to Clients"}
        </Link>
      </div>

      <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            {lang === "zh" ? "新建客户" : "Create Client"}
          </h1>
          <p className="text-white/60">
            {lang === "zh"
              ? "创建一个新的客户档案。"
              : "Create a new client profile."}
          </p>
        </div>

        <form action={createClient} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "中文名" : "Chinese Name"}
              </label>
              <input
                type="text"
                name="chineseName"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder={lang === "zh" ? "例如：张三" : "e.g. Zhang San"}
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "英文名" : "English Name"}
              </label>
              <input
                type="text"
                name="englishName"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder={lang === "zh" ? "例如：San Zhang" : "e.g. San Zhang"}
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "邮箱" : "Email"}
              </label>
              <input
                type="email"
                name="email"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. sanzhang@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "电话" : "Phone"}
              </label>
              <input
                type="text"
                name="phone"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. +44 7123 456789"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">WeChat</label>
              <input
                type="text"
                name="wechat"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="e.g. sanzhang_wechat"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "国籍" : "Nationality"}
              </label>
              <select
                name="nationality"
                defaultValue=""
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="" disabled>
                  {lang === "zh" ? "请选择国籍" : "Select nationality"}
                </option>
                <option value="Chinese">Chinese</option>
                <option value="British">British</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-2">
                {lang === "zh" ? "备注" : "Notes"}
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder={lang === "zh" ? "客户备注..." : "Client notes..."}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-white text-black px-6 py-3 font-medium"
            >
              {lang === "zh" ? "创建客户" : "Create Client"}
            </button>

            <Link
              href="/clients"
              className="rounded-lg border border-white/10 px-6 py-3 text-white/80 hover:bg-white/10"
            >
              {lang === "zh" ? "取消" : "Cancel"}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}