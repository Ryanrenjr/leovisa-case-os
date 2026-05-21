import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type ClientCareLetterData = {
  ClientName: string;
  Date: string;
  CaseRef: string;
  VisaType: string;
  InstructionBullets?: string[];
  ApplicationLocation: string;
  Nationality: string;
  DateOfBirth: string;
  Passport: string;
  TotalFee: string;
  Deposit: string;
  Balance: string;
  CaseSummary: string;
};

const paragraphPattern = /<w:p\b[\s\S]*?<\/w:p>/g;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraphText(paragraphXml: string) {
  return Array.from(paragraphXml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
    .map((match) => match[1])
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTextRuns(value: string) {
  return value
    .split(/\r?\n/)
    .map((line, index) => {
      const lineBreak = index === 0 ? "" : "<w:br/>";
      return `${lineBreak}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`;
    })
    .join("");
}

function buildParagraph(value: string, options: { indent?: boolean } = {}) {
  const indent = options.indent
    ? '<w:ind w:left="720" w:hanging="360"/>'
    : "";

  return [
    "<w:p>",
    `<w:pPr>${indent}<w:rPr><w:color w:val="000000"/><w:sz w:val="24"/></w:rPr></w:pPr>`,
    `<w:r><w:rPr><w:color w:val="000000"/><w:sz w:val="24"/></w:rPr>${buildTextRuns(value)}</w:r>`,
    "</w:p>",
  ].join("");
}

function replaceParagraphRange(
  xml: string,
  shouldStartReplaceAfter: (text: string) => boolean,
  shouldStopBefore: (text: string) => boolean,
  replacementParagraphs: string[]
) {
  const paragraphs = Array.from(xml.matchAll(paragraphPattern)).map((match) => ({
    xml: match[0],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
    text: paragraphText(match[0]),
  }));

  const anchorIndex = paragraphs.findIndex((paragraph) =>
    shouldStartReplaceAfter(paragraph.text)
  );

  if (anchorIndex === -1) {
    return xml;
  }

  const startIndex = anchorIndex + 1;
  const endIndex = paragraphs.findIndex(
    (paragraph, index) => index >= startIndex && shouldStopBefore(paragraph.text)
  );

  if (endIndex === -1 || !paragraphs[startIndex] || !paragraphs[endIndex]) {
    return xml;
  }

  return `${xml.slice(0, paragraphs[startIndex].start)}${replacementParagraphs.join(
    ""
  )}${xml.slice(paragraphs[endIndex].start)}`;
}

function injectDynamicContractSections(
  documentXml: string,
  data: ClientCareLetterData
) {
  let output = documentXml;

  const instructionParagraphs = (data.InstructionBullets ?? [])
    .filter((item) => item.trim())
    .map((item) => buildParagraph(`• ${item.trim()}`, { indent: true }));

  if (instructionParagraphs.length > 0) {
    output = replaceParagraphRange(
      output,
      (text) => text.includes("when you instructed me to act for you in connection with"),
      (text) => text.startsWith("We discussed the feasibility"),
      instructionParagraphs
    );
  }

  const caseSummaryParagraphs = data.CaseSummary.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => buildParagraph(line.startsWith("•") ? line : `• ${line}`, { indent: true }));

  if (caseSummaryParagraphs.length > 0) {
    output = replaceParagraphRange(
      output,
      (text) => text.includes("the key elements of your case are"),
      (text) => text.startsWith("Please be aware that"),
      caseSummaryParagraphs
    );
  }

  return output;
}

export async function generateClientCareLetter(
  data: ClientCareLetterData
): Promise<Buffer> {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "client-care-letter-template.docx"
  );

  const templateBinary = await fs.readFile(templatePath, "binary");
  const zip = new PizZip(templateBinary);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render({
    ClientName: data.ClientName || "",
    Date: data.Date || "",
    CaseRef: data.CaseRef || "",
    VisaType: data.VisaType || "",
    ApplicationLocation: data.ApplicationLocation || "outside UK",
    Nationality: data.Nationality || "",
    DateOfBirth: data.DateOfBirth || "",
    Passport: data.Passport || "",
    TotalFee: data.TotalFee || "",
    Deposit: data.Deposit || "",
    Balance: data.Balance || "",
    CaseSummary: data.CaseSummary || "",
  });

  const documentFile = doc.getZip().file("word/document.xml");
  if (documentFile) {
    const documentXml = documentFile.asText();
    doc
      .getZip()
      .file("word/document.xml", injectDynamicContractSections(documentXml, data));
  }

  const output = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return output;
}
