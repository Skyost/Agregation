<template>
  <span>
    <b-icon :icon="icon" /> {{ name }}
  </span>
</template>

<script>
import { BIcon, BIconBezier, BIconList, BIconOption } from 'bootstrap-vue'

export default {
  name: 'Category',
  // eslint-disable-next-line vue/no-unused-components
  components: { BIcon, BIconList, BIconBezier, BIconOption },
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
