import type { ActiveMedalTemplate } from '~~/server/chronicle/claimTickets'
import {
  getClaimSigningWarning,
  getContractPackageWarning,
  getMissingTemplateWarning,
  getRegistryMissingWarning,
} from '~~/chronicle/config/businessCopy'

export interface ChronicleRuntimeFlags {
  contractConfigured: boolean
  registryObjectId: string | null
  claimSigningConfigured: boolean
  activeTemplates: Map<number, ActiveMedalTemplate>
}

export const buildChronicleWarnings = (
  activityWarning: string | null,
  runtime: ChronicleRuntimeFlags,
  locale?: string
) => {
  const warnings: string[] = []

  if (activityWarning) {
    warnings.push(activityWarning)
  }

  if (!runtime.contractConfigured) {
    warnings.push(getContractPackageWarning(locale))
    return warnings
  }

  if (!runtime.registryObjectId) {
    warnings.push(getRegistryMissingWarning(locale))
  }

  if (runtime.registryObjectId && !runtime.claimSigningConfigured) {
    warnings.push(getClaimSigningWarning(locale))
  }

  if (runtime.activeTemplates.size === 0) {
    warnings.push(getMissingTemplateWarning(locale))
  }

  return warnings
}
