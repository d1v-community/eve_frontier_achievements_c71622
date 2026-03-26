'use client'

import EveLoadingAnimation from '@eveworld/ui-components/components/EveLoadingAnimation'
import { FC } from 'react'

const Loading: FC = () => {
  return (
    <EveLoadingAnimation position="horizontal">
      <div className="border border-brightquantum/50 bg-[#111315] px-6 py-4 font-mono text-sm uppercase tracking-[0.28em] text-[#f4efe2] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        Chronicle Syncing
      </div>
    </EveLoadingAnimation>
  )
}

export default Loading
