import '~/src/global.css'
import '../index.css'
import { initI18next } from '../i18n'
import { dir } from 'i18next'
import { defaultNS } from '../i18n/settings'
import { AntdRegistry } from '@ant-design/nextjs-registry';
export const metadata = {
  title: 'OpenGPTs',
  description: 'OpenGPTs',
}



export default function RootLayout(
  {
    children,
    params: {
      lng
    }
  }: {
    children: React.ReactNode,
    params: {
      lng: string
    }
  }) {
  console.log('params', lng)
  initI18next(lng, defaultNS)
  return (
    <html lang={lng} dir={dir(lng)}>
      <AntdRegistry>
        <body>
          {children}
        </body>
      </AntdRegistry>

    </html>
  )
}
