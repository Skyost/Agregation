<script setup lang="ts">
usePageHead({ title: 'Accueil' })
</script>

<template>
  <div>
    <content-doc
      path="/readme"
      :head="false"
    />
  </div>
</template>
