const SITE_NAME = 'agreg.skyost.eu'
const SITE_DESCRIPTION = 'Petite site contenant une flopée de resources pour l\'agrégation de mathématiques : plans, développements, bibliographie, ...'
const HOST_NAME = 'https://agreg.skyost.eu'
const GITHUB_PAGE = 'https://github.com/Skyost/Agregation'

function getCurrentAddress (route) {
  return `${HOST_NAME}${route.path}`
}

export { SITE_NAME, SITE_DESCRIPTION, HOST_NAME, GITHUB_PAGE, getCurrentAddress }
