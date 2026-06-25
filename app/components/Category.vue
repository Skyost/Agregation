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
const iconName = computed<string>(() => {
  switch (props.category) {
    case undefined:
      return 'bi:list'
    case 'algebra':
      return 'bi:bezier'
    case 'analysis':
      return 'bi:option'
    default:
      return 'bi:bezier2'
  }
})
</script>

<template>
  <span>
    <icon :name="iconName" /> {{ name }}
  </span>
</template>
