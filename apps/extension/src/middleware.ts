import { NextRequest, NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
acceptLanguage.languages(languages)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',

]

  // matcher:[
  //   // '/((?!_next/static|_next/image|favicon.ico).*)',
  //   // '/',
  //   // '/chat',
  // ]
}



export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  let lng
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  const supabase = createMiddlewareClient({ req, res: response })
  const { data: { session } } = await supabase.auth.getSession()
  console.log('session', session?.['access_token'])
  

  const url = req.nextUrl.clone()
  if (url.pathname === '/login' || url.pathname==='/') {
    return NextResponse.next();
  }

  if (!session?.['access_token']) {
    return NextResponse.redirect(new URL(`/login`, req.url));
  }



  if (req.headers.has('referer')) {
    const refererHeaderValue = req.headers.get('referer');
    const refererUrl = refererHeaderValue ? new URL(refererHeaderValue) : null;
    const lngInReferer = languages.find((l) => refererUrl?.pathname?.startsWith(`/${l}`))

    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return response
}