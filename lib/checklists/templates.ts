export type DocumentChecklistTemplateItem = {
  label: string;
  description?: string;
  isRequired?: boolean;
};

export type DocumentChecklistTemplateSection = {
  id: string;
  titleZh: string;
  titleEn: string;
  items: DocumentChecklistTemplateItem[];
};

export type DocumentChecklistTemplate = {
  key: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  sections: DocumentChecklistTemplateSection[];
};

export type EditableChecklistTemplateItem = DocumentChecklistTemplateItem & {
  id: string;
  sectionTitleZh: string;
  sectionTitleEn: string;
};

function item(
  label: string,
  description?: string,
  isRequired = true
): DocumentChecklistTemplateItem {
  return { label, description, isRequired };
}

export const documentChecklistTemplates: DocumentChecklistTemplate[] = [
  {
    key: "spouse_visa_overseas",
    titleZh: "配偶签证材料清单（境外首签）",
    titleEn: "Spouse Visa Documents Checklist, Overseas",
    descriptionZh: "用于境外配偶签证首次申请，包含身份、关系、语言、肺结核、资金和住房材料。",
    descriptionEn:
      "For first-time overseas spouse visa applications, covering identity, relationship, English, TB, finances, and accommodation evidence.",
    sections: [
      {
        id: "applicant_sponsor",
        titleZh: "申请人及担保人",
        titleEn: "Applicant and Sponsor",
        items: [
          item("申请人及孩子的护照（原件）", "Applicant's passport and any child's passport, original."),
          item("担保人护照复印件", "UK sponsor's passport copy. Original passport is not required."),
          item(
            "申请人与担保人的关系证明",
            "Marriage certificate with certified translation if needed, plus consent letter or family/friends letters confirming the relationship. Letters should include the writer's contact details."
          ),
          item("英语考试通过证书", "English language certificate."),
          item("肺结核检查报告（新做的，原件）", "Pre-departure Tuberculosis detection report, original."),
          item(
            "英国担保人 6 个月银行账单",
            "6 months bank statements prior to the application submission date, updated to within 1 month before submission."
          ),
          item("孩子出生证及护照", "Birth certificate and passport for any child applicant.", false),
          item(
            "英国住房证明或租房合同",
            "Land registry or tenancy agreement under the UK sponsor's name. Include floor plan where available."
          ),
          item(
            "真实关系及共同生活证据",
            "Evidence of genuine relationship and living together/contact, such as flight tickets, call records, emails, letters, money transfer receipts, parcels, photos, and travel photos."
          ),
          item(
            "双方个人陈述",
            "Personal statements from each of you explaining when and how you met, and when and how the relationship began."
          ),
        ],
      },
    ],
  },
  {
    key: "spouse_visa_renewal",
    titleZh: "配偶签证材料清单（续签）",
    titleEn: "Spouse Visa Documents Checklist, Renewal",
    descriptionZh: "用于配偶签证续签，突出需要更新的银行账单、共同生活证据和个人陈述。",
    descriptionEn:
      "For spouse visa extensions, focusing on renewed bank statements, relationship evidence, and personal statements.",
    sections: [
      {
        id: "renewal_documents",
        titleZh: "续签材料",
        titleEn: "Renewal Documents",
        items: [
          item("申请人的护照（原件）", "Applicant's passport, original."),
          item("担保人护照复印件", "UK sponsor's passport copy. Original passport is not required."),
          item("结婚证", "Marriage certificate."),
          item(
            "Renew：英国担保人 6 个月银行账单",
            "6 months bank statements prior to the application submission date, updated to within 1 month before submission."
          ),
          item(
            "Renew：真实关系及共同生活证据",
            "Evidence of genuine relationship, living together, and regular contact, such as bills, letters, flight tickets, call records, emails, money transfer receipts, parcels, photos, and travel photos."
          ),
          item(
            "Renew：双方个人陈述",
            "Personal statements from each of you explaining when and how you met, and when and how the relationship began."
          ),
        ],
      },
    ],
  },
  {
    key: "overseas_representative_renewal_2025",
    titleZh: "海外首席代表续签材料清单（2025）",
    titleEn: "Sole Representative Extension Documents Checklist, 2025",
    descriptionZh: "用于海外首席代表续签，按个人、陪伴申请人、分公司和母公司材料分组。",
    descriptionEn:
      "For sole representative extension applications, grouped by personal, dependant, branch, and parent-company documents.",
    sections: [
      {
        id: "personal",
        titleZh: "个人部分",
        titleEn: "Personal Documents",
        items: [
          item("所有申请人护照（原件）"),
          item("所有申请人签证卡（原件）+ eVisa / Share code"),
          item("申请表 + cover letter（李尔王移民准备）"),
          item("主申请人工资单（原件，过去 12 个月）+ P60（原件，过去 3 年）"),
          item("主申请人接受工资的个人银行对账单（原件，过去 12 个月）"),
          item("主申请人和母公司的雇佣合同"),
        ],
      },
      {
        id: "dependants",
        titleZh: "陪伴申请人",
        titleEn: "Dependants",
        items: [
          item("结婚证（原件）+ 公证/正规翻译"),
          item("所有陪伴子女的出生证（原件）+ 公证/正规翻译"),
          item(
            "配偶和主申请人的同居证明",
            "例如同一地址的水电煤账单、电话、网络、地税、保险、GP、医院、政府、银行、学校账单或来信等；每人至少 6 份，尽量覆盖这 2 年。"
          ),
          item("租房协议或购房证明（需有足够房间）"),
        ],
      },
      {
        id: "uk_branch",
        titleZh: "分公司提供",
        titleEn: "UK Branch Documents",
        items: [
          item("公司注册文件（打印件）"),
          item("分公司开始运营至今每个税年一本的会计年结", "Full Accounts, signed by accountant and company responsible person."),
          item("分公司开始运营至今的公司账户银行对账单（原件或打印版）"),
          item("分公司开始运营至今的 CT600（tax return form）"),
          item("公司大股东依然是母公司的证明", "Current Appointment Report + share certificate, downloadable from Companies House."),
          item("分公司开始运营至今的 Company confirmation statement", "Previously AR01 annual return."),
          item("分公司开始运营至今的 VAT 申报记录（如有）", undefined, false),
          item("公司运营证据：invoices、bills、商业保险等"),
          item("营业场所的租赁契约（原件，如果有）", undefined, false),
          item("会计信", "说明会计、控股人、占股比例、经营人、工资结构和人数等。"),
        ],
      },
      {
        id: "parent_company",
        titleZh: "母公司提供",
        titleEn: "Parent Company Documents",
        items: [
          item("雇主支持信", "落款日期在签证递交前最后一个月内。"),
          item("母公司公司注册文件公证或翻译件", "用于证明母公司主体依然位于英国之外。"),
        ],
      },
    ],
  },
  {
    key: "skilled_worker_2023",
    titleZh: "英国工签材料清单（2023）",
    titleEn: "Skilled Worker Documents Checklist, 2023",
    descriptionZh: "用于英国 Skilled Worker 工签申请，包含主申请人个人文件、旅行史、资金、TB 和雇主 CoS/合同材料。",
    descriptionEn:
      "For UK Skilled Worker applications, covering applicant identity, travel history, maintenance, TB, and employer CoS/contract documents.",
    sections: [
      {
        id: "applicant_documents",
        titleZh: "主申请人文件和信息",
        titleEn: "Applicant Documents and Information",
        items: [
          item("所有护照原件"),
          item("目前的英国签证或 BRP 卡正反面"),
          item("过去 10 年的世界旅行史和相关签证", "包含英国或其他国家的旅行史。"),
          item("英语证书（雅思 B1）"),
          item("申请人的生活费证明", "最近 3 个月银行对账单或存款证明，每人不低于 1270 英镑，并有不低于 3 个月存款历史。"),
          item("中国身份证（正反面）"),
          item("肺结核检查报告 (Tuberculosis test)", "如适用，请到 UKVI 认可诊所预约并完成检查。"),
          item("预计的英国住址", "用于入境后在附近邮局取居留卡。"),
          item("计划来英的时间", "会决定入境许可开始的时间。"),
        ],
      },
      {
        id: "employer_documents",
        titleZh: "雇主文件和信息",
        titleEn: "Employer Documents and Information",
        items: [
          item("担保函（CoS letter）", "需包含工作合同开始和结束时间、年薪、分红或补助、工作具体内容。"),
          item("雇佣合同"),
        ],
      },
    ],
  },
  {
    key: "set_lr_10_year",
    titleZh: "十年永居材料清单（SET LR）",
    titleEn: "SET (LR) 10-Year Long Residence Checklist",
    descriptionZh: "用于十年合法居留永居申请，覆盖护照、BRP、Life in the UK、出入境记录、银行账单、学历、住宿和支持信。",
    descriptionEn:
      "For SET (LR) 10-year long residence applications, covering passports, BRP, Life in the UK, absences, bank statements, degrees, accommodation, and supporting letters.",
    sections: [
      {
        id: "set_lr_documents",
        titleZh: "申请材料",
        titleEn: "Application Documents",
        items: [
          item("申请人的所有护照原件"),
          item("BRP card / 签证卡"),
          item("Life in the UK"),
          item("过去十年的出入境记录清单", "按照护照列表，包含出境和入境的具体年月日及原因。"),
          item("申请人银行对账单", "过去 3 个月，最后一张必须更新到申请前一个月内。"),
          item("在英期间的所有学位证明"),
          item("住宿证明", "房产所有权证明或租房合同。"),
          item("支持信", "可由配偶、朋友、老师、同事、雇主/前雇主或当地议员出信，说明支持申请人继续在英国生活。", false),
          item("犯罪记录说明", "如有任何犯罪记录或交通违法，请详细说明。", false),
        ],
      },
    ],
  },
  {
    key: "visitor_visa",
    titleZh: "Visitor 访问签证材料清单",
    titleEn: "Visitor Visa Documents Checklist",
    descriptionZh: "用于英国访问签证申请，覆盖护照、婚姻关系、资金、收入、住宿行程、资产、犯罪记录和邀请人材料。",
    descriptionEn:
      "For UK visitor visa applications, covering passports, relationship evidence, funds, income, accommodation/travel plans, assets, criminal history, and invitation evidence.",
    sections: [
      {
        id: "visitor_documents",
        titleZh: "访问签证文件",
        titleEn: "Visitor Documents",
        items: [
          item("所有护照原件（全本）"),
          item("结婚证和翻译认证或公证", "如适用。", false),
          item("资金证明", "如银行存折、流水单；不含机票和住宿，建议按每人每天 100 镑或两人每天 150 镑乘以行程天数准备，并提供翻译。"),
          item("工资收入以及雇主证明", "Evidence of total monthly income from all employment or occupation after tax."),
          item("其他收入来源证明", "例如朋友/家人资助、存款、房租、房产等。", false),
          item("在英期间住宿和行程安排", "例如住宿预订、行程安排、担保人的租房合同。"),
          item("资产或房产证明", "如房产证等及翻译件。", false),
          item("犯罪记录说明", "如有任何犯罪记录或交通违法，请详细说明。", false),
          item("邀请函及担保人材料", "如在英有直系亲属作为担保人，需提供担保人邀请函、护照、BRP 及亲属关系证明。", false),
        ],
      },
      {
        id: "visitor_notes",
        titleZh: "文件备注",
        titleEn: "Document Notes",
        items: [
          item("中文文件翻译或公证件", "所有中文文件如户口本、存折、各类证明信等需要正规翻译或公证件。"),
          item("抬头纸证明信", "官方或雇主开具的证明信必须用有完整联系方式的抬头纸打印。"),
          item("所有提交文件复印件", "所有文件必须同时提交一份复印件。"),
        ],
      },
    ],
  },
  {
    key: "skilled_worker_sponsor_documents",
    titleZh: "工签雇主材料清单",
    titleEn: "Skilled Worker Sponsor Documents Checklist",
    descriptionZh: "用于整理雇主配合提供的公司流水、人员、组织架构和办公场所证明。",
    descriptionEn:
      "For employer-side Skilled Worker sponsorship documents, including company bank statements, staff, organisation chart, and office evidence.",
    sections: [
      {
        id: "company_documents",
        titleZh: "公司材料",
        titleEn: "Company Documents",
        items: [
          item("公司银行流水账单", "最近 3 个月。"),
          item(
            "公司组织架构及人员说明",
            "标明 Director 或 HR 负责人、英国永居/英籍员工，以及拟招聘职位。"
          ),
          item("组织架构图", "需要标出已有岗位和拟招聘岗位，包含岗位、姓名和年薪。"),
          item(
            "员工 right to work 证明",
            "英籍员工保留护照复印件；非英籍员工保留护照和签证卡/Share code 复印件。"
          ),
          item(
            "办公场所证明",
            "正式租赁合同或 virtual office / desk / hot desk / co-working 服务合同。"
          ),
        ],
      },
    ],
  },
];

export function getDocumentChecklistTemplate(key: string) {
  return documentChecklistTemplates.find((template) => template.key === key) ?? null;
}

export function flattenDocumentChecklistTemplate(
  template: DocumentChecklistTemplate
): EditableChecklistTemplateItem[] {
  return template.sections.flatMap((section) =>
    section.items.map((templateItem, index) => ({
      id: `${section.id}_${index}`,
      sectionTitleZh: section.titleZh,
      sectionTitleEn: section.titleEn,
      label: templateItem.label,
      description: templateItem.description,
      isRequired: templateItem.isRequired ?? true,
    }))
  );
}
