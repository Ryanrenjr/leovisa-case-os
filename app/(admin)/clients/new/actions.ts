"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function createClient(formData: FormData) {
  const chineseName = formData.get("chineseName")?.toString().trim() || "";
  const englishName = formData.get("englishName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const wechat = formData.get("wechat")?.toString().trim() || "";
  const nationality = formData.get("nationality")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!englishName) {
    redirect("/clients/new?error=missing_english_name");
  }

  const createdClient = await prisma.client.create({
  data: {
    chineseName: chineseName || "",
    englishName,
    email: email || null,
    phone: phone || null,
    wechat: wechat || null,
    nationality: nationality || null,
    notes: notes || null,
  },
});

  await prisma.auditLog.create({
    data: {
      relatedEntityType: "client",
      relatedEntityId: createdClient.id,
      actionType: "create_client",
      actorType: "user",
      success: true,
      newValue: {
  chineseName: chineseName || "",
  englishName,
  email: email || null,
  phone: phone || null,
  wechat: wechat || null,
  nationality: nationality || null,
  notes: notes || null,
},
    },
  });

  redirect("/clients");
}