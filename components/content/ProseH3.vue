<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h3>
    <slot />
  </h3>
</template>

<style lang="scss" scoped>
h3 {
  counter-increment: headline-3;

  &::before {
    content: counter(headline-3) '. ';
  }
}
</style>
