<template>
  <div>
    <div class="text-right">
      <ski-button class="collapse-button" :class="buttonClass" variant="link" @click="active = !active">
        <ski-icon icon="chevron-right" class="icon" /> Preuve
      </ski-button>
    </div>
    <slide-up-down :active="active">
      <div class="slide-content">
        <slot />
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import { SkiButton, SkiIcon } from 'skimple-components'
import SlideUpDown from 'vue-slide-up-down'

export default {
  name: 'ProofCollapsible',
  components: { SkiButton, SkiIcon, SlideUpDown },
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

  .icon::before {
    transition: transform 100ms;
    transform: rotate(0deg);
  }

  &.expanded .icon::before {
    transform: rotate(90deg);
  }
}

.slide-content {
  padding-bottom: 1rem;
}
</style>
