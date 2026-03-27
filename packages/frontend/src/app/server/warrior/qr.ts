import QRCode from 'qrcode'

export const buildShareQrCodeDataUrl = (shareUrl: string) =>
  QRCode.toDataURL(shareUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
    color: {
      dark: '#F4EFE2',
      light: '#00000000',
    },
  })
