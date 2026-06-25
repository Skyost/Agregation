<script setup lang="ts">
const props = defineProps<{ error: any }>()

const errorCode = computed(() => {
  const error = props.error
  if (typeof error === 'number') {
    return error
  }
  if (typeof error === 'string' && /^-?\d+$/.test(error)) {
    return parseInt(error)
  }
  if (error && typeof error === 'object' && Object.prototype.hasOwnProperty.call(error, 'statusCode')) {
    return parseInt(error.statusCode)
  }
  return null
})

const errorDetails = computed(() => {
  const error = props.error
  if (!error || typeof error !== 'object') {
    return error ?? ''
  }
  return JSON.stringify({
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    message: error.message,
    data: error.data,
  }, null, 2)
})

const title = computed(() => {
  if (errorCode.value === 404) {
    return 'Page non trouvée !'
  }
  if (errorCode.value) {
    return `Erreur ${errorCode.value}`
  }
  return 'Erreur'
})

const goBack = () => window.history.back()
</script>

<template>
  <div>
    <h1 v-text="title" />
    <p>
      Vous pouvez continuer votre navigation en allant sur <a
        href="/"
        @click.prevent="goBack"
      >la page précédente</a> ou
      en allant sur <nuxt-link to="/">la page d'accueil</nuxt-link>.
      <span v-if="errorCode === 404">
        Si quelque chose devait se trouver ici,
        n'hésitez pas à <a href="https://skyost.eu/fr/#contact">me contacter</a> pour me le signaler.
      </span>
    </p>
    <details v-if="errorCode !== 404">
      <pre>{{ errorDetails }}</pre>
    </details>
  </div>
</template>
