'use client'

import EveButton from '@eveworld/ui-components/components/EveButton'
import ActionAsset from '@eveworld/ui-components/assets/action.svg'
import ExternalAsset from '@eveworld/ui-components/assets/external.svg'
import Image from 'next/image'

type ActionButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
type ActionButtonIcon = 'action' | 'external' | 'none'

const ICON_MAP = {
  action: ActionAsset,
  external: ExternalAsset,
} as const

const OfficialActionButton = ({
  children,
  className = '',
  href,
  icon = 'action',
  targetId,
  typeClass = 'primary',
}: {
  children: string
  className?: string
  href?: string
  icon?: ActionButtonIcon
  targetId?: string
  typeClass?: ActionButtonVariant
}) => {
  const handleClick = () => {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      return
    }

    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  const iconAsset = icon === 'none' ? null : ICON_MAP[icon]

  return (
    <EveButton
      typeClass={typeClass}
      className={`!self-auto !px-5 ${className}`.trim()}
      onClick={handleClick}
    >
      <span className="inline-flex items-center gap-2">
        <span>{children}</span>
        {iconAsset ? (
          <Image
            src={iconAsset}
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5"
          />
        ) : null}
      </span>
    </EveButton>
  )
}

export default OfficialActionButton
