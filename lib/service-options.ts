export type ServiceOption = {
  businessLine: "global_citizenship" | "uk_toc" | "uk_tob";
  label: string;
  value: string;
  country: string;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  // Global Citizenship
  {
    businessLine: "global_citizenship",
    label: "Greece Residency",
    value: "Greece Residency",
    country: "Greece",
  },
  {
    businessLine: "global_citizenship",
    label: "Portugal Fund",
    value: "Portugal Fund",
    country: "Portugal",
  },
  {
    businessLine: "global_citizenship",
    label: "Malta Residency",
    value: "Malta Residency",
    country: "Malta",
  },
  {
    businessLine: "global_citizenship",
    label: "Hungary Residency",
    value: "Hungary Residency",
    country: "Hungary",
  },
  {
    businessLine: "global_citizenship",
    label: "Japan Business Management",
    value: "Japan Business Management",
    country: "Japan",
  },
  {
    businessLine: "global_citizenship",
    label: "Turkey Citizenship",
    value: "Turkey Citizenship",
    country: "Turkey",
  },
  {
    businessLine: "global_citizenship",
    label: "UAE Golden Visa",
    value: "UAE Golden Visa",
    country: "UAE",
  },
  {
    businessLine: "global_citizenship",
    label: "Cyprus Residency",
    value: "Cyprus Residency",
    country: "Cyprus",
  },
  {
    businessLine: "global_citizenship",
    label: "Small Country Passport",
    value: "Small Country Passport",
    country: "Other",
  },

  // UK To C
  {
    businessLine: "uk_toc",
    label: "Skilled Worker",
    value: "Skilled Worker",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Student and PSW",
    value: "Student and PSW",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Spouse Visa",
    value: "Spouse Visa",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Visitor Visa",
    value: "Visitor Visa",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Innovator Founder",
    value: "Innovator Founder",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "High Potential Individual",
    value: "High Potential Individual",
    country: "UK",
  },
  {
    businessLine: "uk_toc",
    label: "Global Talent",
    value: "Global Talent",
    country: "UK",
  },

  // UK To B
  {
    businessLine: "uk_tob",
    label: "Sponsor License (General)",
    value: "Sponsor License (General)",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Sponsor License (Global Movement)",
    value: "Sponsor License (Global Movement)",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "CoS Issue",
    value: "CoS Issue",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Compliance Audit",
    value: "Compliance Audit",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "Sole Rep Extension and Settlement",
    value: "Sole Rep Extension and Settlement",
    country: "UK",
  },
  {
    businessLine: "uk_tob",
    label: "T1E Extension and Settlement",
    value: "T1E Extension and Settlement",
    country: "UK",
  },
];

export const BUSINESS_LINE_LABELS = {
  global_citizenship: "Global Citizenship",
  uk_toc: "UK To C",
  uk_tob: "UK To B",
} as const;

export const COUNTRY_OPTIONS = Array.from(
  new Set(SERVICE_OPTIONS.map((item) => item.country))
);