import fs from "fs/promises";
import path from "path";
import PizZip from "pizzip";

export type InvoiceLineItem = {
  quantity: string;
  description: string;
  total: string;
};

export type InvoiceData = {
  invoiceRef: string;
  invoiceDate: string;
  billTo: string;
  instructions: string;
  items: InvoiceLineItem[];
  subtotal: string;
  total: string;
};

const tablePattern = /<w:tbl[\s\S]*?<\/w:tbl>/g;
const rowPattern = /<w:tr\b[\s\S]*?<\/w:tr>/g;
const cellPattern = /<w:tc\b[\s\S]*?<\/w:tc>/g;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildTextRuns(text: string) {
  const lines = text.split(/\r?\n/);

  return lines
    .map((line, index) => {
      const lineBreak = index === 0 ? "" : "<w:br/>";
      return `${lineBreak}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`;
    })
    .join("");
}

function buildParagraph(
  text: string,
  options: {
    bold?: boolean;
    right?: boolean;
    style?: string;
  } = {}
) {
  const pStyle = options.style ? `<w:pStyle w:val="${options.style}"/>` : "";
  const justification = options.right ? '<w:jc w:val="right"/>' : "";
  const bold = options.bold ? "<w:b/><w:bCs/>" : "";
  const runProps = `<w:rPr>${bold}<w:color w:val="auto"/></w:rPr>`;

  return [
    "<w:p>",
    `<w:pPr>${pStyle}${justification}<w:rPr>${bold}<w:color w:val="auto"/></w:rPr></w:pPr>`,
    `<w:r>${runProps}${buildTextRuns(text)}</w:r>`,
    "</w:p>",
  ].join("");
}

function replaceCellContent(
  cellXml: string,
  text: string,
  options: Parameters<typeof buildParagraph>[1] = {}
) {
  const tcPr = cellXml.match(/<w:tcPr[\s\S]*?<\/w:tcPr>/)?.[0] ?? "";
  return cellXml.replace(
    /(<w:tc\b[^>]*>)[\s\S]*?(<\/w:tc>)/,
    `$1${tcPr}${buildParagraph(text, options)}$2`
  );
}

function replaceCells(
  rowXml: string,
  values: Array<{
    text: string;
    bold?: boolean;
    right?: boolean;
    style?: string;
  }>
) {
  let index = 0;

  return rowXml.replace(cellPattern, (cellXml) => {
    const value = values[index];
    index += 1;

    if (!value) {
      return cellXml;
    }

    return replaceCellContent(cellXml, value.text, value);
  });
}

function clearRowCells(rowXml: string) {
  return replaceCells(rowXml, [
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
}

function getRows(tableXml: string) {
  return tableXml.match(rowPattern) ?? [];
}

function setTableRows(tableXml: string, rows: string[]) {
  const firstRow = tableXml.search(rowPattern);
  const lastRowMatch = [...tableXml.matchAll(rowPattern)].at(-1);

  if (firstRow === -1 || !lastRowMatch?.index) {
    return tableXml;
  }

  const endOfLastRow = lastRowMatch.index + lastRowMatch[0].length;
  return `${tableXml.slice(0, firstRow)}${rows.join("")}${tableXml.slice(
    endOfLastRow
  )}`;
}

function replaceInvoiceHeaderTable(tableXml: string, data: InvoiceData) {
  const rows = getRows(tableXml);
  if (!rows[0]) {
    return tableXml;
  }

  const invoiceRef = `INVOICE REF: [${data.invoiceRef}]`;
  const row = replaceCells(rows[0], [
    { text: invoiceRef, style: "Title" },
    { text: data.invoiceDate, right: true, style: "Title" },
  ]);

  return setTableRows(tableXml, [row]);
}

function replaceBillToTable(tableXml: string, data: InvoiceData) {
  const rows = getRows(tableXml);
  if (rows.length < 2) {
    return tableXml;
  }

  const detailRow = replaceCells(rows[1]!, [
    { text: data.billTo, bold: true },
    { text: "" },
    { text: data.instructions, bold: true },
  ]);

  return setTableRows(tableXml, [rows[0]!, detailRow]);
}

function replaceLineItemsTable(tableXml: string, items: InvoiceLineItem[]) {
  const rows = getRows(tableXml);
  if (rows.length < 2) {
    return tableXml;
  }

  const templateRow = rows[1]!;
  const trailingBlankRows = rows.slice(2).map(clearRowCells);
  const itemRows = items.map((item) =>
    replaceCells(templateRow, [
      { text: item.quantity || "1" },
      { text: item.description, bold: true },
      { text: "", right: true },
      { text: item.total, right: true },
    ])
  );

  return setTableRows(tableXml, [rows[0]!, ...itemRows, ...trailingBlankRows]);
}

function replaceTotalsTable(tableXml: string, data: InvoiceData) {
  const rows = getRows(tableXml);
  if (rows.length < 3) {
    return tableXml;
  }

  const subtotalRow = replaceCells(rows[0]!, [
    { text: `Subtotal    ${data.subtotal}`, style: "TableHeading" },
    { text: "", right: true },
  ]);
  const vatRow = replaceCells(rows[1]!, [
    { text: "VAT", style: "TableHeading" },
    { text: "", right: true },
  ]);
  const totalRow = replaceCells(rows[2]!, [
    { text: `Total Due:   ${data.total}`, bold: true, style: "TableHeading" },
    { text: "", right: true },
  ]);

  return setTableRows(tableXml, [subtotalRow, vatRow, totalRow, ...rows.slice(3)]);
}

export async function generateInvoice(data: InvoiceData): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), "templates", "invoice-template.docx");
  const templateBinary = await fs.readFile(templatePath, "binary");
  const zip = new PizZip(templateBinary);
  const documentFile = zip.file("word/document.xml");

  if (!documentFile) {
    throw new Error("Invoice template is missing word/document.xml.");
  }

  let tableIndex = 0;
  const documentXml = documentFile.asText().replace(tablePattern, (tableXml) => {
    const currentIndex = tableIndex;
    tableIndex += 1;

    if (currentIndex === 0) {
      return replaceInvoiceHeaderTable(tableXml, data);
    }

    if (currentIndex === 1) {
      return replaceBillToTable(tableXml, data);
    }

    if (currentIndex === 2) {
      return replaceLineItemsTable(tableXml, data.items);
    }

    if (currentIndex === 3) {
      return replaceTotalsTable(tableXml, data);
    }

    return tableXml;
  });

  zip.file("word/document.xml", documentXml);

  return zip.generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}
