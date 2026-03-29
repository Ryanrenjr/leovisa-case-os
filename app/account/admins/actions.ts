"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getAdminSessionUserId } from "../../../lib/auth";

async function requireAdminRole() {
  const currentAdminUserId = await getAdminSessionUserId();

  if (!currentAdminUserId) {
    redirect("/login");
  }

  const currentUser = await prisma.adminUser.findUnique({
    where: { id: currentAdminUserId },
    select: {
      id: true,
      isActive: true,
      role: true,
    },
  });

  if (!currentUser || !currentUser.isActive) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/");
  }

  return currentUser;
}

export async function createAdminAction(formData: FormData) {
  const currentAdminUserId = await getAdminSessionUserId();

  if (!currentAdminUserId) {
    redirect("/login");
  }

  const name = formData.get("name")?.toString().trim() || "";
const email = formData.get("email")?.toString().trim().toLowerCase() || "";
const password = formData.get("password")?.toString().trim() || "";
const role = formData.get("role")?.toString().trim() || "consultant";

  if (!name || !email || !password) {
    redirect("/account/admins?error=missing_fields");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingAdmin) {
    redirect("/account/admins?error=email_exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === "admin" ? "admin" : "consultant",
      isActive: true,
    },
  });

  redirect("/account/admins?success=created");
}

export async function toggleAdminStatusAction(formData: FormData) {
  const currentUser = await requireAdminRole();

  const adminId = formData.get("adminId")?.toString().trim() || "";

  if (!adminId) {
    redirect("/account/admins");
  }

  if (adminId === currentUser.id) {
    redirect("/account/admins?error=cannot_disable_self");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!existingAdmin) {
    redirect("/account/admins");
  }

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      isActive: !existingAdmin.isActive,
    },
  });

  redirect("/account/admins?success=updated");
}

export async function resetAdminPasswordAction(formData: FormData) {
  const currentAdminUserId = await getAdminSessionUserId();

  if (!currentAdminUserId) {
    redirect("/login");
  }

  const adminId = formData.get("adminId")?.toString().trim() || "";
  const newPassword = formData.get("newPassword")?.toString().trim() || "";

  if (!adminId || !newPassword) {
    redirect("/account/admins?error=missing_fields");
  }

  if (newPassword.length < 8) {
    redirect("/account/admins?error=password_too_short");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
    },
  });

  if (!existingAdmin) {
    redirect("/account/admins");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      passwordHash,
    },
  });

  redirect("/account/admins?success=password_reset");
}

export async function deleteAdminAction(formData: FormData) {
  const currentAdminUserId = await getAdminSessionUserId();

  if (!currentAdminUserId) {
    redirect("/login");
  }

  const adminId = formData.get("adminId")?.toString().trim() || "";

  if (!adminId) {
    redirect("/account/admins");
  }

  if (adminId === currentAdminUserId) {
    redirect("/account/admins?error=cannot_delete_self");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
    },
  });

  if (!existingAdmin) {
    redirect("/account/admins");
  }

  await prisma.adminUser.delete({
    where: { id: adminId },
  });

  redirect("/account/admins?success=deleted");
}