<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h3 :id="id">
    <slot />
  </h3>
</template>

<style lang="scss" scoped>
h3 {
  counter-increment: headline-3;
  counter-reset: headline-4;

  &::before {
    content: counter(headline-3) '. ';
  }
}
</style>
