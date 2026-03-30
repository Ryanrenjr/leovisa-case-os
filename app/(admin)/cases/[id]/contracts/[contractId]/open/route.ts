import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { createClient } from "@supabase/supabase-js";

type RouteContext = {
  params: Promise<{
    id: string;
    contractId: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "client-documents";

export async function GET(_request: Request, context: RouteContext) {
  const { contractId } = await context.params;

  if (!contractId) {
    return NextResponse.json({ error: "Contract ID is required." }, { status: 400 });
  }

  const contractItem = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      id: true,
      filePath: true,
      fileUrl: true,
    },
  });

  if (!contractItem) {
    return NextResponse.json({ error: "Contract not found." }, { status: 404 });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  if (!contractItem.filePath) {
    if (contractItem.fileUrl) {
      return NextResponse.redirect(contractItem.fileUrl);
    }

    return NextResponse.json({ error: "Contract file path is missing." }, { status: 404 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(contractItem.filePath, 60 * 10);

  if (error || !data?.signedUrl) {
    console.error("Create contract signed URL failed:", error);
    return NextResponse.json({ error: "Failed to create signed URL." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}