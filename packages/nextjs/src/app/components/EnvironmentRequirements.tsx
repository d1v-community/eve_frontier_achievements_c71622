import AlertAsset from '@eveworld/ui-components/assets/alert.svg'
import Image from 'next/image'
import {getTranslations} from 'next-intl/server'
import { hasDatabaseUrl } from '~~/server/db/client.mjs'

const CONTRACT_ENV_VARS = [
  'NEXT_PUBLIC_LOCALNET_CONTRACT_PACKAGE_ID',
  'NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID',
  'NEXT_PUBLIC_TESTNET_CONTRACT_PACKAGE_ID',
  'NEXT_PUBLIC_MAINNET_CONTRACT_PACKAGE_ID',
] as const

const CONTRACT_PLACEHOLDER = '0xNOTDEFINED'
const eveEyesApiKeyConfigured =
  typeof process.env.EVE_EYES_API_KEY === 'string' &&
  process.env.EVE_EYES_API_KEY.trim().length > 0
const demoMinterConfigured =
  typeof process.env.CHRONICLE_DEMO_MINTER_PRIVATE_KEY === 'string' &&
  process.env.CHRONICLE_DEMO_MINTER_PRIVATE_KEY.trim().length > 0

function getConfiguredContractEnvVars() {
  return CONTRACT_ENV_VARS.filter((key) => {
    const value = process.env[key]
    return typeof value === 'string' && value.trim() !== '' && value !== CONTRACT_PLACEHOLDER
  })
}

const EnvironmentRequirements = async () => {
  const t = await getTranslations('environment')
  const configuredContractEnvVars = getConfiguredContractEnvVars()
  const databaseEnabled = hasDatabaseUrl()
  const testnetContractConfigured = configuredContractEnvVars.includes(
    'NEXT_PUBLIC_TESTNET_CONTRACT_PACKAGE_ID'
  )
  const shouldShowDemoMintNotice =
    testnetContractConfigured && !demoMinterConfigured

  if (
    configuredContractEnvVars.length > 0 &&
    databaseEnabled &&
    eveEyesApiKeyConfigured &&
    !shouldShowDemoMintNotice
  ) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 pt-2">
      {configuredContractEnvVars.length === 0 ? (
        <div className="sds-panel rounded-[1.4rem] px-4 py-4 text-sm text-[#f4efe2]/84">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#d9a441]">
            <Image
              src={AlertAsset}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
            <span>{t('configNotice')}</span>
          </div>
          <div className="mt-2 text-base font-semibold text-[#f4efe2]">
            {t('missingPackageTitle')}
          </div>
          <div className="mt-2 leading-7 text-[#f4efe2]/68">
            {t('missingPackageBody')}
          </div>
          <div className="mt-3 font-mono text-xs leading-6 text-[#f4efe2]/74">
            {CONTRACT_ENV_VARS.join('\n')}
          </div>
        </div>
      ) : null}

      {!databaseEnabled ? (
        <div className="sds-panel rounded-[1.4rem] px-4 py-4 text-sm text-[#f4efe2]/84">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#8ea1ad]">
            <Image
              src={AlertAsset}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
            <span>{t('runtimeNotice')}</span>
          </div>
          <div className="mt-2 text-base font-semibold text-[#f4efe2]">
            {t('databaseTitle')}
          </div>
          <div className="mt-2 leading-7 text-[#f4efe2]/68">
            {t('databaseBody')}
          </div>
        </div>
      ) : null}

      {!eveEyesApiKeyConfigured ? (
        <div className="rounded-[1.4rem] border border-[#d9a441]/35 bg-[#2a2112]/72 px-4 py-4 text-sm text-[#f9e3b2] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.32em]">
            <Image
              src={AlertAsset}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
            <span>{t('previewNotice')}</span>
          </div>
          <div className="mt-2 text-base font-semibold">
            {t('previewTitle')}
          </div>
          <div className="mt-2 leading-7">
            {t('previewBody')}
          </div>
        </div>
      ) : null}

      {shouldShowDemoMintNotice ? (
        <div className="rounded-[1.4rem] border border-[#7ec38f]/28 bg-[linear-gradient(180deg,rgba(126,195,143,0.12),rgba(10,10,11,0.94))] px-4 py-4 text-sm text-[#d7f0dd] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.32em] text-[#a9e2b5]">
            <Image
              src={AlertAsset}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
            <span>{t('demoMintNotice')}</span>
          </div>
          <div className="mt-2 text-base font-semibold">
            {t('demoMintTitle')}
          </div>
          <div className="mt-2 leading-7">
            {t('demoMintBody')}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EnvironmentRequirements
