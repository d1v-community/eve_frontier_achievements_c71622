import type { WarriorShareCardModel } from './share'

interface WarriorShareImageProps {
  model: WarriorShareCardModel
  width: number
  height: number
}

const MONO_FONT = '"Azeret Mono", "IBM Plex Mono", "JetBrains Mono", monospace'

export const WarriorShareImage = ({
  model,
  width,
  height,
}: WarriorShareImageProps) => {
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
          'radial-gradient(circle at 14% 0%, rgba(240,100,47,0.24), transparent 30%), radial-gradient(circle at 82% 18%, rgba(124,145,157,0.16), transparent 22%), linear-gradient(180deg, #08090a 0%, #101214 34%, #0d0f11 100%)',
        color: '#f4efe2',
        fontFamily: MONO_FONT,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          background:
            'linear-gradient(130deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 42%, rgba(240,100,47,0.08) 100%)',
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
          background: 'rgba(8,9,10,0.74)',
          boxShadow: `0 24px 80px ${model.tone.glow}`,
        }}
      >
        <div
          style={{
            width: '62%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: `${34 * scale}px ${34 * scale}px ${30 * scale}px`,
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
                color: 'rgba(244,239,226,0.58)',
                marginBottom: 22 * scale,
              }}
            >
              {model.labels.eyebrow}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 16 * scale,
                lineHeight: 1.35,
                letterSpacing: `${2.5 * scale}px`,
                textTransform: 'uppercase',
                color: model.tone.primary,
                marginBottom: 14 * scale,
              }}
            >
              {model.labels.verified} {model.network}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 24 * scale,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 58 * scale,
                  lineHeight: 0.95,
                  fontWeight: 700,
                  letterSpacing: `${3 * scale}px`,
                  textTransform: 'uppercase',
                  color: model.tone.primary,
                  marginBottom: 10 * scale,
                }}
              >
                {model.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24 * scale,
                  lineHeight: 1.2,
                  letterSpacing: `${1.8 * scale}px`,
                  color: 'rgba(244,239,226,0.72)',
                }}
              >
                {model.titleZh}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 17 * scale,
                lineHeight: 1.6,
                color: 'rgba(244,239,226,0.72)',
                maxWidth: 520 * scale,
              }}
            >
              {model.description}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 22 * scale,
              borderTop: '1px solid rgba(244,239,226,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 13 * scale,
                lineHeight: 1.4,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
                color: 'rgba(244,239,226,0.36)',
              }}
            >
              {model.walletAddress
                ? `${model.labels.wallet} ${model.walletAddressShort}`
                : model.labels.walletUnavailable}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${8 * scale}px ${12 * scale}px`,
                border: `1px solid ${model.tone.border}`,
                background: model.tone.background,
                color: model.tone.primary,
                fontSize: 13 * scale,
                lineHeight: 1,
                letterSpacing: `${2 * scale}px`,
                textTransform: 'uppercase',
              }}
            >
              {model.scanLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            width: '38%',
            display: 'flex',
            flexDirection: 'column',
            padding: `${34 * scale}px ${30 * scale}px`,
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: `${24 * scale}px`,
              background: model.tone.background,
              border: `1px solid ${model.tone.border}`,
              marginBottom: 18 * scale,
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
                marginBottom: 12 * scale,
              }}
            >
              {model.labels.combatScore}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                fontSize: 42 * scale,
                lineHeight: 1,
                fontWeight: 700,
                color: model.tone.primary,
                marginBottom: 8 * scale,
              }}
            >
              {model.score.toLocaleString()}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 15 * scale,
                lineHeight: 1.4,
                color: 'rgba(244,239,226,0.68)',
              }}
            >
              {model.scoreLabel}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: `${20 * scale}px ${22 * scale}px`,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(244,239,226,0.12)',
              marginBottom: 18 * scale,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13 * scale,
                lineHeight: 1.4,
                marginBottom: 10 * scale,
              }}
            >
              <span
                style={{ display: 'flex', color: 'rgba(244,239,226,0.42)' }}
              >
                {model.labels.network}
              </span>
              <span style={{ display: 'flex', color: '#f4efe2' }}>
                {model.network}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13 * scale,
                lineHeight: 1.4,
                marginBottom: 10 * scale,
              }}
            >
              <span
                style={{ display: 'flex', color: 'rgba(244,239,226,0.42)' }}
              >
                {model.labels.medalsBound}
              </span>
              <span style={{ display: 'flex', color: model.tone.primary }}>
                {model.medalsLabel}
              </span>
            </div>
            {model.characterId && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13 * scale,
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{ display: 'flex', color: 'rgba(244,239,226,0.42)' }}
                >
                  {model.labels.character}
                </span>
                <span style={{ display: 'flex', color: '#f4efe2' }}>
                  {model.characterId}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                gap: 12 * scale,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{ display: 'flex', flex: 1, flexDirection: 'column' }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 12 * scale,
                    lineHeight: 1.4,
                    letterSpacing: `${2 * scale}px`,
                    textTransform: 'uppercase',
                    color: 'rgba(244,239,226,0.42)',
                    marginBottom: 12 * scale,
                  }}
                >
                  {model.labels.medalPreview}
                </div>

                {model.previewMedals.length > 0 ? (
                  model.previewMedals.map((medal, index) => (
                    <div
                      key={medal.slug}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: `${12 * scale}px ${14 * scale}px`,
                        border: `1px solid ${medal.color}55`,
                        background: `${medal.color}15`,
                        marginBottom:
                          index === model.previewMedals.length - 1
                            ? 0
                            : 10 * scale,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 7 * scale,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            fontSize: 13 * scale,
                            lineHeight: 1.2,
                            color: '#f4efe2',
                          }}
                        >
                          {medal.subtitle}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            fontSize: 10 * scale,
                            lineHeight: 1,
                            letterSpacing: `${1.4 * scale}px`,
                            textTransform: 'uppercase',
                            color: medal.color,
                          }}
                        >
                          {medal.status}
                        </div>
                      </div>
                      {medal.title !== medal.subtitle ? (
                        <div
                          style={{
                            display: 'flex',
                            fontSize: 11 * scale,
                            lineHeight: 1.4,
                            color: 'rgba(244,239,226,0.56)',
                          }}
                        >
                          {medal.title}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      padding: `${16 * scale}px`,
                      border: '1px solid rgba(244,239,226,0.12)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: 13 * scale,
                      lineHeight: 1.5,
                      color: 'rgba(244,239,226,0.48)',
                    }}
                  >
                    {model.labels.noMedals}
                  </div>
                )}
              </div>

              <div
                style={{
                  width: 148 * scale,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${14 * scale}px ${12 * scale}px`,
                  border: '1px solid rgba(244,239,226,0.12)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <img
                  src={model.qrCodeDataUrl}
                  alt={model.labels.qrAlt}
                  width={120 * scale}
                  height={120 * scale}
                  style={{
                    display: 'block',
                    marginBottom: 10 * scale,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    fontSize: 10 * scale,
                    lineHeight: 1.55,
                    letterSpacing: `${1.2 * scale}px`,
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
      </div>
    </div>
  )
}
