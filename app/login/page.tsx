import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { loginAction } from "./actions";
import { getAdminSessionUserId } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getLangFromCookie } from "../../lib/i18n";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const adminUserId = await getAdminSessionUserId();

  if (adminUserId) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (adminUser && adminUser.isActive) {
      redirect("/");
    }
  }

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const params = await searchParams;
  const error = params.error || "";

  let errorMessage = "";

  if (error === "missing_fields") {
    errorMessage =
      lang === "zh"
        ? "请输入邮箱和密码。"
        : "Please enter your email and password.";
  } else if (error === "invalid_credentials") {
    errorMessage =
      lang === "zh" ? "邮箱或密码错误。" : "Invalid email or password.";
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-6 py-12 text-[#191f28]">
      <div className="mx-auto max-w-md">
        <div className="rounded-[28px] border border-[#e8edf3] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center rounded-full bg-[#eef4ff] px-4 py-1.5 text-sm font-semibold text-[#3563e9]">
              LeoVisa
            </div>

            <h1 className="text-[36px] font-extrabold tracking-[-0.04em] text-[#191f28]">
              {lang === "zh" ? "管理员登录" : "Admin Login"}
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[#6b7684]">
              {lang === "zh"
                ? "登录后进入 LeoVisa Case OS 后台。"
                : "Sign in to access LeoVisa Case OS."}
            </p>
          </div>

          {!!errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          <form action={loginAction} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                {lang === "zh" ? "邮箱" : "Email"}
              </label>
              <input
                type="email"
                name="email"
                className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                placeholder="admin@leovisa.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                {lang === "zh" ? "密码" : "Password"}
              </label>
              <input
                type="password"
                name="password"
                className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                placeholder={lang === "zh" ? "请输入密码" : "Enter your password"}
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#3182f6] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(49,130,246,0.28)] hover:opacity-95"
            >
              {lang === "zh" ? "登录" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-[#8b95a1] hover:text-[#3563e9]"
            >
              {lang === "zh" ? "返回" : "Back"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}