'use client'

import { useEffect, useState } from 'react'
import type { ChronicleSnapshot } from '~~/chronicle/types'
import { formatNetworkType } from '~~/helpers/network'
import { ENetwork } from '~~/types/ENetwork'

const resolveNetwork = (networkType: string | null | undefined) => {
  if (!networkType) {
    return ENetwork.TESTNET
  }

  const normalized = formatNetworkType(networkType)

  if (Object.values(ENetwork).includes(normalized as ENetwork)) {
    return normalized as ENetwork
  }

  return ENetwork.TESTNET
}

const useChronicleSnapshot = (
  walletAddress: string | undefined,
  networkType: string | null | undefined
) => {
  const [data, setData] = useState<ChronicleSnapshot | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  const resolvedNetwork = resolveNetwork(networkType)

  useEffect(() => {
    if (!walletAddress) {
      setData(null)
      setError(null)
      setIsPending(false)
      return
    }

    const controller = new AbortController()
    let active = true

    setIsPending(true)
    setError(null)

    const loadSnapshot = async () => {
      try {
        const searchParams = new URLSearchParams({
          walletAddress,
          network: resolvedNetwork,
        })
        const response = await fetch(`/api/chronicle?${searchParams.toString()}`, {
          signal: controller.signal,
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(
            typeof payload?.error === 'string'
              ? payload.error
              : 'Failed to load chronicle snapshot'
          )
        }

        if (active) {
          setData(payload)
        }
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        if (active) {
          setError(
            requestError instanceof Error
              ? requestError
              : new Error('Failed to load chronicle snapshot')
          )
          setData(null)
        }
      } finally {
        if (active) {
          setIsPending(false)
        }
      }
    }

    loadSnapshot()

    return () => {
      active = false
      controller.abort()
    }
  }, [refreshToken, resolvedNetwork, walletAddress])

  return {
    data,
    error,
    isPending,
    network: resolvedNetwork,
    refetch: () => setRefreshToken((value) => value + 1),
  }
}

export default useChronicleSnapshot
