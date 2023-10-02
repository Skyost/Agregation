export enum BannerType {
  pdf,
  caveats,
  wip
}

export interface Banner {
  type: BannerType,
  message: string
}

export const useBanners = () => useState<Banner[]>('banners', () => [])

export const clearBanners = () => {
  const banners = useBanners()
  banners.value = []
}

export const useBanner = (banner: Banner) => {
  const banners = useBanners()
  banners.value.push(banner)
}

export const usePdfBanner = (url: string) => useBanner({
  type: BannerType.pdf,
  message: `Le contenu de cette page est disponible en version PDF.
  Vous pouvez le télécharger <a href="${url}">ici</a>.`
})

export const useCaveatsBanner = (url: string) => useBanner({
  type: BannerType.caveats,
  message: `Pour signaler une erreur ou suggérer une amélioration, vous pouvez modifier
  le <a href="${url}">code source</a> de la page, ou me <a href="https://skyost.eu/#contact">contacter</a>.`
})

export const useWipBanner = (url: string) => useBanner({
  type: BannerType.wip,
  message: `Cette page et son contenu ne sont pas terminés :
  il peut manquer des choses, et de nombreux changements vont encore intervenir.
  Toute aide est <a href="${url}">la bienvenue</a> !`
})
