# Demo Day V2 社交分享功能对照表

更新时间：2026-03-27  
判断口径：基于当前工作区代码状态，包括未提交改动。

## 一句话结论

这套“社交分享版”不是没做，而是已经做出了两条分享链路：

1. `Warrior Profile` 总卡分享：有动态分享图、OG/Twitter metadata、分享弹窗、X/TG/Discord 入口、复制链接、下载卡片、二维码。
2. `Medal Share` 单勋章分享：有弹窗预览、X/TG/Discord 分享入口、二维码、落地验证页、动态分享图。

如果按你这版 5 分钟讲稿原样验收：

- 按“核心能力是否存在”看：大约 `75%` 已经具备
- 按“是不是完全照着这版话术演”看：大约 `60% - 70%`

核心原因很简单：

- 强社交那部分，主要已经落在“单枚勋章分享”上
- `Warrior` 总卡现在也已经有完整分享弹窗，但最适合主讲的仍然是单枚勋章分享链路
- 二维码已经有了，但目前跳的是站内勋章验证页，不是链上浏览器

## 功能对照矩阵

| Demo 诉求 | 当前状态 | 结论 | 说明 |
| --- | --- | --- | --- |
| 链上行为转勋章 | 已有 | 已实现 | 现有 Chronicle 已覆盖 `gate`、`turret`、`SSU`、`assembly` 等行为，并映射为勋章 |
| 动态生成分享卡片 | 已有 | 已实现 | `Warrior` 总卡和 `Medal` 单卡都可动态生成图片 |
| 平台预览图 metadata | 已有 | 已实现 | `canonical`、`openGraph`、`twitter` 都已接上 |
| 针对不同平台尺寸优化 | 已有 | 已实现 | 已分别生成 `opengraph-image` 和 `twitter-image` 两套尺寸 |
| “点击 Share 弹出很炸的社交卡片” | 已有 | 已实现 | `Warrior` 总卡和单枚勋章现在都有分享弹窗，但更适合主讲的依然是勋章弹窗 |
| X 分享入口 | 已有 | 已实现 | `Warrior` 总卡和勋章分享弹窗都已接入 |
| Telegram 分享入口 | 已有 | 已实现 | `Warrior` 总卡和勋章分享弹窗都已接入 |
| Discord 分享入口 | 已有 | 部分实现 | 两条链路都做了安全兜底：先复制链接，再打开 Discord，由用户粘贴发送，不是原生一键发消息 |
| 分享卡片带二维码 | 已有 | 已实现 | `Warrior` 总卡和 `Medal` 单卡都已带 QR |
| 扫码进入 Web App 验证页 | 已有 | 已实现 | 勋章卡 QR 会落到对应的勋章验证页 |
| 扫码直接进入链上浏览器 | 没有 | 未实现 | 现在不是直跳 Suivision 或链上 explorer |
| “这不是 P 的图”的验证闭环 | 已有基础 | 部分实现 | 站内验证页会重新拉 Chronicle 快照和链上状态，但还不是直接 explorer proof |
| 流量入口 / referral 入口 | 没有 | 未实现 | 当前链接没有 referral 参数，也没有邀请链路 |
| 分享链接显式带 network | 已有 | 已实现 | 分享相关 URL 已显式追加 `?network=`，不再隐式吃默认网络 |

## 已落地能力

### 1. Warrior 总卡分享

已落地内容：

- 动态页面 metadata
- `Open Graph` 大图
- `Twitter` 大图
- 分享弹窗
- 复制带 `network` 的分享链接
- 下载当前分享图
- `Share to X`
- `Share to Telegram`
- `Share to Discord`
- 二维码
- `OG` / `Twitter` 预览切换

对应代码：

- `packages/frontend/src/app/warrior/[walletAddress]/page.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/opengraph-image.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/twitter-image.tsx`
- `packages/frontend/src/app/server/warrior/share.ts`
- `packages/frontend/src/app/server/warrior/shareCard.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/components/ShareButton.tsx`

当前不足：

- `Warrior` 总卡的验证闭环不如单勋章链路直观
- 二维码仍然回站内页面，不是链上浏览器
- Discord 仍然是复制后打开的安全兜底

### 2. 单枚勋章分享

已落地内容：

- 点击已 `BOUND` 的勋章，会弹出分享弹窗
- 弹窗内可预览分享卡
- 支持 `Copy Link`
- 支持 `Download Card`
- 支持 `Share to X`
- 支持 `Share to Telegram`
- 支持 `Share to Discord` 兜底流程
- 卡片内嵌 QR Code
- 扫码落到勋章验证页
- 勋章页会重新展示 Chronicle 证据和当前状态

对应代码：

- `packages/frontend/src/app/warrior/[walletAddress]/components/MedalRoster.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/components/MedalShareDialog.tsx`
- `packages/frontend/src/app/server/warrior/medalShare.ts`
- `packages/frontend/src/app/server/warrior/medalShareCard.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/medals/[slug]/page.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/medals/[slug]/opengraph-image.tsx`
- `packages/frontend/src/app/warrior/[walletAddress]/medals/[slug]/twitter-image.tsx`

这条链路基本已经是你讲稿里最像样、最能打的一部分。

## 和讲稿逐段对照

### 1. 痛点与使命

这段主要是叙事，不靠代码，不存在实现问题。

### 2. 产品亮点

#### 动态生成勋章分享卡

