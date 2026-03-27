# Warrior 总卡强化分享计划

更新时间：2026-03-27

## 目标

把 `Warrior` 总卡从“只能复制链接/下载图片”的轻量分享，升级成可直接用于 Demo Day 的完整社交分享入口，并把现场口径统一到当前真实实现。

## 范围

- 新增 `Warrior` 总卡分享弹窗
- 补 `X / Telegram / Discord` 分享入口
- 在 `Warrior` 动态分享图中嵌入二维码
- 保留现有 `network` 显式传参
- 不在这次范围内引入 referral、链上浏览器直跳、埋点归因

## 实施计划

### 1. 服务端分享模型升级

状态：`已完成`

- 为 `Warrior` 分享模型补 `shareUrl`
- 为 `Warrior` 分享模型补 `qrCodeDataUrl`
- 抽出通用二维码生成器，避免和勋章分享重复造轮子

### 2. Warrior 动态分享图升级

状态：`已完成`

- 在 `Warrior` OG/Twitter 图片中加入二维码区域
- 保留原有分数、勋章摘要、网络、扫描状态等信息
- 继续使用动态图片路由输出，避免再造下载 API

### 3. Warrior 客户端分享弹窗

状态：`已完成`

- 顶部按钮改为打开分享弹窗
- 弹窗内提供：
  - `Copy Link`
  - `Download Card`
  - `Share to X`
  - `Share to Telegram`
  - `Share to Discord`
- 弹窗支持 `OG` / `Twitter` 两种预览格式切换
- 弹窗内明确说明二维码会回到站内 Warrior 页面，而不是链上浏览器
- 弹窗内保留 Discord 安全兜底口径，避免现场误讲成原生一键发送

### 4. Demo 演示引导补强

状态：`已完成`

- 在 `Warrior` 页面直接提示：主讲建议优先点开已 `BOUND` 勋章
- 明确区分：
  - `Warrior` 总卡适合展示整张战绩总览
  - `Medal` 单卡适合展示二维码验证闭环

### 5. 计划外但明确延后项

状态：`待后续`

- Warrior 二维码跳链上浏览器而非站内页面
- 分享链接带 `ref` / `campaign`
- 分享弹窗内增加平台文案模板编辑
- Discord / Telegram 更深层的原生集成

## 涉及文件

- `packages/frontend/src/app/server/warrior/qr.ts`
- `packages/frontend/src/app/server/warrior/share.ts`
- `packages/frontend/src/app/server/warrior/shareCard.tsx`
- `packages/frontend/src/app/server/warrior/medalShare.ts`
- `packages/frontend/src/app/warrior/shareClient.ts`
- `packages/frontend/src/app/warrior/[walletAddress]/components/ShareButton.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/components/WarriorShareDialog.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/components/WarriorCard.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/opengraph-image.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/twitter-image.tsx`

## 验证清单

- `pnpm --filter frontend lint`
- `pnpm --filter frontend exec tsc --noEmit`
- `pnpm --filter frontend test`

## 结果口径

完成后，`Warrior` 总卡将具备完整 Demo 能力：

- 有分享弹窗
- 有二维码
- 有 X / TG / Discord 入口
- 有平台尺寸预览切换

推荐现场打法：

- 主线先走 `BOUND` 勋章分享弹窗
- 补充再展示 `Warrior` 总卡分享弹窗
- 二维码统一表述为“回到站内实时验证页/战士页”，不要说 explorer 直跳

但以下口径仍然不能乱吹：

- “二维码直跳链上浏览器”
- “已经有 referral 增长归因”
