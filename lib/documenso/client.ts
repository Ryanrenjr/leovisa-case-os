import { Documenso } from "@documenso/sdk-typescript";

const DOCUMENSO_DEFAULT_API_URL = "https://app.documenso.com/api/v2-beta";

export function isDocumensoConfigured() {
  return Boolean(process.env.DOCUMENSO_API_KEY?.trim());
}

export function getDocumensoApiUrl() {
  return (
    process.env.DOCUMENSO_SERVER_URL?.trim() || DOCUMENSO_DEFAULT_API_URL
  );
}

export function getDocumensoPublicUrl() {
  const explicitPublicUrl = process.env.DOCUMENSO_PUBLIC_URL?.trim();

  if (explicitPublicUrl) {
    return explicitPublicUrl.replace(/\/$/, "");
  }

  const apiUrl = new URL(getDocumensoApiUrl());
  apiUrl.pathname = apiUrl.pathname.replace(/\/api\/v[^/]+\/?$/, "/");
  apiUrl.search = "";
  apiUrl.hash = "";

  return apiUrl.toString().replace(/\/$/, "");
}

export function buildDocumensoSigningUrl(token: string) {
  return `${getDocumensoPublicUrl()}/sign/${token}`;
}

export function getDocumensoWebhookSecret() {
  return process.env.DOCUMENSO_WEBHOOK_SECRET?.trim() || "";
}

export function getDocumensoClient() {
  const apiKey = process.env.DOCUMENSO_API_KEY?.trim() || "";

  if (!apiKey) {
    throw new Error("DOCUMENSO_API_KEY is missing.");
  }

  return new Documenso({
    apiKey,
    serverURL: getDocumensoApiUrl(),
  });
}
