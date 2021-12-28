<template>
  <div class="cards">
    <ski-columns class="header">
      <ski-column cols="12" :lg="searchFields ? '9' : null">
        <ski-button-group class="categories mb-3 mb-lg-0">
          <ski-button
            v-for="category in categories"
            :key="category"
            variant="link"
            class="category-button"
            :class="{ active: currentCategory === category }"
            @click="currentCategory = category"
          >
            <category class="category" :category="category" />
          </ski-button>
        </ski-button-group>
      </ski-column>
      <ski-column v-if="searchFields" cols="12" lg="3" class="d-flex align-items-center">
        <ski-form-control v-model="search" placeholder="Chercher dans la liste" size="sm" />
      </ski-column>
    </ski-columns>
    <div v-for="(item, position) in itemsToDisplay" :key="position" class="mt-4 item-card p-3">
      <slot :item="item" />
    </div>
    <em v-if="itemsToDisplay.length === 0" class="d-block mt-5 text-muted">
      Aucun contenu à afficher.
    </em>
  </div>
</template>

<script>
import { SkiButton, SkiButtonGroup, SkiColumn, SkiColumns, SkiFormControl } from 'skimple-components'
import { normalizeString } from '~/utils/utils'

export default {
  name: 'Cards',
  components: { SkiColumns, SkiColumn, SkiButtonGroup, SkiButton, SkiFormControl },
  props: {
    items: {
      type: Array,
      required: true
    },
    searchFields: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      currentCategory: null,
      search: null
    }
  },
  computed: {
    categories () {
      let result = []
      for (const item of this.items) {
        if (item.categories) {
          result = result.concat(item.categories)
        }
      }
      result = Array.from(new Set(result)).sort()
      result.unshift(null)
      return result
    },
    itemsToDisplay () {
      return this.items.filter(this.filter).sort()
    }
  },
  methods: {
    filter (item) {
      let result = true
      if (this.currentCategory) {
        result = result && item.categories.includes(this.currentCategory)
      }
      if (this.search) {
        const search = normalizeString(this.search)
        let searchResult = false
        for (const searchField of this.searchFields) {
          const value = item[searchField]
          if (value) {
            searchResult = searchResult || normalizeString(value.toString()).includes(search)
          }
        }
        result = result && searchResult
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/breakpoints';

.cards {
  .header {
    margin-bottom: 20px;
  }

  .categories {
    max-width: 100%;

    .category-button {
      color: rgba(black, 0.5);
      border-bottom: 1px solid rgba(black, 0.25);
      text-decoration: none;
      box-shadow: none;

      &:hover:not(.active) {
        color: rgba(black, 0.75);
        border-bottom: 1px solid rgba(black, 0.5);
      }

      &.active {
        color: var(--bs-blue);
        border-bottom-color: rgba(var(--bs-blue), 0.5);
      }

      @media (max-width: $mobile-width) {
        width: 33.3%;

        .category {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          display: block;
        }
      }
    }
  }

  ::v-deep .item-card {
    background-color: rgba(black, 0.05);
    transition: background-color 200ms;

    h2 {
      font-size: 1.2em;
      border-bottom: none;
    }

    &:hover {
      background-color: rgba(black, 0.1);
    }
  }

  ::v-deep .btn {
    @media (max-width: $mobile-width) {
      font-size: 14px;
    }
  }
}
</style>
