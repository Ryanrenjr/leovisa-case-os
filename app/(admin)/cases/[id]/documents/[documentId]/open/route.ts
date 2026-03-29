import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../../../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    documentId: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

export async function GET(request: Request, context: RouteContext) {
  const { id, documentId } = await context.params;

  if (!id || !documentId || !supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.redirect(new URL(`/cases/${id}`, request.url), 303);
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      caseId: true,
      storageProvider: true,
      storagePath: true,
    },
  });

  if (!document || document.caseId !== id || !document.storagePath) {
    return NextResponse.redirect(new URL(`/cases/${id}`, request.url), 303);
  }

  if (document.storageProvider !== "supabase_storage") {
    return NextResponse.redirect(new URL(`/cases/${id}`, request.url), 303);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(document.storagePath, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.redirect(new URL(`/cases/${id}`, request.url), 303);
  }

  return NextResponse.redirect(data.signedUrl, 303);
}