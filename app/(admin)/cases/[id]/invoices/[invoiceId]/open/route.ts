import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { createStorageSignedUrl } from "../../../../../../../lib/supabase-admin";

type RouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { invoiceId } = await context.params;

  if (!invoiceId) {
    return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      filePath: true,
      fileUrl: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (!invoice.filePath) {
    if (invoice.fileUrl) {
      return NextResponse.redirect(invoice.fileUrl);
    }

    return NextResponse.json({ error: "Invoice file path is missing." }, { status: 404 });
  }

  try {
    const signedUrl = await createStorageSignedUrl(invoice.filePath, 60 * 10);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Create invoice signed URL failed:", error);
    return NextResponse.json({ error: "Failed to create signed URL." }, { status: 500 });
  }
}
