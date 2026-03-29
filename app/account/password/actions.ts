"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getAdminSessionUserId } from "../../../lib/auth";

export async function changePasswordAction(formData: FormData) {
  const adminUserId = await getAdminSessionUserId();

  if (!adminUserId) {
    redirect("/login");
  }

  const currentPassword =
    formData.get("currentPassword")?.toString().trim() || "";
  const newPassword = formData.get("newPassword")?.toString().trim() || "";
  const confirmPassword =
    formData.get("confirmPassword")?.toString().trim() || "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/account/password?error=missing_fields");
  }

  if (newPassword.length < 8) {
    redirect("/account/password?error=password_too_short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/account/password?error=password_mismatch");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
  });

  if (!adminUser || !adminUser.isActive) {
    redirect("/login");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    adminUser.passwordHash
  );

  if (!isCurrentPasswordValid) {
    redirect("/account/password?error=wrong_current_password");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  redirect("/account/password?success=1");
}