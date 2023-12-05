<script setup lang="ts">
defineProps<{ body: string }>()
const root = ref<HTMLElement | null>(null)
const setupTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const setupDocument = async () => {
  await nextTick()
  const references = root.value!.querySelectorAll<HTMLElement>('.bookref')
  let rightColumnWidth = 0
  for (const reference of references) {
    const element: HTMLElement = reference.firstElementChild! as HTMLElement
    rightColumnWidth = Math.max(rightColumnWidth, element.offsetWidth)
  }
  const paddingRight = `${rightColumnWidth + 15}px`
  root.value!.style.paddingRight = paddingRight
  for (const reference of references) {
    const element: HTMLElement = reference.firstElementChild! as HTMLElement
    element.style.right = paddingRight
  }

  const devLinks = root.value!.querySelectorAll<HTMLElement>('.devlink')
  for (const devLink of devLinks) {
    const linkA = document.createElement('a')
    linkA.classList.add('btn')
    linkA.classList.add('btn-link')
    linkA.classList.add('collapsed')
    linkA.innerHTML = '<i class="bi bi-chevron-down"></i> Développement'
    linkA.setAttribute('href', `/developpements/${devLink.textContent!.trim()}/`)
    devLink.replaceChildren(...[linkA])
    if (devLink.nextElementSibling) {
      devLink.parentNode?.insertBefore(devLink.nextElementSibling, devLink)
    }
  }

  const proofs = root.value!.querySelectorAll<HTMLElement>('.proof')
  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i]
    proof.id = `proof-${i + 1}`
    proof.classList.add('collapse')
    const label = document.createElement('span')
    label.classList.add('proof-label')
    label.classList.add('btn')
    label.classList.add('btn-link')
    label.setAttribute('data-bs-toggle', 'collapse')
    label.setAttribute('data-bs-target', `#proof-${i + 1}`)
    label.innerHTML = '<i class="bi bi-chevron-down"></i> Preuve'
    label.classList.add('collapsed')
    proof.parentNode?.insertBefore(label, proof)
  }

  const refs = root.value!.querySelectorAll<HTMLElement>('[data-reference-type="ref"]')
  for (const ref of refs) {
    const refElement = document.getElementById(ref.getAttribute('data-reference')!)
    if (refElement) {
      const titleElement = refElement.querySelector('strong, em')
      if (titleElement && titleElement.textContent) {
        ref.textContent = titleElement.textContent
      }
    }
  }

  setupTimeout.value = null
}

onMounted(async () => {
  await nextTick()
  setupTimeout.value = setTimeout(setupDocument, 1000)
})

onUnmounted(() => {
  if (setupTimeout.value) {
    clearTimeout(setupTimeout.value)
    setupTimeout.value = null
  }
})
</script>

<template>
  <div ref="root" class="math-document" v-html="document.body" />
</template>

<style lang="scss" scoped>
@import 'assets/colors';

@mixin bubble($color, $hover, $left: true) {
  @if $left {
    border-left: 10px solid darken($color, 10%);
  }

  @else {
    border-right: 10px solid darken($color, 10%);
  }

  background-color: lighten($color, 2%);
  transition: background-color 200ms;
  padding: 10px;

  &:hover {
    background-color: $hover;
  }
}

@mixin environment($color) {
  @include bubble($color, $color);

  width: 100%;
  margin-bottom: 1rem;
  overflow-x: auto;

  > *:last-child {
    margin-bottom: 0;
  }

  a {
    color: darken($color, 60%) !important;
  }
}

.math-document {
  position: relative;

  :deep(.doctitle),
  :deep(.doccategories) {
    display: none;
  }

  :deep(.docsummary) {
    font-style: italic;
    color: rgba(black, 0.6);
  }

  @each $environment, $color in $math-environments {
    :deep(.#{$environment}) {
      @include environment($color);
    }
  }

  :deep(.proof-label),
  :deep(.devlink > a) {
    margin-bottom: 1rem;
    font-size: .8em;
    padding: 0;
    text-decoration: none !important;
    color: rgba(0,0,0,.75);

    .bi-chevron-down::before {
      transition: transform 200ms;
    }

    &.collapsed {
      .bi-chevron-down::before {
        transform: rotate(-90deg);
      }
    }
  }

  :deep(.bookref) {
    // position: relative;

    > *:first-child {
      @include bubble(rgba(black, 0.05), rgba(black, 0.1), false);

      position: absolute;
      // right: 0;
      text-align: center;
      padding: 7.5px;
      margin-left: 10px;
      font-size: 0.75em;
      text-decoration: none !important;
      color: black;
      transform: translateX(calc(100% + 15px));
    }

    p {
      margin-bottom: 0;
    }
  }

  :deep(.center) {
    text-align: center;
  }
}
</style>
