export default defineNuxtRouteMiddleware(() => {
  const banners = useBanners()
  banners.value = []
})
