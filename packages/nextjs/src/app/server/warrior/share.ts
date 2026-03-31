import type { Metadata } from 'next'
import type {
  ChronicleMedalState,
  ChronicleSnapshot,
  CombatRank,
  RankTone,
} from '~~/chronicle/types'
import { APP_NAME } from '~~/config/main'
import { toAbsoluteSiteUrl } from '~~/server/site'
import { ENetwork } from '~~/types/ENetwork'
import { buildWarriorImagePath, buildWarriorSharePath } from '~~/warrior/share'
import { buildShareQrCodeDataUrl } from './qr'

export interface WarriorShareCardTone {
  primary: string
  background: string
  border: string
  glow: string
}

export interface WarriorShareMedalPreview {
  slug: string
  title: string
  subtitle: string
  status: string
  color: string
}

export interface WarriorShareCardModel {
  title: string
  titleZh: string
  description: string
  labels: {
    eyebrow: string
    verified: string
    walletUnavailable: string
    unknownWallet: string
    wallet: string
    combatScore: string
    network: string
    medalsBound: string
    character: string
    medalPreview: string
    noMedals: string
    qrAlt: string
    qrHint: string
  }
  shareUrl: string
  qrCodeDataUrl: string
  network: string
  walletAddress: string | null
  walletAddressShort: string
  characterId: string | null
  score: number
  scoreLabel: string
  medalsLabel: string
  scanLabel: string
  previewMedals: WarriorShareMedalPreview[]
  hasFullSet: boolean
  tone: WarriorShareCardTone
}

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

export const TWITTER_IMAGE_SIZE = {
  width: 1200,
  height: 600,
} as const

const RANK_TONE_MAP: Record<RankTone, WarriorShareCardTone> = {
  steel: {
    primary: '#8ea1ad',
    background: 'rgba(142,161,173,0.12)',
    border: 'rgba(142,161,173,0.28)',
    glow: 'rgba(142,161,173,0.24)',
  },
  amber: {
    primary: '#d9a441',
    background: 'rgba(217,164,65,0.12)',
    border: 'rgba(217,164,65,0.28)',
    glow: 'rgba(217,164,65,0.24)',
  },
  azure: {
    primary: '#7c919d',
    background: 'rgba(124,145,157,0.12)',
    border: 'rgba(124,145,157,0.28)',
    glow: 'rgba(124,145,157,0.24)',
  },
  martian: {
    primary: '#f0642f',
    background: 'rgba(240,100,47,0.12)',
    border: 'rgba(240,100,47,0.28)',
    glow: 'rgba(240,100,47,0.26)',
  },
  crimson: {
    primary: '#e63946',
    background: 'rgba(230,57,70,0.12)',
    border: 'rgba(230,57,70,0.28)',
    glow: 'rgba(230,57,70,0.24)',
  },
}

const MEDAL_COLOR_MAP: Record<string, string> = {
  'bloodlust-butcher': '#e63946',
  'void-pioneer': '#7c919d',
  'galactic-courier': '#4ecdc4',
  'turret-sentry': '#d9a441',
  'assembly-pioneer': '#8ea1ad',
  'turret-anchor': '#d9a441',
  'ssu-trader': '#4ecdc4',
  'fuel-feeder': '#8ea1ad',
}

