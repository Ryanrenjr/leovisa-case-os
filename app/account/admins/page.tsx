import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { getAdminSessionUserId } from "../../../lib/auth";
import { getLangFromCookie } from "../../../lib/i18n";
import ConfirmSubmitButton from "../../../components/ConfirmSubmitButton";
import {
  createAdminAction,
  toggleAdminStatusAction,
  resetAdminPasswordAction,
  deleteAdminAction,
} from "./actions";

type AdminsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const adminUserId = await getAdminSessionUserId();

  if (!adminUserId) {
    redirect("/login");
  }

  const currentAdmin = await prisma.adminUser.findUnique({
  where: { id: adminUserId },
  select: {
    id: true,
    isActive: true,
    name: true,
    email: true,
    role: true,
  },
});

  if (!currentAdmin || !currentAdmin.isActive) {
    redirect("/login");
  }

  if (currentAdmin.role !== "admin") {
  redirect("/");
}

  const cookieStore = await cookies();
  const lang = getLangFromCookie(cookieStore.get("lang")?.value);

  const params = await searchParams;
  const error = params.error || "";
  const success = params.success || "";

  const admins = await prisma.adminUser.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  let errorMessage = "";
  if (error === "missing_fields") {
    errorMessage =
      lang === "zh" ? "请填写完整信息。" : "Please complete all fields.";
  } else if (error === "email_exists") {
    errorMessage = lang === "zh" ? "该邮箱已存在。" : "This email already exists.";
  } else if (error === "cannot_disable_self") {
    errorMessage =
      lang === "zh"
        ? "不能停用当前登录账号。"
        : "You cannot disable the currently signed-in account.";
  } else if (error === "password_too_short") {
    errorMessage =
      lang === "zh"
        ? "新密码至少需要 8 位。"
        : "New password must be at least 8 characters.";
  } else if (error === "cannot_delete_self") {
    errorMessage =
      lang === "zh"
        ? "不能删除当前登录账号。"
        : "You cannot delete the currently signed-in account.";
  }

  let successMessage = "";
  if (success === "created") {
    successMessage =
      lang === "zh" ? "管理员创建成功。" : "Admin created successfully.";
  } else if (success === "updated") {
    successMessage =
      lang === "zh"
        ? "管理员状态已更新。"
        : "Admin status updated successfully.";
  } else if (success === "password_reset") {
    successMessage =
      lang === "zh"
        ? "管理员密码已重置。"
        : "Admin password reset successfully.";
  } else if (success === "deleted") {
    successMessage =
      lang === "zh" ? "管理员已删除。" : "Admin deleted successfully.";
  }

  return (
    <main className="toss-page">
      <div className="toss-container">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center text-sm font-semibold text-[#6b7684] hover:text-[#3182f6]"
            >
              {lang === "zh" ? "← 返回后台首页" : "← Back to Dashboard"}
            </Link>

            <h1 className="toss-title">
              {lang === "zh" ? "管理员管理" : "Admin Management"}
            </h1>
            <p className="toss-subtitle">
              {lang === "zh"
                ? "查看、创建和管理后台管理员账号。"
                : "View, create, and manage admin accounts."}
            </p>
          </div>
        </div>

        {!!errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">{errorMessage}</p>
          </div>
        )}

        {!!successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">
              {successMessage}
            </p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_1.4fr]">
          <div className="toss-card p-7">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "新增管理员" : "Create Admin"}
            </h2>

            <form action={createAdminAction} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                  {lang === "zh" ? "姓名" : "Name"}
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                  {lang === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#6b7684]">
                  {lang === "zh" ? "初始密码" : "Initial Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                  required
                />
              </div>

              <div>
  <label className="mb-2 block text-sm font-medium text-[#6b7684]">
    {lang === "zh" ? "账号角色" : "Account Role"}
  </label>
  <select
    name="role"
    defaultValue="consultant"
    className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
  >
    <option value="consultant">
      {lang === "zh" ? "顾问" : "Consultant"}
    </option>
    <option value="admin">
      {lang === "zh" ? "管理员" : "Admin"}
    </option>
  </select>
</div>

              <button
                type="submit"
                className="toss-primary-button px-6 py-3 text-sm font-semibold"
              >
                {lang === "zh" ? "创建管理员" : "Create Admin"}
              </button>
            </form>
          </div>

          <div className="toss-card p-7">
            <h2 className="mb-6 text-[24px] font-bold tracking-[-0.02em] text-[#191f28]">
              {lang === "zh" ? "管理员列表" : "Admin List"}
            </h2>

            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="rounded-2xl border border-[#eef1f4] bg-[#fafbfc] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[18px] font-semibold text-[#191f28]">
                        {admin.name}
                        {admin.id === currentAdmin.id && (
                          <span className="ml-2 text-sm font-medium text-[#8b95a1]">
                            {lang === "zh" ? "(当前账号)" : "(Current)"}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-[14px] text-[#6b7280]">
                        {admin.email}
                      </p>
                      <p className="mt-2 text-[14px] text-[#8b95a1]">
                        {lang === "zh" ? "角色" : "Role"}: {admin.role}
                      </p>
                      <p className="mt-1 text-[14px] text-[#8b95a1]">
                        {lang === "zh" ? "创建时间" : "Created At"}:{" "}
                        {new Date(admin.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <form action={toggleAdminStatusAction}>
                        <input type="hidden" name="adminId" value={admin.id} />
                        <button
                          type="submit"
                          className={
                            admin.isActive
                              ? "inline-flex items-center justify-center rounded-2xl border border-[#ffe0e0] bg-[#fff8f8] px-4 py-2 text-sm font-semibold text-[#e85d5d] hover:bg-[#fff1f1]"
                              : "inline-flex items-center justify-center rounded-2xl border border-[#dbe7ff] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#3563e9] hover:bg-[#e8f0ff]"
                          }
                        >
                          {admin.isActive
                            ? lang === "zh"
                              ? "停用"
                              : "Disable"
                            : lang === "zh"
                            ? "启用"
                            : "Enable"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[20px] border border-[#eef1f4] bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-[#191f28]">
                      {lang === "zh" ? "重置密码" : "Reset Password"}
                    </p>

                    <form action={resetAdminPasswordAction} className="space-y-3">
                      <input type="hidden" name="adminId" value={admin.id} />

                      <input
                        type="password"
                        name="newPassword"
                        placeholder={
                          lang === "zh"
                            ? "输入新的临时密码"
                            : "Enter a new temporary password"
                        }
                        className="w-full rounded-2xl border border-[#dfe3e8] bg-white px-4 py-3 text-[15px] text-[#191f28] outline-none"
                        required
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="toss-secondary-button px-4 py-3 text-sm font-semibold"
                        >
                          {lang === "zh" ? "重置密码" : "Reset Password"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <form action={deleteAdminAction}>
                      <input type="hidden" name="adminId" value={admin.id} />
                      <ConfirmSubmitButton
                        label={lang === "zh" ? "删除管理员" : "Delete Admin"}
                        confirmMessage={
                          lang === "zh"
                            ? "确认要删除这个管理员吗？此操作无法撤销。"
                            : "Are you sure you want to delete this admin? This action cannot be undone."
                        }
                        className="toss-danger-button px-4 py-3 text-sm font-semibold"
                      />
                    </form>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <p className="text-[15px] text-[#8b95a1]">
                  {lang === "zh" ? "暂无管理员。" : "No admins found."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}