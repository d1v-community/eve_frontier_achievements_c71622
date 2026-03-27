const DEFAULT_SITE_URL = 'http://localhost:3000'

const normalizeSiteUrl = (value: string) => {
  const trimmed = value.trim()
  if (trimmed.length === 0) return DEFAULT_SITE_URL

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  return withProtocol.endsWith('/') ? withProtocol : `${withProtocol}/`
}

export const getSiteUrl = () => {
  const configuredUrl = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].find((value) => typeof value === 'string' && value.trim().length > 0)

  return new URL(
    configuredUrl ? normalizeSiteUrl(configuredUrl) : DEFAULT_SITE_URL
  )
}

export const toAbsoluteSiteUrl = (pathname: string) =>
  new URL(pathname, getSiteUrl()).toString()
