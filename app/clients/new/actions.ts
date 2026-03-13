"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export async function createClient(formData: FormData) {
  const chineseName = formData.get("chineseName")?.toString().trim() || "";
  const englishName = formData.get("englishName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const wechat = formData.get("wechat")?.toString().trim() || "";
  const nationality = formData.get("nationality")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!chineseName || !englishName) {
    throw new Error("Chinese Name and English Name are required.");
  }

  const lastClient = await prisma.client.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      clientCode: true,
    },
  });

  let nextNumber = 1;

  if (lastClient?.clientCode) {
    const match = lastClient.clientCode.match(/CLI-(\d+)/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  const clientCode = `CLI-${String(nextNumber).padStart(4, "0")}`;

  const client = await prisma.client.create({
  data: {
    clientCode,
    chineseName,
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
    relatedEntityId: client.id,
    actionType: "create_client",
    actorType: "user",
    success: true,
    newValue: {
      clientCode: client.clientCode,
      chineseName: client.chineseName,
      englishName: client.englishName,
      nationality: client.nationality,
    },
  },
});

redirect(`/clients/${client.id}`);

}
