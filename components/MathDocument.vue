<script setup lang="ts">
defineProps<{ body: string }>()
const root = ref<HTMLElement | null>(null)
const setupTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const setupDocument = () => {
  const tables = root.value!.querySelectorAll<HTMLElement>('table')
  for (const table of tables) {
    table.classList.add('table', 'table-bordered', 'table-hover')
    const parent = table.parentNode
    const wrapper = document.createElement('div')
    wrapper.classList.add('table-responsive')
    parent!.replaceChild(wrapper, table)
    wrapper.appendChild(table)
  }

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

  const router = useRouter()
  const devLinks = root.value!.querySelectorAll<HTMLElement>('.devlink')
  for (const devLink of devLinks) {
    const linkA = document.createElement('a')
    const href = `/developpements/${devLink.textContent!.trim()}/`
    linkA.innerText = 'Développement'
    linkA.setAttribute('href', href)
    linkA.onclick = (event) => {
      event.preventDefault()
      router.push(href)
    }
    devLink.replaceChildren(...[linkA])
    if (devLink.nextElementSibling) {
      devLink.parentNode?.insertBefore(devLink.nextElementSibling, devLink)
    }
  }

  const proofs = root.value!.querySelectorAll<HTMLElement>('.proof')
  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i]
    const id = `proof-${i + 1}`
    const details = document.createElement('details')
    details.setAttribute('id', id)
    details.innerHTML = proof.outerHTML
    proof.parentNode?.insertBefore(details, proof)
    proof.remove()
    const summary = document.createElement('summary')
    summary.classList.add('proof-label')
    summary.innerText = 'Preuve'
    details.insertBefore(summary, details.firstChild)
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
  setupDocument()
})

onUnmounted(() => {
  if (setupTimeout.value) {
    clearTimeout(setupTimeout.value)
    setupTimeout.value = null
  }
})
</script>

<template>
  <div
    ref="root"
    class="math-document"
    v-html="body"
  />
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
  counter-reset: figure;

  :deep(.doctitle),
  :deep(.doccategories) {
    display: none;
  }

  :deep(.docsummary) {
    font-style: italic;
    color: rgba(black, 0.6);
  }

  :deep(h2:not(.unnumbered)) {
    counter-increment: headline-2;
    counter-reset: headline-3 headline-4;

    &:before {
      content: counter(headline-2, upper-roman) ' - ';
    }
  }

  :deep(h3:not(.unnumbered)) {
    counter-increment: headline-3;
    counter-reset: headline-4;

    &::before {
      content: counter(headline-3) '. ';
    }
  }

  :deep(h4:not(.unnumbered)) {
    counter-increment: headline-4;

    &::before {
      content: counter(headline-4, lower-alpha) '. ';
    }
  }

  :deep(img) {
    max-width: 100%;
  }

  :deep(table) {
    background-color: white;

    td {
      height: 2.5em;
    }
  }

  :deep(figure figcaption) {
    text-align: center;
    counter-increment: figure;

    &:before {
      content: 'Figure ' counter(figure) '. ';
      font-weight: bold;
    }
  }

  @each $environment, $color in $math-environments {
    :deep(.#{$environment}) {
      @include environment($color);
    }
  }

  :deep(.proof-label),
  :deep(.devlink > a) {
    display: inline-block;
    margin-bottom: 1rem;
    font-size: .8em;
    padding: 0;
    text-decoration: none !important;
    color: rgba(0,0,0,.75);

    &::before {
      display: inline-block;
      margin-right: 0.5em;
      content: '▶';
    }
  }

  :deep(details[open]) .proof-label::before {
    content: '▼';
  }

  :deep(ol) {
    counter-reset: ol;

    > li {
      list-style: none;
      counter-increment: ol;
    }

    > li::marker {
      content: "(" counter(ol, lower-roman) ") ";
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
