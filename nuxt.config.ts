import { defineNuxtConfig } from 'nuxt/config'
import StylelintPlugin from 'vite-plugin-stylelint'
import eslintPlugin from 'vite-plugin-eslint'
import 'dotenv/config'
import { siteMeta } from './site/meta'
import { debug } from './site/debug'

const url = debug ? 'http://localhost:3000' : siteMeta.url

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,

  app: {
    head: {
      titleTemplate: `%s | ${siteMeta.title}`,
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { name: 'description', content: siteMeta.description },
        { name: 'theme-color', content: '#343a40' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [
    '~/assets/app.scss',
    '~/node_modules/katex/dist/katex.min.css'
  ],

  vite: {
    plugins: [
      StylelintPlugin(),
      eslintPlugin()
    ]
  },

  modules: [
    '~/modules/books-cover-fetcher',
    '~/modules/cname-generator',
    '~/modules/commit-sha-file-generator',
    '~/modules/latex-pdf-generator',
    '~/modules/nuxt-content-bibtex',
    '~/modules/nuxt-content-latex',
    'skimple-components/nuxt',
    '@nuxt/content',
    '@nuxtjs/google-fonts',
    'nuxt-link-checker',
    'nuxt-simple-sitemap',
    'nuxt-simple-robots'
  ],

  content: {
    watch: false,
    ignores: 'log,aux,dvi,lof,lot,bit,idx,glo,bbl,bcf,ilg,toc,ind,out,blg,fdb_latexmk,fls,run.xml,synctex.gz,snm,nav,sta,pdf,checksums'
      .split(',')
      .map(extension => `\\.${extension}$`)
  },

  googleFonts: {
    display: 'swap',
    families: {
      Raleway: true,
      'Noto Sans JP': true
    }
  },

  skimpleComponents: {
    bootstrapCss: false,
    bootstrapJs: false
  },

  site: {
    url,
    name: siteMeta.title,
    trailingSlash: true
  },

  linkChecker: {
    failOnError: false
  },

  cname: {
    hostname: url
  },

  runtimeConfig: {
    public: {
      url
    }
  }
})
