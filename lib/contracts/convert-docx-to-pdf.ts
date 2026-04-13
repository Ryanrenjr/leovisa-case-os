import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

function getPdfConverterMode() {
  if (process.env.DOCX_TO_PDF_MODE) {
    return process.env.DOCX_TO_PDF_MODE.trim().toLowerCase();
  }

  if (process.env.DOCX_TO_PDF_GOTENBERG_URL) {
    return "gotenberg";
  }

  return "libreoffice";
}

export function getPdfConverterHelpMessage() {
  return [
    "PDF conversion is not configured.",
    "Set `DOCX_TO_PDF_MODE=gotenberg` with `DOCX_TO_PDF_GOTENBERG_URL`,",
    "or install LibreOffice and set `DOCX_TO_PDF_MODE=libreoffice`.",
  ].join(" ");
}

async function convertWithGotenberg(
  fileBuffer: Buffer,
  inputFileName: string
) {
  const gotenbergUrl = process.env.DOCX_TO_PDF_GOTENBERG_URL?.trim() || "";

  if (!gotenbergUrl) {
    throw new Error(
      "DOCX_TO_PDF_GOTENBERG_URL is required when DOCX_TO_PDF_MODE=gotenberg."
    );
  }

  const formData = new FormData();
  formData.append(
    "files",
    new Blob([new Uint8Array(fileBuffer)], {
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    inputFileName
  );

  const response = await fetch(
    `${gotenbergUrl.replace(/\/$/, "")}/forms/libreoffice/convert`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gotenberg conversion failed with status ${response.status}.`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

async function convertWithLibreOffice(
  fileBuffer: Buffer,
  inputFileName: string
) {
  const officeBinary = process.env.DOCX_TO_PDF_BINARY?.trim() || "soffice";
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "case-os-docx-"));
  const inputPath = path.join(
    tempDirectory,
    `${randomUUID()}-${inputFileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  );

  await writeFile(inputPath, fileBuffer);

  try {
    const { stderr } = await execFileAsync(
      officeBinary,
      [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        tempDirectory,
        inputPath,
      ],
      {
        timeout: 60_000,
      }
    );

    const outputPath = inputPath.replace(/\.[^.]+$/, ".pdf");
    const pdfExists = await readFile(outputPath).catch(() => null);

    if (!pdfExists) {
      throw new Error(
        stderr?.trim() ||
          "LibreOffice did not produce a PDF output file."
      );
    }

    return pdfExists;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(getPdfConverterHelpMessage());
    }

    throw error;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

export async function convertDocxBufferToPdf(
  fileBuffer: Buffer,
  inputFileName = "contract.docx"
) {
  const mode = getPdfConverterMode();

  if (mode === "gotenberg") {
    return convertWithGotenberg(fileBuffer, inputFileName);
  }

  if (mode === "libreoffice") {
    return convertWithLibreOffice(fileBuffer, inputFileName);
  }

  throw new Error(
    `Unsupported DOCX_TO_PDF_MODE: ${mode}. ${getPdfConverterHelpMessage()}`
  );
}
