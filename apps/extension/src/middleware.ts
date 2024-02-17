import { NextRequest, NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'

import { fallbackLng, languages, cookieName } from './app/i18n/settings'

acceptLanguage.languages(languages)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
}



export  async function middleware(req: NextRequest) {
  const userAuthKey = `sb-${process.env.SUSPABASE_ID}-auth-token`


  const userCookie = req.cookies.get(userAuthKey);
  let lng
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value || '')
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng



  // check login
  const isLoggedIn = !!userCookie // 假设authCookieName是存储登录状态的cookie
  const isLoginRequired = ['/chat'].some(path => req.nextUrl.pathname.includes(path));

  console.debug('middleware',isLoginRequired, isLoggedIn, req.nextUrl.pathname, req.nextUrl.pathname.includes('/chat'))

  // if not login
  if (isLoginRequired && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login`, req.url));
  }

  // Redirect if lng in path is nrot supported
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
  }

  if (req.headers.has('referer')) {
    const refererHeaderValue = req.headers.get('referer');
    const refererUrl = refererHeaderValue ? new URL(refererHeaderValue) : null;
    const lngInReferer = languages.find((l) => refererUrl?.pathname.startsWith(`/${l}`))
    const response = NextResponse.next()
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next()
}