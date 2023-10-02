<script setup lang="ts">
import type { Category } from '~/types'

const props = defineProps<{ category?: Category }>()
const name = computed<string>(() => {
  switch (props.category) {
    case undefined:
      return 'Toutes les catégories'
    case 'algebra':
      return 'Algèbre'
    case 'analysis':
      return 'Analyse'
    default:
      return props.category
  }
})
const icon = computed<string>(() => {
  switch (props.category) {
    case undefined:
      return 'list'
    case 'algebra':
      return 'bezier'
    case 'analysis':
      return 'option'
    default:
      return 'bezier2'
  }
})
</script>

<template>
  <span>
    <ski-icon :icon="icon" /> {{ name }}
  </span>
</template>
