'use client'

export const copyShareValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    const input = document.createElement('input')
    input.value = value
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(input)
    return copied
  }
}

export const downloadShareAsset = ({
  href,
  filename,
}: {
  href: string
  filename: string
}) => {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.target = '_blank'
  link.rel = 'noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const openShareWindow = (url: string) =>
  window.open(url, '_blank', 'noopener,noreferrer')
