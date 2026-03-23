import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "./actions";
import { getLangFromCookie } from "../../../../lib/i18n";

export default async function NewClientPage() {
  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-6">
          <Link
            href="/clients"
            className="text-sm font-medium text-[#6b7684] hover:text-[#3182f6]"
          >
            {lang === "zh" ? "← 返回客户列表" : "← Back to Clients"}
          </Link>
        </div>

        <div className="toss-card max-w-3xl p-8">
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

          <form action={createClient} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "中文名" : "Chinese Name"}
                </label>
                <input
                  type="text"
                  name="chineseName"
                  className="w-full px-4 py-3"
                  placeholder={lang === "zh" ? "例如：张三" : "e.g. Zhang San"}
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "英文名" : "English Name"}
                </label>
                <input
                  type="text"
                  name="englishName"
                  className="w-full px-4 py-3"
                  placeholder={lang === "zh" ? "例如：San Zhang" : "e.g. San Zhang"}
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3"
                  placeholder="e.g. sanzhang@example.com"
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "电话" : "Phone"}
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-3"
                  placeholder="e.g. +44 7123 456789"
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">WeChat</label>
                <input
                  type="text"
                  name="wechat"
                  className="w-full px-4 py-3"
                  placeholder="e.g. sanzhang_wechat"
                />
              </div>

              <div>
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "国籍" : "Nationality"}
                </label>
                <select
                  name="nationality"
                  defaultValue=""
                  className="w-full px-4 py-3"
                >
                  <option value="" disabled>
                    {lang === "zh" ? "请选择国籍" : "Select nationality"}
                  </option>
                  <option value="Chinese">Chinese</option>
                  <option value="British">British</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="toss-label mb-3 block">
                  {lang === "zh" ? "备注" : "Notes"}
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full px-4 py-3"
                  placeholder={lang === "zh" ? "客户备注..." : "Client notes..."}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
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
      </div>
    </main>
  );
}