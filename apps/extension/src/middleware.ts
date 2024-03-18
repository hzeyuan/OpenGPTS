import { NextRequest, NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
acceptLanguage.languages(languages)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
  
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
  // if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value || '')
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  const supabase = createMiddlewareClient({ req, res:response })
	// const session = await supabase.auth.getSession()
  // console.log('session',session.data)
  // const { data: { user } } = await supabase.auth.getUser()

  // console.log('user',user)

  // if (!user) {
	// 	return NextResponse.redirect(new URL("/login", req.url))
	// }

  // check login
  // const isLoggedIn = !!userCookie // 假设authCookieName是存储登录状态的cookie
  // const isLoginRequired = ['/chat'].some(path => req.nextUrl.pathname.includes(path));


  // if not login
  // if (isLoginRequired && !isLoggedIn) {
  //   return NextResponse.redirect(new URL(`/login`, req.url));
  // }

  // Redirect if lng in path is nrot supported
  // if (
  //   !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
  //   !req.nextUrl.pathname.startsWith('/_next')
  // ) {
  //   return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
  // }

  if (req.headers.has('referer')) {
    const refererHeaderValue = req.headers.get('referer');
    const refererUrl = refererHeaderValue ? new URL(refererHeaderValue) : null;
    const lngInReferer = languages.find((l) => refererUrl?.pathname.startsWith(`/${l}`))

    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return response
}