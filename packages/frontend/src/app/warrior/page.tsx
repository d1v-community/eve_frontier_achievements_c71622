'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import CustomConnectButton from '../components/CustomConnectButton'

export default function WarriorIndexPage() {
  const account = useCurrentAccount()
  const router = useRouter()

  useEffect(() => {
    if (account?.address) {
      router.replace(`/warrior/${account.address}`)
    }
  }, [account, router])

  if (account?.address) {
    return null
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(240,100,47,0.12), transparent 22%), var(--sds-dark)',
      }}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-[#f0642f]">
          warrior chronicle
        </div>
        <h1 className="font-display text-4xl uppercase tracking-[0.08em] text-[#f4efe2]">
          Connect Your Wallet
        </h1>
        <p className="max-w-sm text-sm leading-7 text-white/55">
          Connect your wallet to view your Warrior profile and Chronicle medals.
        </p>
        <CustomConnectButton />
      </div>
    </main>
  )
}
