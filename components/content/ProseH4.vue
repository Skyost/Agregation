<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h4 :id="id">
    <slot />
  </h4>
</template>

<style lang="scss" scoped>
h3 {
  counter-increment: headline-4;

  &::before {
    content: counter(headline-4, upper-alpha) '. ';
  }
}
</style>
