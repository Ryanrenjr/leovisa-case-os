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
      pdfPath: true,
      pdfUrl: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (!invoice.pdfPath) {
    if (invoice.pdfUrl) {
      return NextResponse.redirect(invoice.pdfUrl);
    }

    return NextResponse.json({ error: "Invoice PDF path is missing." }, { status: 404 });
  }

  try {
    const signedUrl = await createStorageSignedUrl(invoice.pdfPath, 60 * 10);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Create invoice PDF signed URL failed:", error);
    return NextResponse.json({ error: "Failed to create signed URL." }, { status: 500 });
  }
}
