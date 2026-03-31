import type { MedalShareCardModel } from './medalShare'

interface MedalShareImageProps {
  model: MedalShareCardModel
  width: number
  height: number
}

const MONO_FONT = '"Azeret Mono", "IBM Plex Mono", "JetBrains Mono", monospace'

export const MedalShareImage = ({
  model,
  width,
  height,
}: MedalShareImageProps) => {
  const scale = height / 630
  const panelPadding = 40 * scale

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 18% 0%, rgba(240,100,47,0.18), transparent 30%), radial-gradient(circle at 84% 16%, rgba(142,161,173,0.18), transparent 22%), linear-gradient(180deg, #070809 0%, #101214 35%, #0c0e10 100%)',
        color: '#f4efe2',
        fontFamily: MONO_FONT,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(125deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 46%, rgba(240,100,47,0.08) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: panelPadding,
          right: panelPadding,
          top: panelPadding,
          bottom: panelPadding,
          display: 'flex',
          border: `1px solid ${model.tone.border}`,
          background: 'rgba(7,8,9,0.82)',
          boxShadow: `0 24px 72px ${model.tone.glow}`,
        }}
      >
        <div
          style={{
            width: '62%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${32 * scale}px ${34 * scale}px`,
            borderRight: `1px solid ${model.tone.border}`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 14 * scale,
                lineHeight: 1.4,
                letterSpacing: `${3 * scale}px`,
                textTransform: 'uppercase',
                color: 'rgba(244,239,226,0.52)',
                marginBottom: 18 * scale,
              }}
            >
              {model.labels.eyebrow}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                padding: `${8 * scale}px ${12 * scale}px`,
                border: `1px solid ${model.tone.border}`,
                background: model.tone.background,
                color: model.tone.primary,
                fontSize: 13 * scale,
                lineHeight: 1,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                marginBottom: 18 * scale,
              }}
            >
              {model.statusLabel}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 18 * scale,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 56 * scale,
                  lineHeight: 0.96,
                  fontWeight: 700,
                  letterSpacing: `${2.5 * scale}px`,
                  textTransform: 'uppercase',
                  color: model.tone.primary,
                  marginBottom: 10 * scale,
                }}
              >
                {model.title}
              </div>
              {model.titleZh ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 24 * scale,
                    lineHeight: 1.2,
                    letterSpacing: `${1.8 * scale}px`,
                    color: 'rgba(244,239,226,0.76)',
                  }}
                >
                  {model.titleZh}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: `${16 * scale}px ${18 * scale}px`,
                border: `1px solid ${model.tone.border}`,
                background: model.tone.soft,
                marginBottom: 16 * scale,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 12 * scale,
                  lineHeight: 1.4,
                  letterSpacing: `${2 * scale}px`,
                  textTransform: 'uppercase',
                  color: 'rgba(244,239,226,0.42)',
                  marginBottom: 10 * scale,
                }}
              >
                {model.labels.evidence}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 16 * scale,
                  lineHeight: 1.55,
                  color: 'rgba(244,239,226,0.78)',
                }}
              >
                {model.proofLabel}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 15 * scale,
                lineHeight: 1.55,
                color: 'rgba(244,239,226,0.62)',
                maxWidth: 560 * scale,
              }}
            >
              {model.statusSummary}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 18 * scale,
              borderTop: '1px solid rgba(244,239,226,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13 * scale,
                lineHeight: 1.4,
                color: 'rgba(244,239,226,0.38)',
                marginBottom: 8 * scale,
              }}
            >
              <span>
                {model.labels.wallet} {model.walletAddressShort}
              </span>
              <span>Sui {model.network}</span>
            </div>
            {model.characterId ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 13 * scale,
                  lineHeight: 1.4,
                  color: 'rgba(244,239,226,0.52)',
                }}
              >
                {model.labels.character} {model.characterId}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            width: '38%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${32 * scale}px ${28 * scale}px`,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: `${20 * scale}px ${22 * scale}px`,
              border: `1px solid ${model.tone.border}`,
              background: model.tone.background,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 12 * scale,
                lineHeight: 1.4,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                color: 'rgba(244,239,226,0.42)',
                marginBottom: 8 * scale,
              }}
            >
              {model.labels.rarity}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 20 * scale,
                lineHeight: 1.2,
                color: model.tone.primary,
                marginBottom: 16 * scale,
              }}
            >
              {model.rarity}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 12 * scale,
                lineHeight: 1.4,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                color: 'rgba(244,239,226,0.42)',
                marginBottom: 8 * scale,
              }}
            >
              {model.labels.requirement}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 14 * scale,
                lineHeight: 1.55,
                color: 'rgba(244,239,226,0.72)',
              }}
            >
              {model.requirement}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: `${16 * scale}px`,
              border: '1px solid rgba(244,239,226,0.12)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <img
              src={model.qrCodeDataUrl}
              alt={model.labels.qrAlt}
              width={200 * scale}
              height={200 * scale}
              style={{
                display: 'block',
                marginBottom: 12 * scale,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 11 * scale,
                lineHeight: 1.5,
                letterSpacing: `${1.6 * scale}px`,
                textTransform: 'uppercase',
                textAlign: 'center',
                color: 'rgba(244,239,226,0.48)',
              }}
            >
              {model.labels.qrHint}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
