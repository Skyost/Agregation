import { defineNuxtConfig } from 'nuxt/config'
import StylelintPlugin from 'vite-plugin-stylelint'
import eslintPlugin from '@nabla/vite-plugin-eslint'
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
        lang: 'fr',
      },
      meta: [
        { name: 'description', content: siteMeta.description },
        { name: 'theme-color', content: '#343a40' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: [
    '~/assets/app.scss',
    '~/node_modules/katex/dist/katex.min.css',
  ],

  vite: {
    plugins: [
      StylelintPlugin(),
      eslintPlugin(),
    ],
  },

  modules: [
    '@nuxt/eslint',
    '~/modules/books-cover-fetcher',
    'nuxt-cname-generator',
    '~/modules/commit-sha-file-generator',
    '~/modules/nuxt-content-absolute-links',
    '~/modules/latex-pdf-generator',
    '~/modules/nuxt-content-bibtex',
    '~/modules/nuxt-content-latex',
    'skimple-components/nuxt',
    '@nuxt/content',
    '@nuxtjs/google-fonts',
    'nuxt-link-checker',
    '@nuxtjs/sitemap',
    'nuxt-simple-robots',
  ],

  eslint: {
    config: {
      stylistic: true,
    },
  },

  content: {
    watch: false,
    markdown: {
      anchorLinks: false,
    },
    ignores: [
      ...'log,aux,dvi,lof,lot,bit,idx,glo,bbl,bcf,ilg,toc,ind,out,blg,fdb_latexmk,fls,run.xml,synctex.gz,snm,nav,sta,pdf,checksums,py'
        .split(',')
        .map(extension => `\\.${extension}$`),
      '/latex/bibliography.tex',
      '/latex/common.tex',
      '/latex/pandoc.tex',
      '/latex/developpements.tex',
      '/latex/fiches.tex',
      '/latex/lecons.tex',
      '/latex/lecons-developpements.tex',
      '/latex/templates/gathering.tex',
      '/latex/templates/tikzpicture.tex',
    ],
  },

  googleFonts: {
    display: 'swap',
    families: {
      'Raleway': true,
      'Noto Sans JP': true,
    },
  },

  skimpleComponents: {
    bootstrapCss: false,
    bootstrapJs: false,
  },

  site: {
    url,
    name: siteMeta.title,
    trailingSlash: true,
  },

  linkChecker: {
    failOnError: false,
    excludeLinks: [
      '/pdf/**',
    ],
    skipInspections: [
      'link-text',
    ],
  },

  cname: {
    host: url,
  },

  runtimeConfig: {
    public: {
      url,
    },
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
})
