<script setup lang="ts">
import type { NuxtError } from '@nuxt/types'

const props = defineProps<{ error: NuxtError }>()

const title = computed(() => {
  let result = 'Erreur'
  if ((Object.hasOwnProperty.call(props.error, 'statusCode'))) {
    result += ` ${props.error.statusCode}`
  }
  return result
})

// onMounted(() => console.error(props.error))
usePageHead({ title: title })
</script>

<template>
  <nuxt-layout>
    <error-display :error="error" />
  </nuxt-layout>
</template>
