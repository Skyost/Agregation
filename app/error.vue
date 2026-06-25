<script setup lang="ts">
const props = defineProps<{ error: unknown }>()

const title = computed(() => {
  let result = 'Erreur'
  const error = props.error
  if (error && typeof error === 'object' && Object.prototype.hasOwnProperty.call(error, 'statusCode')) {
    const statusCode = parseInt(`${(error as Record<string, unknown>).statusCode}`)
    if (!Number.isNaN(statusCode)) {
      result += ` ${statusCode}`
    }
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
