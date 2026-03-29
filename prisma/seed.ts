import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  // 先清空旧数据（按依赖顺序删）
  await prisma.auditLog.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentSubmission.deleteMany();
  await prisma.submissionLink.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminUser.deleteMany();

  // 创建后台管理员登录账号
  const adminPassword = "Admin123456!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.adminUser.create({
    data: {
      email: "admin@leovisa.com",
      name: "LeoVisa Admin",
      passwordHash: adminPasswordHash,
      role: "admin",
      isActive: true,
    },
  });

  // 创建系统用户
  const admin = await prisma.user.create({
    data: {
      email: "admin@leovisa.test",
      name: "Admin User",
      role: "admin",
      status: "active",
    },
  });

  const consultantA = await prisma.user.create({
    data: {
      email: "consultant.a@leovisa.test",
      name: "Consultant A",
      role: "consultant",
      status: "active",
    },
  });

  const consultantB = await prisma.user.create({
    data: {
      email: "consultant.b@leovisa.test",
      name: "Consultant B",
      role: "consultant",
      status: "active",
    },
  });

  // 创建客户
  const client1 = await prisma.client.create({
    data: {
      clientCode: "CLI-0001",
      chineseName: "张三",
      englishName: "ZhangSan",
      phone: "07111111111",
      email: "zhangsan@example.com",
      wechat: "zhangsan_wechat",
      nationality: "Chinese",
      notes: "First test client",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      clientCode: "CLI-0002",
      chineseName: "李四",
      englishName: "LiSi",
      phone: "07222222222",
      email: "lisi@example.com",
      wechat: "lisi_wechat",
      nationality: "Chinese",
      notes: "Second test client",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      clientCode: "CLI-0003",
      chineseName: "王五",
      englishName: "WangWu",
      phone: "07333333333",
      email: "wangwu@example.com",
      wechat: "wangwu_wechat",
      nationality: "Chinese",
      notes: "Third test client",
    },
  });

  // 创建案件
  const case1 = await prisma.case.create({
    data: {
      caseCode: "LVS-UK-2026-0001",
      clientId: client1.id,
      serviceType: "UK Visa",
      country: "UK",
      assignedConsultantId: consultantA.id,
      status: "documents_collecting",
      contractStatus: "not_started",
      intakeStatus: "pending",
      notes: "Collecting first batch of documents",
    },
  });

  const case2 = await prisma.case.create({
    data: {
      caseCode: "LVS-ES-2026-0002",
      clientId: client2.id,
      serviceType: "Spain Golden Visa",
      country: "Spain",
      assignedConsultantId: consultantB.id,
      status: "under_review",
      contractStatus: "generated",
      intakeStatus: "received",
      notes: "Documents under review",
    },
  });

  const case3 = await prisma.case.create({
    data: {
      caseCode: "LVS-UK-2026-0003",
      clientId: client3.id,
      serviceType: "UK Visitor Visa",
      country: "UK",
      assignedConsultantId: consultantA.id,
      status: "contract_sent",
      contractStatus: "sent",
      intakeStatus: "received",
      notes: "Contract already sent to client",
    },
  });

  // 创建一个上传链接
  const submissionLink1 = await prisma.submissionLink.create({
    data: {
      caseId: case1.id,
      token: "test-token-zhangsan-001",
      status: "active",
      maxUses: 20,
      currentUses: 1,
      createdBy: admin.id,
    },
  });

  // 创建一次提交记录
  const submission1 = await prisma.documentSubmission.create({
    data: {
      caseId: case1.id,
      submissionLinkId: submissionLink1.id,
      source: "portal",
      submittedByName: "ZhangSan",
      submittedByEmail: "zhangsan@example.com",
      status: "completed",
      remarks: "Uploaded passport and bank statement",
    },
  });

  // 创建文件记录
  await prisma.document.createMany({
    data: [
      {
        caseId: case1.id,
        submissionId: submission1.id,
        docType: "passport",
        originalFilename: "passport.jpg",
        normalizedFilename: "LVS-UK-2026-0001_ZhangSan_passport_v1.jpg",
        mimeType: "image/jpeg",
        fileSize: BigInt(245000),
        versionNo: 1,
        storageProvider: "temp",
        storagePath: "/temp/LVS-UK-2026-0001/passport.jpg",
        storageUrl: "https://example.com/temp/passport.jpg",
        reviewStatus: "approved",
      },
      {
        caseId: case1.id,
        submissionId: submission1.id,
        docType: "bank_statement",
        originalFilename: "statement.pdf",
        normalizedFilename: "LVS-UK-2026-0001_ZhangSan_bank_statement_v1.pdf",
        mimeType: "application/pdf",
        fileSize: BigInt(560000),
        versionNo: 1,
        storageProvider: "temp",
        storagePath: "/temp/LVS-UK-2026-0001/statement.pdf",
        storageUrl: "https://example.com/temp/statement.pdf",
        reviewStatus: "uploaded",
      },
    ],
  });

  // 创建合同
  await prisma.contract.create({
    data: {
      caseId: case3.id,
      templateName: "client-care-letter-v1",
      versionNo: 1,
      generatedBy: admin.id,
      filePath: "/Cases/LVS-UK-2026-0003_WangWu/05_Contracts/contract_v1.pdf",
      fileUrl: "https://example.com/contracts/contract_v1.pdf",
      status: "sent",
    },
  });

  // 创建审计日志
  await prisma.auditLog.createMany({
    data: [
      {
        caseId: case1.id,
        relatedEntityType: "case",
        relatedEntityId: case1.id,
        actionType: "create_case",
        actorType: "user",
        actorId: admin.id,
        success: true,
      },
      {
        caseId: case1.id,
        relatedEntityType: "document",
        relatedEntityId: submission1.id,
        actionType: "upload_document",
        actorType: "system",
        success: true,
      },
      {
        caseId: case3.id,
        relatedEntityType: "contract",
        relatedEntityId: case3.id,
        actionType: "generate_contract",
        actorType: "user",
        actorId: admin.id,
        success: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully");
  console.log({
    adminLoginEmail: adminUser.email,
    adminLoginPassword: adminPassword,
    adminEmail: admin.email,
    consultantA: consultantA.email,
    consultantB: consultantB.email,
    cases: [case1.caseCode, case2.caseCode, case3.caseCode],
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });