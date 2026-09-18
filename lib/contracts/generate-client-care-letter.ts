import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type ClientCareLetterData = {
  ClientName: string;
  SignatoryName?: string;
  IsCorporate?: boolean;
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

function replaceMatchingParagraph(
  xml: string,
  matches: (text: string) => boolean,
  replacement: string
) {
  return xml.replace(paragraphPattern, (paragraphXml) =>
    matches(paragraphText(paragraphXml)) ? replacement : paragraphXml
  );
}

function injectCorporateSignatory(
  documentXml: string,
  data: ClientCareLetterData
) {
  if (!data.IsCorporate || !data.SignatoryName?.trim()) {
    return documentXml;
  }

  const signatoryName = data.SignatoryName.trim();
  const clientName = data.ClientName.trim();
  let insertedPresentedBy = false;

  let output = documentXml.replace(paragraphPattern, (paragraphXml) => {
    if (!insertedPresentedBy && paragraphText(paragraphXml) === clientName) {
      insertedPresentedBy = true;
      return [
        paragraphXml,
        buildParagraph("Presented by"),
        buildParagraph(signatoryName),
      ].join("");
    }

    return paragraphXml;
  });

  output = replaceMatchingParagraph(
    output,
    (text) => text.includes("Print Name:"),
    buildParagraph(
      `Signed___________________; Print Name: ${signatoryName}  Date: ${data.Date}`
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) => text.startsWith("I,") && text.includes("agree with above terms"),
    buildParagraph(
      `I, ${signatoryName}, am the authorised representative of ${clientName} and agree with the above terms;`
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) => text.startsWith("Thank you for instructing Leo Visa Service"),
    buildParagraph(
      `Thank you for instructing Leo Visa Service to act on behalf of ${clientName} in relation to its ${data.VisaType} matter. We are authorised by the Immigration Advice Authority (IAA) to provide immigration advice and services at Level 1. Our registration number is F201100372.`
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) => text.startsWith("We are committed to providing all advice"),
    buildParagraph(
      `We are committed to providing advice and assistance to the best of our ability and to presenting the matter as strongly as possible. Any final decision will be made by the relevant authority, and we cannot guarantee a successful outcome.`
    )
  );

  return output;
}

function injectIaaRegulatoryText(documentXml: string) {
  let output = documentXml;

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.startsWith("It is essential that you disclose all matters"),
    buildParagraph(
      "It is essential that you disclose all matters relating to your case to me. This will enable me to advise you properly on your application. Any information given to us by you will be treated in the strictest confidence. However, as part of the monitoring of our activities by the Immigration Advice Authority (IAA), we are subject to regular audits of our work. As part of this audit process, the IAA will require access to our files and records. We are sure that you will recognise that the IAA has been put in place to protect the interests of both us and you, our clients. I would be grateful if you could sign one copy and return it to us."
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.startsWith("I accept the terms and conditions") &&
      text.includes("Immigration Services Commissioner"),
    buildParagraph(
      "I accept the terms and conditions as stated above. I understand that the Immigration Advice Authority (IAA) may wish to view case files handled by my adviser and give my permission for Leo Visa Service Limited to allow such access."
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.startsWith("Thank you for instructing Leo Visa Service") &&
      text.includes("Immigration Services Commissioner"),
    buildParagraph(
      "Thank you for instructing Leo Visa Service to act on your behalf in dealing with your application. We are authorised by the Immigration Advice Authority (IAA) to provide immigration advice and services at Level 1. Our registration number is F201100372."
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.startsWith("In accordance with") &&
      text.includes("Professional Indemnity Insurance"),
    buildParagraph(
      "In accordance with the requirements of the Immigration Advice Authority (IAA), we have Professional Indemnity Insurance (PII). The purpose of PII is to cover any compensation we may need to pay to correct a mistake or cover any legal costs due to negligence, misrepresentation and/or inaccurate advice which may cause, or contribute to, financial or other loss to the client."
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.includes("requires us to keep a copy of your case file for up to 6 years"),
    buildParagraph(
      "The Immigration Advice Authority (IAA) requires us to keep a copy of your case file for up to 6 years after your case is closed. After that, it may be destroyed unless you make arrangements to collect it from us."
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.startsWith("If at any stage you have any concerns") &&
      text.includes("complaint"),
    buildParagraph(
      "If at any stage you have any concerns regarding the conduct of your case, please raise them with me, preferably in writing. Please let me know if you would like full details of our complaints procedure. If we are unable to resolve matters to your satisfaction, or you wish to pursue your complaint through other channels, you are entitled to contact the Immigration Advice Authority (IAA) at any time. Its address is:"
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) => text.startsWith("Immigration Advice Authority PO BOX 567"),
    buildParagraph(
      "Immigration Advice Authority\nPO BOX 567\nDartford\nKent\nDA1 9WX\nUnited Kingdom"
    )
  );

  output = replaceMatchingParagraph(
    output,
    (text) =>
      text.includes("public body which regulates immigration advice and services within the UK"),
    buildParagraph(
      "The IAA is the public body which regulates immigration advice and services within the UK. The IAA may review your file as part of its regulatory role."
    )
  );

  return output;
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

  output = injectCorporateSignatory(output, data);
  return injectIaaRegulatoryText(output);
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