已实现。

#### 全平台适配

部分实现。

原因：

- 技术上已有 `OG` / `Twitter` 两套图片输出
- `Warrior` 与勋章分享弹窗都已有 `X` / `TG` / `Discord` 分享入口
- `Warrior` 弹窗已有平台尺寸预览切换
- 但最适合现场主讲的仍然是带验证落地页的勋章分享链路

#### 二维码验证

部分实现。

原因：

- 勋章卡已有二维码
- 扫码可落到验证页
- 但不是你文案里说的“直接跳链上浏览器”

### 3. 现场演示动作

#### 动作 1：演示玩家触发勋章

基础能力已存在，但你文案里的勋章名称要注意。

当前代码里和 `gate` 最直接相关的是：

- `Galactic Courier / 星际物流商`：累计 `10` 次 `gate::jump`

不是字面上的“星门拓荒者”。  
如果你要讲“星门拓荒者”，建议现场口播改成当前真实勋章名，别自己给自己埋雷。

#### 动作 2：点击 Share，跳出极具视觉冲击力的卡片

部分实现。

最稳的演法依然不是先点 `Warrior` 顶部分享按钮，而是：

1. 打开 `Warrior Profile`
2. 点击一枚已 `BOUND` 的勋章
3. 弹出 `Medal Share Dialog`

这样你才能展示：

- 社交分享弹窗
- 卡片预览
- X / TG / Discord 操作
- QR Code

如果你先点 `Warrior` 顶部按钮，现在也能看到完整分享弹窗，但视觉和“验证闭环”的冲击力还是不如单勋章分享链路。

#### 动作 3：现场分享到 X 或 Demo 群

部分实现，但可演。

推荐做法：

- 优先演 `Share to X`
- 或演 `Share to Telegram`
- Discord 现在是“复制链接 + 打开 Discord”兜底，不适合吹成原生一键发送

#### 动作 4：扫描二维码，跳转到验证页

已实现，但话术要修正。

你现在能现场演的是：

- 扫二维码
- 打开站内勋章验证页
- 页面里重新展示该勋章的 Chronicle 证据、状态、钱包、网络、角色等信息

你现在不能准确宣称的是：

- “二维码直接跳链上浏览器”

### 4. 商业与增长

叙事上能成立，但技术上还没真正做到 referral。

目前更准确的说法应该是：

- 每一枚勋章都是一个可传播、可验证、可回流到产品页面的入口

不应该直接说：

- 已经有邀请裂变
- 已经有 referral 跟踪

因为代码里还没有这部分。

## 明天 Demo 最稳的演法

建议你把分享主线改成“勋章分享”而不是“Warrior 总卡分享”。

### 推荐演示路径

1. 先展示 Chronicle 页面或 Warrior 页面，证明该玩家已经拿到某枚 `BOUND` 勋章
2. 点击那枚勋章，弹出 `Medal Share Dialog`
3. 在弹窗里展示卡片预览
4. 点击 `Share to X` 或 `Share to Telegram`
5. 再扫卡片上的二维码
6. 落到勋章验证页，展示状态和证据

### 推荐现场话术

- “我们已经把链上与索引里的 Frontier 行为，压缩成了一张可传播的勋章社交卡。”
- “这不是一张静态海报，扫码之后会回到验证页，重新拉取 Chronicle 证据和链上状态。”
- “我们已经打通了 X、Telegram、Discord 的传播入口，其中 Discord 走的是安全复制兜底。”

### 不建议现场硬讲的话

- “二维码直达链上浏览器”
- “这已经是 referral 增长链路”

这几句现在都容易穿帮。

## 如果要完全贴合 V2，还差哪几刀

优先级从高到低如下：

1. 把二维码落点从站内验证页升级成“验证页 + explorer 出口”，或者直接按你的文案改成 explorer
2. 给分享链接补 `ref` / `campaign` 参数，才谈得上真正增长归因
3. 给分享弹窗补平台文案模板编辑，方便现场直接发社交文案
4. 统一所有站内入口的 `network` 透传，避免跨网络演示时翻车

## 当前验证状态

已知通过：

- `pnpm --filter frontend lint`
- `pnpm --filter frontend exec tsc --noEmit`
- `pnpm --filter frontend test`

未完全确认：

- `pnpm --filter frontend build`

当前观察是生产构建在沙箱里会卡在 `Creating an optimized production build ...`，还没有明确定位完是不是这次分享改动导致。

## 关键风险提醒

### 1. `NEXT_PUBLIC_SITE_URL` 必须正确

不然分享图和 metadata 的绝对地址会错，社交平台抓卡片时容易翻车。

### 2. 某些站内入口仍未显式带 `network`

分享链路本身已经显式带 `?network=`，但部分站内跳转入口还是走默认网络。  
如果你明天 Demo 就跑 `testnet`，问题不大；如果要切别的网络，最好再统一补齐。

### 3. Discord 不是原生一键发

它现在是安全兜底，不是深度集成。

## 总结

如果你明天就上台，这套东西已经足够支撑一版“强化社交分享”的 Demo，但最稳的主角应该是“单枚勋章分享卡”，不是 `Warrior` 顶部那个总卡分享按钮。

一句话说透：

`社交传播链路现在已经能完整演，最强主角依然是单枚勋章分享卡；别把还没做的 explorer 直跳和 referral 归因硬吹成已完成。`
