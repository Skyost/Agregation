<template>
  <div>
    <page-header />
    <page-navbar />
    <banner v-if="pdfBannerLink" :link="pdfBannerLink" icon="info-circle-fill">
      Le contenu de cette page est disponible en version PDF.
      Vous pouvez le télécharger <a :href="pdfBannerLink">ici</a>.
    </banner>
    <banner v-if="caveatsBannerLink" :link="caveatsBannerLink" icon="exclamation-circle-fill" variant="red">
      Pour signaler une erreur ou suggérer une amélioration, vous pouvez modifier
      le <a :href="caveatsBannerLink">code source</a> de la page, ou me <a href="https://skyost.eu/#contact">contacter</a>.
    </banner>
    <page-content>
      <nuxt @onpdfbanner="onPDFBanner" @oncaveatsbanner="onCaveatsBanner" />
    </page-content>
    <page-footer />
  </div>
</template>

<script>
import { BIconExclamationCircleFill, BIconInfoCircleFill } from 'bootstrap-vue'

export default {
  // eslint-disable-next-line vue/no-unused-components
  components: { BIconInfoCircleFill, BIconExclamationCircleFill },
  data () {
    return {
      pdfBannerLink: null,
      caveatsBannerLink: null
    }
  },
  watch: {
    $route () {
      this.pdfBannerLink = null
      this.caveatsBannerLink = null
    }
  },
  methods: {
    onPDFBanner (link) {
      this.pdfBannerLink = link
    },
    onCaveatsBanner (link) {
      this.caveatsBannerLink = link
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

.btn,
input {
  border-radius: 0 !important;
}

.btn-black {
  $color: #343a40;

  color: white !important;
  background-color: $color;
  border-color: lighten($color, 5%);

  &:hover,
  &:active,
  &:focus {
    background-color: darken($color, 6%) !important;
    border-color: $color !important;
  }

  &:focus {
    box-shadow: 0 0 0 0.2rem rgba($color, 0.5);
  }
}
</style>