const RANK_COPY = {
  'zh-CN': {
    0: {
      title: '虚空漂泊者',
      description: '当前还没有可验证的成就记录。',
    },
    1: {
      title: '边境征兵',
      description: '你踏入 Frontier 的第一批轨迹已经被记录。',
    },
    2: {
      title: '星区行动员',
      description: '多个行为域的操作存在已经被确认。',
    },
    3: {
      title: '虚空游骑兵',
      description: '你已经拥有可验证的战斗与探索履历。',
    },
    4: {
      title: '指挥先锋',
      description: '你冲在前面，成就横跨战斗、物流与基础设施。',
    },
    5: {
      title: '战主候选',
      description: '这是一股正在上升的力量，任何舰队都会重视你的履历。',
    },
    6: {
      title: '边境元帅',
      description: '经受过战火，并已在链上留下验证记录，Frontier 会记住你。',
    },
    7: {
      title: '至高主权者',
      description: '你在 Frontier 各个领域都达成了绝对统治，无可置疑。',
    },
  },
  is: {
    0: {
      title: 'Rekandi tómsins',
      description: 'Engin staðfest afrek eru enn á skrá.',
    },
    1: {
      title: 'Frontier nýliði',
      description: 'Fyrstu skrefin þín inn í Frontier hafa verið skráð.',
    },
    2: {
      title: 'Geiraaðgerðamaður',
      description: 'Virk nærvera þín yfir mörg svið hefur verið staðfest.',
    },
    3: {
      title: 'Tómsvörður',
      description: 'Reyndur aðgerðamaður með sannprófanlega bardaga- og könnunarskrá.',
    },
    4: {
      title: 'Framsveitarstjórnandi',
      description: 'Leiðir af fremstu víglínu. Afrek ná yfir bardaga, flutninga og innviði.',
    },
    5: {
      title: 'Tilvonandi stríðsherra',
      description: 'Vaxandi afl með feril sem vekur virðingu í hvaða flota sem er.',
    },
    6: {
      title: 'Frontier marskálkur',
      description: 'Hertur í bardaga og staðfestur á keðju. Frontier man eftir því.',
    },
    7: {
      title: 'Æðsti fullvaldur',
      description: 'Algjör yfirráð yfir öllum sviðum Frontier. Óumdeilanlegt.',
    },
  },
} as const

const resolveLocale = (locale?: string) =>
  locale === 'zh-CN' || locale === 'is' ? locale : 'en'

const getLocalizedRankCopy = (rank: CombatRank, locale?: string) => {
  const resolvedLocale = resolveLocale(locale)

  if (resolvedLocale === 'zh-CN') {
    return {
      secondaryTitle: rank.titleZh,
      description: RANK_COPY['zh-CN'][rank.tier].description,
    }
  }

  if (resolvedLocale === 'is') {
    return {
      secondaryTitle: RANK_COPY.is[rank.tier].title,
      description: RANK_COPY.is[rank.tier].description,
    }
  }

  return {
    secondaryTitle: rank.titleZh,
    description: rank.description,
  }
}

const getWarriorShareCopy = (locale?: string) => {
  switch (resolveLocale(locale)) {
    case 'zh-CN':
      return {
        fallbackTitle: 'Warrior 档案',
        fallbackTitleZh: '边境战士档案',
        fallbackDescription: '链上验证的 Frontier 身份正在加载或暂不可用。',
        snapshotUnavailable: '快照暂不可用',
        metaAlt: 'Warrior 档案分享卡',
        deepScan: '深度扫描',
        previewScan: '预览扫描',
        fullSet: '全套达成',
        medalStatus: {
          BOUND: '已绑定',
          VERIFIED: '已验证',
          LOCKED: '未解锁',
        },
        labels: {
          eyebrow: 'Frontier Chronicle · Warrior 档案',
          verified: '已在 Sui 验证',
          walletUnavailable: '钱包不可用',
          unknownWallet: '未知钱包',
          wallet: '钱包',
          combatScore: '战斗分数',
          network: '网络',
          medalsBound: '已绑定勋章',
          character: '角色',
          medalPreview: '勋章预览',
          noMedals: '当前还没有可用的勋章快照。',
          qrAlt: 'Warrior 档案二维码',
          qrHint: '扫码打开 Warrior 档案',
        },
      }
    case 'is':
      return {
        fallbackTitle: 'Warrior Profile',
        fallbackTitleZh: 'Warrior prófíll',
        fallbackDescription: 'Keðjustaðfest Frontier auðkenni er að hlaðast eða ekki tiltækt.',
        snapshotUnavailable: 'Skyndimynd ófáanleg',
        metaAlt: 'Warrior prófíl deilingarspjald',
        deepScan: 'Djúp skönnun',
        previewScan: 'Forskoðunarskönnun',
        fullSet: 'FULLT SETT',
        medalStatus: {
          BOUND: 'BUNDIÐ',
          VERIFIED: 'STAÐFEST',
          LOCKED: 'LÆST',
        },
        labels: {
          eyebrow: 'Frontier Chronicle · Warrior prófíll',
          verified: 'Staðfest á Sui',
          walletUnavailable: 'Veski ófáanlegt',
          unknownWallet: 'Óþekkt veski',
          wallet: 'Veski',
          combatScore: 'Bardagastig',
          network: 'Net',
          medalsBound: 'Bundnar medalíur',
          character: 'Persóna',
          medalPreview: 'Medalíuforskoðun',
          noMedals: 'Engin medalíuskyndimynd er tiltæk enn.',
          qrAlt: 'QR-kóði Warrior prófíls',
          qrHint: 'Skannaðu til að opna Warrior prófílinn',
        },
      }
    default:
      return {
        fallbackTitle: 'Warrior Profile',
        fallbackTitleZh: 'Warrior Profile',
        fallbackDescription: 'Chain-verified Frontier identity is loading or unavailable.',
        snapshotUnavailable: 'Snapshot Unavailable',
        metaAlt: 'Warrior profile share card',
        deepScan: 'Deep Scan',
        previewScan: 'Preview Scan',
        fullSet: 'FULL SET',
        medalStatus: {
          BOUND: 'BOUND',
          VERIFIED: 'VERIFIED',
          LOCKED: 'LOCKED',
        },
        labels: {
          eyebrow: 'Frontier Chronicle · Warrior Profile',
          verified: 'Verified on Sui',
          walletUnavailable: 'Wallet unavailable',
          unknownWallet: 'Unknown Wallet',
          wallet: 'Wallet',
          combatScore: 'Combat Score',
          network: 'Network',
          medalsBound: 'Medals Bound',
          character: 'Character',
          medalPreview: 'Medal Preview',
          noMedals: 'No medal snapshot is available yet.',
          qrAlt: 'Warrior profile QR code',
          qrHint: 'Scan to open the warrior profile',
        },
      }
  }
}

