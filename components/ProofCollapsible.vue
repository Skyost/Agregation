<template>
  <div>
    <div class="text-right">
      <b-btn class="collapse-button" :class="buttonClass" variant="link" @click="active = !active">
        <b-icon-chevron-right /> Preuve
      </b-btn>
    </div>
    <slide-up-down :active="active">
      <div class="slide-content">
        <slot />
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import { BIconChevronRight } from 'bootstrap-vue'
import SlideUpDown from 'vue-slide-up-down'

export default {
  name: 'ProofCollapsible',
  components: { BIconChevronRight, SlideUpDown },
  data () {
    return {
      active: false
    }
  },
  computed: {
    buttonClass () {
      return this.active ? 'expanded' : 'collapsed'
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse-button {
  margin-bottom: 1rem;
  font-size: 0.8em;
  padding: 0;
  text-decoration: none;
  color: rgba(black, 0.75);

  .b-icon {
    transition: transform 100ms;
    transform: rotate(0deg);
  }

  &.expanded .b-icon {
    transform: rotate(90deg);
  }
}

.slide-content {
  padding-bottom: 1rem;
}
</style>
