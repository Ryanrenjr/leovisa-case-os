import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminSessionUserId } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { changePasswordAction } from "./actions";
import { getLangFromCookie } from "../../../lib/i18n";

type PasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function PasswordPage({
  searchParams,
}: PasswordPageProps) {
  const adminUserId = await getAdminSessionUserId();

  if (!adminUserId) {
    redirect("/login");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    select: {
      id: true,
      isActive: true,
      name: true,
      email: true,
    },
  });

  if (!adminUser || !adminUser.isActive) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const params = await searchParams;
  const error = params.error || "";
  const success = params.success || "";

  let errorMessage = "";

  if (error === "missing_fields") {
    errorMessage =
      lang === "zh" ? "请填写完整信息。" : "Please complete all fields.";
  } else if (error === "password_too_short") {
    errorMessage =
      lang === "zh"
        ? "新密码至少需要 8 位。"
        : "New password must be at least 8 characters.";
  } else if (error === "password_mismatch") {
    errorMessage =
      lang === "zh"
        ? "两次输入的新密码不一致。"
        : "New password and confirmation do not match.";
  } else if (error === "wrong_current_password") {
    errorMessage =
      lang === "zh" ? "当前密码不正确。" : "Current password is incorrect.";
  }

  const successMessage =
    success === "1"
      ? lang === "zh"
        ? "密码修改成功。"
        : "Password updated successfully."
      : "";

  return (
    <main className="toss-page">
      <div className="toss-container max-w-2xl">
        <div className="mb-8">
          <h1 className="toss-title">
            {lang === "zh" ? "修改密码" : "Change Password"}
          </h1>
          <p className="toss-subtitle">
            {lang === "zh"
              ? "更新 LeoVisa Case OS 后台管理员密码。"
              : "Update your admin password for LeoVisa Case OS."}
          </p>
        </div>

        {!!errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        {!!successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          </div>
        )}

        <div className="toss-card p-7">
          <form action={changePasswordAction} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                {lang === "zh" ? "当前密码" : "Current Password"}
              </label>
              <input
                type="password"
                name="currentPassword"
                className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                {lang === "zh" ? "新密码" : "New Password"}
              </label>
              <input
                type="password"
                name="newPassword"
                className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                {lang === "zh" ? "确认新密码" : "Confirm New Password"}
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                required
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="toss-primary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "更新密码" : "Update Password"}
              </button>

              <Link
                href="/"
                className="toss-secondary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "返回" : "Back"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
