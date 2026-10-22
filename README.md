This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 递签邮件提醒

- 发件邮箱：`ryanrenjr824@gmail.com`；收件邮箱：`leovisaservice20@gmail.com`。
- 每天汇总未来 7 天内（含递签当天）的未结束案件，按紧急程度排序；没有符合条件的案件时不发邮件。复用系统现有的伦敦时区日期规则。
- 邮件包含案件编号、递签日期和系统链接，不包含客户姓名、证件或联系方式。
- `vercel.json` 配置每天 08:00 UTC 调用 `/api/cron/submission-reminders`。伦敦冬令时为 08:00，夏令时为 09:00；实际触发精度受 Vercel 套餐限制。只在生产部署自动运行。

启用步骤：

1. 用发件账号开启 Google 两步验证，然后创建应用专用密码：[Google 官方说明](https://support.google.com/accounts/answer/185833)。将密码写入本地 `.env.local` 和 Vercel Production 环境变量 `GMAIL_APP_PASSWORD`，不要使用 Gmail 登录密码，也不要提交或发送到聊天中。
2. 生成至少 32 字符的随机 `CRON_SECRET` 并配置到 Vercel Production 环境。可用 `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` 在本机生成。
3. 将 Production 的 `NEXT_PUBLIC_APP_URL` 设置为系统真实 HTTPS 地址，确认 Production 的 `DATABASE_URL` 已配置。然后部署包含本功能的版本。
4. 首次检查可通过服务端携带 `Authorization: Bearer <CRON_SECRET>` 调用上述接口。该调用会真实发信，成功后返回 `sent` 和案件数量；当天重复调用返回 `already_sent`，无待提醒案件返回 `no_reminders`。缺少配置或发送失败返回 503，鉴权失败返回 401。

系统用 PostgreSQL 事务级 advisory lock 阻止并发发送，并在现有 `AuditLog` 中记录每日成功结果，无需数据库迁移。SMTP 失败不会记录成功，可再次调用重试；Vercel Cron 不提供自动重试保证。SMTP 接收后若进程崩溃或数据库提交失败，重试仍可能重复发信，不能保证严格 exactly-once。当天成功后新增或修改的案件将在下次每日汇总反映。

本地开发服务器不会自行定时发信；也不会在打开首页时触发发送。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
