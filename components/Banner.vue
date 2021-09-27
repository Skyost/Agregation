<template>
  <div v-if="link" class="banner" :class="variant">
    <b-icon class="icon" :icon="icon" />
    <p class="mb-0">
      <slot />
    </p>
  </div>
</template>

<script>
import { BIcon } from 'bootstrap-vue'

export default {
  name: 'PDFBanner',
  components: { BIcon },
  props: {
    link: {
      type: String,
      default: null
    },
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

  &.dark {
    color: rgba(white, 0.5);
    background-color: lighten(#343a40, 5%);

    a {
      color: rgba(white, 0.75);
    }
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
