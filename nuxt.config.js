import { HOST_NAME, SITE_DESCRIPTION, SITE_NAME } from './utils/site'

require('dotenv').config()

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: `%s | ${SITE_NAME}`,
    htmlAttrs: {
      lang: 'fr'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: SITE_DESCRIPTION },
      { name: 'theme-color', content: '#343a40' }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css',
        integrity: 'sha256-55Ddc47WvWTK5vYVejnAuSK7USJaL7FQXrzQ4HiQ1WY=',
        crossorigin: 'anonymous'
      },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    '@nuxtjs/google-fonts',
    '~/modules/generate-content',
    '~/modules/sitemap-routes'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/content
    '@nuxt/content'
  ],

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {
    liveEdit: false
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: {
      ignoreOrder: true
    },
    babel: {
      compact: true,
      minified: true
    }
  },

  generate: {
    fallback: true
  },

  loading: {
    color: '#009688'
  },

  robots: {
    UserAgent: '*',
    Disallow: ['/_nuxt/'],
    Sitemap: `${HOST_NAME}/sitemap.xml`
  },

  sitemap: {
    hostname: HOST_NAME,
    defaults: {
      priority: 1,
      lastmod: new Date()
    }
  },

  googleFonts: {
    families: {
      Raleway: true,
      'Noto Sans JP': true
    }
  },

  generateContent: {
    srcDir: 'latex/',
    destDir: 'content/',
    pdfDir: 'static/pdf/',
    booksDir: 'content/livres/',
    pandocRedefinitions: 'latex/pandoc.tex',
    ignored: [
      'latex/common.tex',
      'latex/gathering.tex'
    ],
    imagesDir: 'latex/images',
    imagesDestDir: 'static/images/latex/',
    gatherings: [
      'lecons',
      'developpements',
      'lecons-developpements'
    ],
    gatheringsTitles: {
      lecons: 'Plans de leçons',
      developpements: 'Développements'
    },
    gatheringHeaders: {
      'lecons-developpements': `\\renewcommand{\\dev}[1]{%
\t\\reversemarginpar%
\t\\marginnote[\\bfseries\\color{devcolor}\\hyperlink{#1}{DEV}]{}%
\t\\normalmarginpar%
}`
    }
  }
}
