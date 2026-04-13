import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type ClientCareLetterData = {
  ClientName: string;
  Date: string;
  CaseRef: string;
  VisaType: string;
  ApplicationLocation: string;
  Nationality: string;
  DateOfBirth: string;
  Passport: string;
  TotalFee: string;
  Deposit: string;
  Balance: string;
  CaseSummary: string;
};

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

  const output = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return output;
}
