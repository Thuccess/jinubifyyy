import QRCode from 'qrcode';

export function getPublicBaseUrl() {
  return (process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function profileUrlToQrDataUrl(profileUrl) {
  return QRCode.toDataURL(profileUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
  });
}
