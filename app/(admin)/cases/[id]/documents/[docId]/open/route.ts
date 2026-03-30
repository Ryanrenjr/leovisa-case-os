import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { createClient } from "@supabase/supabase-js";

type RouteContext = {
  params: Promise<{
    id: string;
    docId: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

export async function GET(_request: Request, context: RouteContext) {
  const { docId } = await context.params;

  if (!docId) {
    return NextResponse.json(
      { error: "Document ID is required." },
      { status: 400 }
    );
  }

  const documentItem = await prisma.document.findUnique({
    where: { id: docId },
    select: {
      id: true,
      storageProvider: true,
      storagePath: true,
      storageUrl: true,
    },
  });

  if (!documentItem) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  if (documentItem.storageProvider !== "supabase_storage") {
    if (documentItem.storageUrl) {
      return NextResponse.redirect(documentItem.storageUrl);
    }

    return NextResponse.json(
      { error: "No file URL available." },
      { status: 404 }
    );
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  if (!documentItem.storagePath) {
    return NextResponse.json(
      { error: "Document storage path is missing." },
      { status: 404 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(documentItem.storagePath, 60 * 10);

  if (error || !data?.signedUrl) {
    console.error("Create document signed URL failed:", error);
    return NextResponse.json(
      { error: "Failed to create signed URL." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}