const formatWalletAddress = (walletAddress: string | null, fallback: string) => {
  if (!walletAddress || walletAddress.length < 14)
    return walletAddress || fallback
  return `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
}

const getPreviewMedals = (
  medals: ChronicleMedalState[],
  locale?: string
): WarriorShareMedalPreview[] => {
  const copy = getWarriorShareCopy(locale)
  const rankedMedals = [...medals].sort((left, right) => {
    const leftScore = Number(left.claimed) * 2 + Number(left.unlocked)
    const rightScore = Number(right.claimed) * 2 + Number(right.unlocked)
    return rightScore - leftScore
  })

  return rankedMedals.slice(0, 3).map((medal) => ({
    slug: medal.slug,
    title: medal.title,
    subtitle: medal.subtitle,
    status: medal.claimed
      ? copy.medalStatus.BOUND
      : medal.unlocked
        ? copy.medalStatus.VERIFIED
        : copy.medalStatus.LOCKED,
    color: MEDAL_COLOR_MAP[medal.slug] || '#8ea1ad',
  }))
}

export const buildWarriorShareCardModel = async (
  snapshot: ChronicleSnapshot,
  network: ENetwork,
  locale?: string
): Promise<WarriorShareCardModel> => {
  const copy = getWarriorShareCopy(locale)
  const { medals, profile, warriorScore } = snapshot
  const { rank } = warriorScore
  const rankCopy = getLocalizedRankCopy(rank, locale)
  const medalCount = `${warriorScore.claimedMedalCount} / ${medals.length}`
  const shareUrl = toAbsoluteSiteUrl(
    buildWarriorSharePath(profile.walletAddress, network, { locale })
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: rank.title,
    titleZh: rankCopy.secondaryTitle,
    description: rankCopy.description,
    labels: copy.labels,
    shareUrl,
    qrCodeDataUrl,
    network: network.toUpperCase(),
    walletAddress: profile.walletAddress,
    walletAddressShort: formatWalletAddress(
      profile.walletAddress,
      copy.labels.unknownWallet
    ),
    characterId: profile.characterId,
    score: warriorScore.displayScore,
    scoreLabel: `${warriorScore.displayScore.toLocaleString()} / 10,000`,
    medalsLabel: warriorScore.hasFullSet
      ? `${medalCount} · ${copy.fullSet}`
      : medalCount,
    scanLabel:
      profile.scanMode === 'authenticated' ? copy.deepScan : copy.previewScan,
    previewMedals: getPreviewMedals(medals, locale),
    hasFullSet: warriorScore.hasFullSet,
    tone: RANK_TONE_MAP[rank.tone] || RANK_TONE_MAP.steel,
  }
}

export const buildFallbackWarriorShareCardModel = async (
  walletAddress: string | null,
  network: ENetwork,
  locale?: string
): Promise<WarriorShareCardModel> => {
  const copy = getWarriorShareCopy(locale)
  const shareUrl = toAbsoluteSiteUrl(
    walletAddress ? buildWarriorSharePath(walletAddress, network, { locale }) : '/'
  )
  const qrCodeDataUrl = await buildShareQrCodeDataUrl(shareUrl)

  return {
    title: copy.fallbackTitle,
    titleZh: copy.fallbackTitleZh,
    description: copy.fallbackDescription,
    labels: copy.labels,
    shareUrl,
    qrCodeDataUrl,
    network: network.toUpperCase(),
    walletAddress,
    walletAddressShort: formatWalletAddress(walletAddress, copy.labels.unknownWallet),
    characterId: null,
    score: 0,
    scoreLabel: '0 / 10,000',
    medalsLabel: '0 / 8',
    scanLabel: copy.snapshotUnavailable,
    previewMedals: [],
    hasFullSet: false,
    tone: RANK_TONE_MAP.steel,
  }
}

export const buildWarriorPageMetadata = ({
  snapshot,
  walletAddress,
  network,
  locale,
}: {
  snapshot: ChronicleSnapshot
  walletAddress: string
  network: ENetwork
  locale?: string
}): Metadata => {
  const resolvedLocale = resolveLocale(locale)
  const copy = getWarriorShareCopy(resolvedLocale)
  const { rank, displayScore, claimedMedalCount } = snapshot.warriorScore
  const rankCopy = getLocalizedRankCopy(rank, resolvedLocale)
  const shortWallet = formatWalletAddress(
    walletAddress,
    copy.labels.unknownWallet
  )
  const canonicalPath = buildWarriorSharePath(walletAddress, network, {
    locale: resolvedLocale,
  })
  const canonicalUrl = toAbsoluteSiteUrl(canonicalPath)
  const ogImageUrl = toAbsoluteSiteUrl(
    buildWarriorImagePath(walletAddress, network, 'opengraph', {
      locale: resolvedLocale,
    })
  )
  const twitterImageUrl = toAbsoluteSiteUrl(
    buildWarriorImagePath(walletAddress, network, 'twitter', {
      locale: resolvedLocale,
    })
  )
  const description =
    resolvedLocale === 'zh-CN'
      ? `战斗分数：${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} 枚勋章已绑定 · ${shortWallet}`
      : resolvedLocale === 'is'
        ? `Bardagastig: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} medalíur bundnar · ${shortWallet}`
        : `Combat Score: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} Medal${claimedMedalCount !== 1 ? 's' : ''} Bound · ${shortWallet}`
  const ogDescription =
    resolvedLocale === 'zh-CN'
      ? `战斗分数：${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} 枚勋章已在 Sui ${network.toUpperCase()} 绑定`
      : resolvedLocale === 'is'
        ? `Bardagastig: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} medalíur bundnar á Sui ${network.toUpperCase()}`
        : `Combat Score: ${displayScore.toLocaleString()} / 10,000 · ${claimedMedalCount} Medal${claimedMedalCount !== 1 ? 's' : ''} Bound on Sui ${network.toUpperCase()}`

  return {
    title: `${rank.title} — ${APP_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${rank.title} (${rankCopy.secondaryTitle}) — ${APP_NAME}`,
      description: ogDescription,
      siteName: APP_NAME,
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt:
            resolvedLocale === 'zh-CN'
              ? `${rank.title} Warrior 档案分享卡`
              : `${rank.title} ${copy.metaAlt}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${rank.title} — ${APP_NAME}`,
      description: ogDescription,
      images: [twitterImageUrl],
    },
  }
}
