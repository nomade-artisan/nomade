export const CARRIERS = {
  sendcloud: {
    name: 'Sendcloud',
    publicKey: process.env.SENDCLOUD_PUBLIC_KEY!,
    secretKey: process.env.SENDCLOUD_SECRET_KEY!,
    baseUrl: 'https://panel.sendcloud.sc/api/v2',
  },
};