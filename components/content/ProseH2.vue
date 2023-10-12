<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h2 :id="id">
    <slot />
  </h2>
</template>

<style lang="scss" scoped>
h2 {
  counter-increment: headline-2;
  counter-reset: headline-3;

  &:before {
    content: counter(headline-2, upper-roman) ' - ';
  }
}
</style>
