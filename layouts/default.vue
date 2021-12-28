<template>
  <div>
    <page-header />
    <page-navbar />
    <banner v-if="pdfBannerLink" icon="info-circle-fill">
      Le contenu de cette page est disponible en version PDF.
      Vous pouvez le télécharger <a :href="pdfBannerLink">ici</a>.
    </banner>
    <banner v-if="caveatsBannerLink" icon="exclamation-circle-fill" variant="red">
      Pour signaler une erreur ou suggérer une amélioration, vous pouvez modifier
      le <a :href="caveatsBannerLink">code source</a> de la page, ou me <a href="https://skyost.eu/#contact">contacter</a>.
    </banner>
    <banner v-if="wipBannerLink" icon="wrench" variant="teal">
      Cette page et son contenu ne sont pas terminés :
      il peut manquer des choses, et de nombreux changements vont encore intervenir.
      Toute aide est <a :href="wipBannerLink">la bienvenue</a> !
    </banner>
    <page-content>
      <nuxt @onpdfbanner="onPDFBanner" @oncaveatsbanner="onCaveatsBanner" @onwipbanner="onWIPBanner" />
    </page-content>
    <page-footer />
  </div>
</template>

<script>
export default {
  data () {
    return {
      pdfBannerLink: null,
      caveatsBannerLink: null,
      wipBannerLink: null
    }
  },
  watch: {
    $route () {
      this.pdfBannerLink = null
      this.caveatsBannerLink = null
      this.wipBannerLink = null
    }
  },
  methods: {
    onPDFBanner (link) {
      this.pdfBannerLink = link
    },
    onCaveatsBanner (link) {
      this.caveatsBannerLink = link
    },
    onWIPBanner (link) {
      this.wipBannerLink = link
    }
  }
}
</script>

<style lang="scss">
html,
body {
  font-family: 'Raleway', sans-serif;
}

h1,
h2,
h3,
h4,
h5 {
  font-family: 'Noto Sans JP', sans-serif;
}
</style>
