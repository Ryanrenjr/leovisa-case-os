import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { createStorageSignedUrl } from "../../../../../../../lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    id: string;
    contractId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { contractId } = await context.params;

  if (!contractId) {
    return NextResponse.json({ error: "Contract ID is required." }, { status: 400 });
  }

  const contractItem = await prisma.contract.findUnique({
    where: { id: contractId },
    select: {
      signedPdfPath: true,
      signedPdfUrl: true,
    },
  });

  if (!contractItem) {
    return NextResponse.json({ error: "Contract not found." }, { status: 404 });
  }

  if (!contractItem.signedPdfPath) {
    if (contractItem.signedPdfUrl) {
      return NextResponse.redirect(contractItem.signedPdfUrl);
    }

    return NextResponse.json(
      { error: "Signed contract file is missing." },
      { status: 404 }
    );
  }

  try {
    const signedUrl = await createStorageSignedUrl(
      contractItem.signedPdfPath,
      60 * 10
    );

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Create signed contract URL failed:", error);
    return NextResponse.json({ error: "Failed to create signed URL." }, { status: 500 });
  }
}
