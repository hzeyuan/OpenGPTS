import '~/src/global.css'
import './index.css'
import { initI18next } from './i18n'
import { dir } from 'i18next'
import { defaultNS } from './i18n/settings'
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
  initI18next(lng, defaultNS)
  return (
    // dir={dir(lng)}
    <html lang={lng}  className='w-full h-full'>
      <head>
      <meta name="google-site-verification" content="MNYDz-zm9V5FI_xvT_kRyPs19ticgqq9IvTpDL0Rpjw" />
      </head>
        <body className="w-full h-full">
          {children}
        </body>
    </html>
  )
}
