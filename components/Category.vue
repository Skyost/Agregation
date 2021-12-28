<template>
  <span>
    <ski-icon :icon="icon" /> {{ name }}
  </span>
</template>

<script>
import { SkiIcon } from 'skimple-components'

export default {
  name: 'Category',
  components: { SkiIcon },
  props: {
    category: {
      type: String,
      default: null
    }
  },
  computed: {
    name () {
      switch (this.category) {
        case null:
          return 'Toutes les catégories'
        case 'algebra':
          return 'Algèbre'
        case 'analysis':
          return 'Analyse'
        default:
          return this.category
      }
    },
    icon () {
      switch (this.category) {
        case null:
          return 'list'
        case 'algebra':
          return 'bezier'
        case 'analysis':
          return 'option'
        default:
          return 'bezier2'
      }
    }
  }
}
</script>
