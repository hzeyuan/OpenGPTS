import '~/src/global.css'
import '../index.css'
import { initI18next } from '../i18n'
import { dir } from 'i18next'
import { defaultNS } from '../i18n/settings'
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
    <html lang={lng} dir={dir(lng)} className='w-full h-full'>
        <body className="w-full h-full">
          {children}
        </body>
    </html>
  )
}
