export type DocumentChecklistTemplateItem = {
  label: string;
  description?: string;
  isRequired?: boolean;
  scope?: "case" | "main_applicant" | "dependants" | "per_person" | "shared";
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
  isRequired = true,
  scope: DocumentChecklistTemplateItem["scope"] = "case"
): DocumentChecklistTemplateItem {
  return { label, description, isRequired, scope };
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
    key: "naturalisation",
    titleZh: "英国入籍材料清单",
    titleEn: "British Citizenship Naturalisation Documents Checklist",
    descriptionZh:
      "用于英国 Form AN 入籍申请，覆盖身份、永居/settled status、居住和离境、Life in the UK、英语、推荐人、配偶路线和特殊情况材料。",
    descriptionEn:
      "For British citizenship by naturalisation (Form AN), covering identity, ILR/settled status, residence and absences, Life in the UK, English, referees, spouse-route evidence, and special circumstances.",
    sections: [
      {
        id: "identity_status",
        titleZh: "身份与永久居留状态",
        titleEn: "Identity and Permanent Status",
        items: [
          item("当前护照全本扫描件", "请上传个人信息页、签证页、盖章页；如有多本护照，请上传所有仍持有的护照。", true, "per_person"),
          item("过去 5 年使用过的旧护照全本扫描件", "用于核对离境记录和申请人是否在 qualifying period 第一天人在英国。", true, "per_person"),
          item("BRP/BRC 正反面或 eVisa / UKVI 账户证明", "如使用 eVisa，请提供 share code、UKVI 账户截图或能显示 ILR/settled status 的页面。", true, "per_person"),
          item(
            "永居/settled status 获批证明",
            "例如 ILR BRP、Home Office grant letter、eVisa 页面、EUSS settled status 证明、UAN 或 share code。GOV.UK 说明 BRP/BRC 在符合条件时可在卡面过期后继续用于证明身份一段时间，但应以申请时最新规则为准。",
            true,
            "per_person"
          ),
          item("中国身份证正反面", "如申请人持有中国身份证，请上传。", false, "per_person"),
          item("更名证明或姓名不一致说明", "如护照、BRP/eVisa、结婚证、学历或其他文件姓名不一致，请提供 deed poll、结婚证、户口本更名页或书面说明。", false, "per_person"),
        ],
      },
      {
        id: "residence_absences",
        titleZh: "居住与离境证明",
        titleEn: "Residence and Absence Evidence",
        items: [
          item(
            "过去 5 年离开英国记录表",
            "请列明每次离境的国家/地区、离开英国日期、返回英国日期、天数和原因；如以英国公民配偶/民事伴侣身份申请，通常准备近 3 年。",
            true,
            "per_person"
          ),
          item(
            "能证明申请人在 qualifying period 第一天人在英国的材料",
            "例如当天附近的护照入境章、机票/登机牌、GP/NHS 记录、工资单、银行交易、学校/雇主记录或其他带日期的英国记录。5 年路线看申请日前 5 年当天；英国公民配偶/民事伴侣路线看申请日前 3 年当天。",
            true,
            "main_applicant"
          ),
          item(
            "近 5 年英国地址证明",
            "例如 council tax、银行账单、水电煤账单、租约、房贷/land registry、HMRC/NHS/GP/学校/雇主信件。配偶路线通常至少覆盖近 3 年。",
            true,
            "per_person"
          ),
          item("长期离境或离境天数偏高的解释和证明", "如某次离境接近或超过 6 个月、总离境天数较高，请提供原因说明及工作、学习、医疗、家庭紧急情况等证明。", false, "per_person"),
        ],
      },
      {
        id: "koll",
        titleZh: "Life in the UK 与英语",
        titleEn: "Life in the UK and English Language",
        items: [
          item("Life in the UK test pass reference / pass notification", "请上传通过通知或截图，并填写 test reference number。", true, "per_person"),
          item("英语 B1 或以上考试证书 / reference number", "如使用 SELT，请上传证书或在线结果截图，并提供 reference number。", true, "per_person"),
          item("英语授课学位证明", "如用学位满足英语要求，请上传学位证、成绩单、ECCTIS/UK ENIC 证明（如适用）和官方翻译。", false, "per_person"),
          item("KoLL 豁免证明", "如申请人 65 岁以上或因长期身体/精神健康原因申请豁免，请提供相应医疗证明或说明。", false, "per_person"),
        ],
      },
      {
        id: "referees",
        titleZh: "推荐人材料",
        titleEn: "Referee Documents",
        items: [
          item(
            "2 位推荐人的基本信息",
            "请提供姓名、出生日期、职业、电话、邮箱、近 3 年地址、如何认识申请人和认识多久。推荐人通常需认识成年申请人至少 3 年，且至少 1 位为专业人士。",
            true,
            "main_applicant"
          ),
          item("推荐人护照信息页", "其中一位推荐人通常应持英国公民护照；请上传可显示姓名、照片和护照号的信息页。", true, "main_applicant"),
          item("推荐人专业身份或职业证明", "例如公司邮箱签名、执业资格、公司网站介绍、LinkedIn、名片、雇主信或其他能证明职业身份的材料。", true, "main_applicant"),
          item("推荐人声明/签名页", "如在线流程或顾问要求下载/上传 referee declaration，请由推荐人确认后提供。", false, "main_applicant"),
        ],
      },
      {
        id: "spouse_route",
        titleZh: "英国公民配偶/民事伴侣路线（如适用）",
        titleEn: "British Citizen Spouse or Civil Partner Route, if Applicable",
        items: [
          item("结婚证或民事伴侣证书", "非英文文件需提供正规翻译。", false, "shared"),
          item("配偶/民事伴侣的英国护照或入籍/注册证书", "GOV.UK 明确配偶/民事伴侣路线需要证明对方为英国公民。", false, "shared"),
          item("配偶/民事伴侣当前地址证明", "如双方不同住，请同时上传申请人和配偶/民事伴侣的现地址证明及原因说明。", false, "shared"),
          item("过往婚姻/民事伴侣关系结束证明", "如有前婚姻或前民事伴侣关系，请提供离婚判决、解除民事伴侣关系证明或死亡证明及翻译。", false, "shared"),
        ],
      },
      {
        id: "good_character",
        titleZh: "品格与特殊情况",
        titleEn: "Good Character and Special Circumstances",
        items: [
          item("犯罪、交通或民事处罚记录说明", "如有犯罪记录、警告、罚款、交通定罪、pending prosecution、civil judgment、破产、HMRC 税务问题等，请提供判决/罚单/结案文件和详细说明。", false, "per_person"),
          item("拒签、遣返、逾期滞留或移民违规说明", "如有任何国家拒签、英国移民违规、逾期、deception allegation 或 removal/deportation 记录，请提供决定信和解释。", false, "per_person"),
          item("税务和自雇材料", "如申请人自雇、公司董事或有复杂税务，请上传 SA302、tax year overview、公司账目、P60/P45、工资单或 HMRC 记录。", false, "main_applicant"),
          item("雇主/学校/专业机构支持信", "用于解释长期离境、future intention、特殊贡献或其他 discretionary 情况。", false, "main_applicant"),
        ],
      },
      {
        id: "translations_notes",
        titleZh: "翻译与上传备注",
        titleEn: "Translations and Upload Notes",
        items: [
          item("非英文/威尔士文文件的正规翻译件", "翻译件应包含译者确认、日期、签名和联系方式。"),
          item("文件命名和扫描质量", "请使用清晰彩色扫描或照片，文件名包含申请人姓名、材料名称和日期，例如 ZhangSan_Passport_2026.pdf。"),
          item("无需重复上传以往签证申请已提交材料", "GOV.UK 指出此前移民申请中已上传的材料 Home Office 通常已有记录；但如材料是本次资格判断的关键证据，仍建议上传最新版或最清晰版本。", false),
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
      scope: templateItem.scope ?? "case",
    }))
  );
}
