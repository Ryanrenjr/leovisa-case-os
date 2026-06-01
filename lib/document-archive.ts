export type DocumentArchiveFolderKey =
  | "admin"
  | "id"
  | "supporting"
  | "others"
  | "application_qa";

export type DocumentArchiveFolder = {
  key: DocumentArchiveFolderKey;
  label: string;
};

export const DOCUMENT_ARCHIVE_FOLDERS: DocumentArchiveFolder[] = [
  { key: "admin", label: "1.Admin_行政资料" },
  { key: "id", label: "2.ID_身份文件" },
  { key: "supporting", label: "3. Supporting doc_支持材料" },
  { key: "others", label: "4. Others_其他" },
  { key: "application_qa", label: "5. Application form Q&A_申请表问答" },
];

export function getDocumentArchiveFolder(key: string) {
  return DOCUMENT_ARCHIVE_FOLDERS.find((folder) => folder.key === key) ?? null;
}

export function getDocumentArchiveLabel(key: string | null, unfiled = "Unfiled") {
  if (!key) {
    return unfiled;
  }

  return getDocumentArchiveFolder(key)?.label ?? key;
}

export function buildCaseStorageFolder(caseCode: string) {
  return caseCode.replace(/[^a-zA-Z0-9._-]/g, "_");
}
