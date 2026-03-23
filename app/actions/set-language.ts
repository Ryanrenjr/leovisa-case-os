"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Lang } from "../../lib/i18n";

export async function setLanguage(formData: FormData) {
  const lang = (formData.get("lang")?.toString() || "en") as Lang;
  const redirectTo = formData.get("redirectTo")?.toString() || "/";

  const cookieStore = await cookies();
  cookieStore.set("lang", lang === "zh" ? "zh" : "en", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  redirect(redirectTo);
}