<template>
  <ski-navbar color="dark" theme="dark">
    <ski-navbar-collapse id="page-navbar-collapse">
      <ski-navbar-items class="me-auto">
        <ski-navbar-item to="/" :active="$route.path === '/'">
          <ski-icon icon="house-door-fill" /> Accueil
        </ski-navbar-item>
        <ski-navbar-item to="/lecons/" :active="$route.path.startsWith('/lecons/')">
          <ski-icon icon="file-text-fill" /> Leçons
        </ski-navbar-item>
        <ski-navbar-item to="/developpements/" :active="$route.path.startsWith('/developpements/')">
          <ski-icon icon="pencil-fill" /> Développements
        </ski-navbar-item>
        <ski-navbar-item to="/fiches/" :active="$route.path.startsWith('/fiches/')">
          <ski-icon icon="backpack-fill" /> Fiches
        </ski-navbar-item>
        <ski-navbar-item to="/bibliographie/" :active="$route.path === '/bibliographie/'">
          <ski-icon icon="book-fill" /> Bibliographie
        </ski-navbar-item>
        <ski-navbar-item class="d-none" to="/recherche/" :active="$route.path === '/recherche/'">
          <ski-icon icon="search" /> Recherche
        </ski-navbar-item>
      </ski-navbar-items>
      <ski-navbar-items>
        <form action="/recherche/" method="get">
          <ski-input-group size="sm" data-bs-theme="light">
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

<style lang="scss" scoped>
@import 'assets/bootstrap-mixins';

:deep(.search-bar form) {
  @include media-breakpoint-down(lg) {
    margin-top: 10px;
    flex: 1;
  }
}
</style>
<script setup lang="ts">
</script>
