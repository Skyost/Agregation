<template>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-toggle target="nav-collapse" />

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item to="/" :active="$nuxt.$route.path === '/'">
          <b-icon-house-door-fill /> Accueil
        </b-nav-item>
        <b-nav-item to="/lecons" :active="$nuxt.$route.path.startsWith('/lecons')">
          <b-icon-file-text-fill /> Leçons
        </b-nav-item>
        <b-nav-item to="/developpements" :active="$nuxt.$route.path.startsWith('/developpements')">
          <b-icon-pencil-fill /> Développements
        </b-nav-item>
        <b-nav-item to="/bibliographie" :active="$nuxt.$route.path === '/bibliographie'">
          <b-icon-book-fill /> Bibliographie
        </b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-form class="search-bar" action="/recherche" method="get">
          <b-input-group>
            <b-form-input size="sm" placeholder="Rechercher" name="requete" :value="request" />
            <b-input-group-append>
              <b-button size="sm" type="submit">
                <b-icon-search />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { BIconBookFill, BIconFileTextFill, BIconHouseDoorFill, BIconPencilFill, BIconSearch } from 'bootstrap-vue'

export default {
  name: 'PageNavbar',
  components: { BIconHouseDoorFill, BIconFileTextFill, BIconPencilFill, BIconBookFill, BIconSearch },
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
