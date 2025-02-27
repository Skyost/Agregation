<script setup lang="ts">
usePageHead({ title: 'Accueil' })

const { data, status, error } = await useFetch<{ body: string }>('/_api/readme/')
</script>

<template>
  <div v-if="status === 'pending'">
    <spinner />
  </div>
  <div v-else-if="data">
    <div v-html="data.body" />
  </div>
  <div v-else>
    <error-display :error="error" />
  </div>
</template>
