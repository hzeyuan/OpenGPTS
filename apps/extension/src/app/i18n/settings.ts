


export const fallbackLng = 'en'
export const languages = [fallbackLng, 'zh']
export const defaultNS = 'translation'
export const cookieName = 'i18next'


export const defaultLanguagesOptions = [
  {
   key:'zh',
   name:'中文',
  },{
    key:'en',
    name:'English'
  }
]

export function getOptions (lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}