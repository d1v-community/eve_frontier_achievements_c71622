'use client'

import { useState } from 'react'
import type { ENetwork } from '~~/types/ENetwork'
import WarriorShareDialog from './WarriorShareDialog'

interface ShareButtonProps {
  walletAddress: string
  network: ENetwork
  rankTitle: string
  rankTitleZh: string
  score: number
  claimedMedalCount: number
  totalMedalCount: number
}

export default function ShareButton({
  walletAddress,
  network,
  rankTitle,
  rankTitleZh,
  score,
  claimedMedalCount,
  totalMedalCount,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sds-system-chip flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-all hover:opacity-80 active:scale-95"
        style={{
          background: 'rgba(240,100,47,0.12)',
          border: '1px solid rgba(240,100,47,0.35)',
          color: '#f0642f',
          fontFamily: 'var(--sds-font-mono)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#f0642f',
            transition: 'background 0.3s',
          }}
        />
        Share Card
      </button>
      {open ? (
        <WarriorShareDialog
          walletAddress={walletAddress}
          network={network}
          rankTitle={rankTitle}
          rankTitleZh={rankTitleZh}
          score={score}
          claimedMedalCount={claimedMedalCount}
          totalMedalCount={totalMedalCount}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
