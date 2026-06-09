import { NextResponse } from "next/server";
import PizZip from "pizzip";
import { prisma } from "../../../../../../lib/prisma";
import { downloadStorageFile } from "../../../../../../lib/supabase-admin";
import { getDocumentArchiveLabel } from "../../../../../../lib/document-archive";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function sanitizeZipSegment(value: string) {
  return value
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function buildZipFilename(
  displayName: string | null,
  originalFilename: string,
  index: number
) {
  const sourceName = displayName?.trim() || originalFilename;
  const safeName = sanitizeZipSegment(sourceName) || `document_${index + 1}`;

  if (safeName.includes(".")) {
    return `${index + 1}_${safeName}`;
  }

  const extension = originalFilename.includes(".")
    ? originalFilename.slice(originalFilename.lastIndexOf("."))
    : "";

  return `${index + 1}_${safeName}${extension}`;
}

async function downloadDocumentBuffer(documentItem: {
  storageProvider: string;
  storagePath: string | null;
  storageUrl: string | null;
}) {
  if (documentItem.storageProvider === "supabase_storage") {
    if (!documentItem.storagePath) {
      throw new Error("Document storage path is missing.");
    }

    return downloadStorageFile(documentItem.storagePath);
  }

  if (!documentItem.storageUrl) {
    throw new Error("Document storage URL is missing.");
  }

  const response = await fetch(documentItem.storageUrl);

  if (!response.ok) {
    throw new Error("Failed to download external document.");
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Case ID is required." }, { status: 400 });
  }

  const caseItem = await prisma.case.findUnique({
    where: { id },
    select: {
      caseCode: true,
      reference: true,
      documents: {
        orderBy: [{ archiveFolder: "asc" }, { createdAt: "asc" }],
        select: {
          displayName: true,
          originalFilename: true,
          storageProvider: true,
          storagePath: true,
          storageUrl: true,
          archiveFolder: true,
          isFinal: true,
        },
      },
    },
  });

  if (!caseItem) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const documents = caseItem.documents.filter(
    (documentItem) => documentItem.storagePath || documentItem.storageUrl
  );

  if (documents.length === 0) {
    return NextResponse.json(
      { error: "No downloadable documents found." },
      { status: 404 }
    );
  }

  try {
    const zip = new PizZip();

    for (let index = 0; index < documents.length; index++) {
      const documentItem = documents[index];
      const folderName = documentItem.isFinal
        ? "7.Final"
        : getDocumentArchiveLabel(documentItem.archiveFolder, "0.Unfiled");
      const zipPath = `${sanitizeZipSegment(folderName)}/${buildZipFilename(
        documentItem.displayName,
        documentItem.originalFilename,
        index
      )}`;

      zip.file(zipPath, await downloadDocumentBuffer(documentItem));
    }

    const zipBuffer = zip.generate({ type: "nodebuffer" });
    const filename = sanitizeZipSegment(
      `${caseItem.reference || caseItem.caseCode}_documents.zip`
    );

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download document archive failed:", error);
    return NextResponse.json(
      { error: "Failed to build document archive." },
      { status: 500 }
    );
  }
}
