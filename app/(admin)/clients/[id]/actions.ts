"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

export async function updateClient(formData: FormData) {
  const clientId = formData.get("clientId")?.toString().trim() || "";
  const chineseName = formData.get("chineseName")?.toString().trim() || "";
  const englishName = formData.get("englishName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const wechat = formData.get("wechat")?.toString().trim() || "";
  const nationality = formData.get("nationality")?.toString().trim() || "";
  const notes = formData.get("notes")?.toString().trim() || "";

  if (!clientId || !chineseName) {
    throw new Error("Client ID and Chinese name are required.");
  }

  const existingClient = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      chineseName: true,
      englishName: true,
      email: true,
      phone: true,
      wechat: true,
      nationality: true,
      notes: true,
    },
  });

  if (!existingClient) {
    throw new Error("Client not found.");
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
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
      relatedEntityId: existingClient.id,
      actionType: "update_client",
      actorType: "user",
      success: true,
      oldValue: {
        chineseName: existingClient.chineseName,
        englishName: existingClient.englishName,
        email: existingClient.email,
        phone: existingClient.phone,
        wechat: existingClient.wechat,
        nationality: existingClient.nationality,
        notes: existingClient.notes,
      },
      newValue: {
        chineseName,
        englishName: englishName || null,
        email: email || null,
        phone: phone || null,
        wechat: wechat || null,
        nationality: nationality || null,
        notes: notes || null,
      },
    },
  });

  redirect(`/clients/${clientId}`);
}

export async function deleteClient(formData: FormData) {
  const clientId = formData.get("clientId")?.toString().trim() || "";

  if (!clientId) {
    throw new Error("Client ID is required.");
  }

  const existingClient = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      cases: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existingClient) {
    throw new Error("Client not found.");
  }

  if (existingClient.cases.length > 0) {
    redirect(`/clients/${clientId}?deleteError=linked_cases`);
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  await prisma.auditLog.create({
    data: {
      relatedEntityType: "client",
      relatedEntityId: existingClient.id,
      actionType: "delete_client",
      actorType: "user",
      success: true,
      oldValue: {
        chineseName: existingClient.chineseName,
        englishName: existingClient.englishName,
        email: existingClient.email,
        phone: existingClient.phone,
        wechat: existingClient.wechat,
        nationality: existingClient.nationality,
        notes: existingClient.notes,
      },
    },
  });

  redirect("/clients");
}