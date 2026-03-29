"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { setAdminSession, clearAdminSession } from "../../lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    redirect("/login?error=missing_fields");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!adminUser || !adminUser.isActive) {
    redirect("/login?error=invalid_credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    adminUser.passwordHash
  );

  if (!isPasswordValid) {
    redirect("/login?error=invalid_credentials");
  }

  await setAdminSession(adminUser.id);

  redirect("/");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}