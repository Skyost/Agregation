<template>
  <ski-navbar>
    <ski-navbar-collapse>
      <ski-navbar-items class="me-auto">
        <ski-navbar-item to="/" :active="$nuxt.$route.path === '/'">
          <ski-icon icon="house-door-fill" /> Accueil
        </ski-navbar-item>
        <ski-navbar-item to="/lecons" :active="$nuxt.$route.path.startsWith('/lecons')">
          <ski-icon icon="file-text-fill" /> Leçons
        </ski-navbar-item>
        <ski-navbar-item to="/developpements" :active="$nuxt.$route.path.startsWith('/developpements')">
          <ski-icon icon="pencil-fill" /> Développements
        </ski-navbar-item>
        <ski-navbar-item to="/bibliographie" :active="$nuxt.$route.path === '/bibliographie'">
          <ski-icon icon="book-fill" /> Bibliographie
        </ski-navbar-item>
      </ski-navbar-items>
      <ski-navbar-items>
        <form action="/recherche" method="get">
          <ski-input-group size="sm">
            <ski-form-control placeholder="Rechercher" name="requete" />
            <ski-button type="submit" variant="secondary">
              <ski-icon icon="search" />
            </ski-button>
          </ski-input-group>
        </form>
      </ski-navbar-items>
    </ski-navbar-collapse>
  </ski-navbar>
</template>

<script>
import {
  SkiButton,
  SkiFormControl,
  SkiIcon,
  SkiInputGroup,
  SkiNavbar,
  SkiNavbarCollapse,
  SkiNavbarItem,
  SkiNavbarItems
} from 'skimple-components'

export default {
  name: 'PageNavbar',
  components: { SkiNavbar, SkiNavbarCollapse, SkiNavbarItems, SkiNavbarItem, SkiInputGroup, SkiFormControl, SkiButton, SkiIcon },
  data () {
    return {
      request: null
    }
  },
  mounted () {
    if (Object.prototype.hasOwnProperty.call(this.$route.query, 'requete') && this.$route.path === '/recherche') {
      this.request = this.$route.query.requete
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/breakpoints';

::v-deep .search-bar form {
  @media (max-width: $tablet-width) {
    margin-top: 10px;
    flex: 1;
  }
}
</style>
