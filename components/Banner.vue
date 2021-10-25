<template>
  <div class="banner" :class="variant">
    <b-icon class="icon" :icon="icon" />
    <p class="mb-0">
      <slot />
    </p>
  </div>
</template>

<script>
import { BIcon } from 'bootstrap-vue'

export default {
  name: 'Banner',
  components: { BIcon },
  props: {
    icon: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'dark'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/breakpoints';

.banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  text-align: center;

  a {
    color: black;
    text-decoration: underline;
  }

  &.dark,
  &.teal {
    color: rgba(white, 0.5);

    a {
      color: rgba(white, 0.75);
    }
  }

  &.dark {
    background-color: lighten(#343a40, 5%);
  }

  &.teal {
    background-color: #00695c;
  }

  &.red {
    background-color: #ffcdd2;
  }

  .icon {
    margin-right: 8px;

    @media (max-width: $mobile-width) {
      font-size: 2em;
      margin-right: 10px;
    }
  }
}
</style>
