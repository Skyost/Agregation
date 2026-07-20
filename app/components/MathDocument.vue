<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

defineProps<{ body: string }>()
const root = ref<HTMLElement | null>(null)
const setupTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const needMarkerPseudoElementFix = () => {
  const testElement = document.createElement('li')
  testElement.style.setProperty('content', '\'(i)\'', 'important')
  return getComputedStyle(testElement, '::marker').content === 'none'
}

const romanize = (n: number): string | null => {
  if (isNaN(n)) {
    return null
  }
  const digits = String(+n).split('')
  const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  let roman = ''
  let i = 3
  while (i--) {
    roman = (key[+digits.pop()! + (i * 10)] || '') + roman
  }
  return Array(+digits.join('') + 1).join('M') + roman
}

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

  if (needMarkerPseudoElementFix()) {
    const lists = root.value!.querySelectorAll<HTMLElement>('ol')
    for (const list of lists) {
      list.classList.add('safari-ol-fix')
      const items = list.querySelectorAll<HTMLElement>('li')
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!
        item.classList.add('safari-li-fix')
        const marker = `<span class="safari-marker">(${romanize(i + 1)!.toLowerCase()})</span> `
        item.insertAdjacentHTML('afterbegin', marker)
      }
    }
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
    const centeredRight = 15 + ((rightColumnWidth + element.offsetWidth) / 2)
    element.style.right = `${centeredRight}px`
  }

  const router = useRouter()
  const adjustPreviousBottomMargin = (environment: Element | null, label: HTMLElement, backward: boolean = true) => {
    const isEnvironment = (element: Element) => {
      return element.classList.contains('property')
        || element.classList.contains('proposition')
        || element.classList.contains('lemma')
        || element.classList.contains('theorem')
        || element.classList.contains('corollary')
        || element.classList.contains('definition')
        || element.classList.contains('notation')
        || element.classList.contains('example')
        || element.classList.contains('cexample')
        || element.classList.contains('application')
        || element.classList.contains('remark')
        || element.classList.contains('algorithm')
    }
    while (environment != null && !isEnvironment(environment!)) {
      environment = (backward ? environment?.previousElementSibling : environment?.nextElementSibling) ?? null
    }
    if (environment?.tagName !== 'DIV') {
      return
    }
    (environment as HTMLDivElement).style.marginBottom = 'calc(1.6em + 1rem)'
    label.style.marginTop = 'calc(-1.6em - 1rem)'
  }

  const devLinks = root.value!.querySelectorAll<HTMLElement>('.devlink')
  for (const devLink of devLinks) {
    const environment = devLink.nextElementSibling
    const linkA = document.createElement('a')
    const href = `/developpements/${devLink.textContent!.trim()}/`
    linkA.innerText = 'Développement'
    linkA.setAttribute('href', href)
    linkA.onclick = (event) => {
      event.preventDefault()
      router.push(href)
    }
    adjustPreviousBottomMargin(environment, linkA, false)
    devLink.replaceChildren(...[linkA])
    if (devLink.nextElementSibling) {
      devLink.parentNode?.insertBefore(devLink.nextElementSibling, devLink)
    }
  }

  const proofs = root.value!.querySelectorAll<HTMLElement>('.proof')
  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i]!
    const environment = proof.previousElementSibling
    const id = `proof-${i + 1}`
    const details = document.createElement('details')
    details.setAttribute('id', id)
    details.innerHTML = proof.outerHTML
    proof.parentNode?.insertBefore(details, proof)
    proof.remove()
    const summary = document.createElement('summary')
    summary.classList.add('proof-label')
    summary.innerText = 'Preuve'
    adjustPreviousBottomMargin(environment, summary)
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
@import 'katex/dist/katex.min.css';

$document-theorem-environments: 'property', 'proposition', 'lemma', 'theorem', 'corollary', 'definition', 'application';
$document-example-environments: 'notation', 'example', 'cexample', 'remark', 'algorithm';

@mixin label-box {
  display: inline-block;
  border-radius: var(--bs-border-radius);
  background-color: var(--bs-dark);
  color: white;
  font-family: var(--bs-font-sans-serif), sans-serif;
  font-size: 0.75rem;
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
  padding: 0.45rem 0.6rem;
  font-variant-numeric: lining-nums;
}

@mixin environment {
  position: relative;
  width: 100%;
  margin: 1.5rem 0;

  .environment-title {
    display: block;
    font-family: var(--bs-font-sans-serif), sans-serif;
    font-weight: bold;
    font-variant-numeric: lining-nums;
    margin-bottom: 0.25rem;

    &::after {
      content: '.';
    }
  }

  > .environment-label {
    font-variant-numeric: lining-nums;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  a {
    color: var(--bs-dark) !important;
    font-weight: bold;
  }

  p >.katex-display:last-child {
    margin-bottom: 0;
  }

  ol, ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;

    li {
      padding-left: 1rem;
      margin-bottom: 0.25rem;

      &::marker {
        font-weight: bold;
      }

      > *:only-child {
        margin-bottom: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@mixin theorem-environment {
  @include environment;

  border-radius: var(--bs-border-radius);
  padding: 2rem 1.25rem 1rem;
  position: relative;
  background-color: darken($light, 5%);
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: darken($light, 2%);
  }

  &::before {
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: -1px;
    width: 5px;
    border-radius: var(--bs-border-radius) 0 0 var(--bs-border-radius);
    background-color: var(--bs-dark);
    content: '';
  }

  > .environment-label {
    @include label-box;

    position: absolute;
    top: -1px;
    left: -1px;
  }
}

@mixin example-environment {
  @include environment;

  border-left: 2px solid var(--bs-dark);
  padding: 0 1rem 0.85rem 1.15rem;

  &::before {
    position: absolute;
    left: -4px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--bs-dark);
    content: '';
  }

  > .environment-label {
    color: var(--bs-dark);
    font-family: var(--bs-heading-font-family), sans-serif;
    font-size: 0.8rem;
    text-transform: uppercase;

    &::after {
      content: '. ';
    }
  }
}

.math-document {
  --bs-border-radius: 0;

  position: relative;
  counter-reset: figure;
  line-height: 1.7;

  :deep(.doctitle),
  :deep(.doccategories) {
    display: none;
  }

  :deep(.docsummary) {
    font-style: italic;
    color: var(--bs-secondary);
  }

  :deep(.docname) {
    h1 {
      display: flex;
      align-items: baseline;
      gap: 0.65rem;

      strong {
        @include label-box;

        flex: 0 0 auto;
        font-size: 1em;
      }
    }
  }

  :deep(h2:not(.unnumbered)) {
    counter-increment: headline-2;
    counter-reset: headline-3 headline-4;
    display: flex;
    align-items: baseline;
    gap: 0.6rem;

    &::before {
      content: counter(headline-2, upper-roman) ' – ';
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

    &::before {
      content: 'Figure ' counter(figure) '. ';
      font-weight: bold;
    }
  }

  @each $environment in $document-theorem-environments {
    :deep(.#{$environment}) {
      @include theorem-environment;
    }
  }

  @each $environment in $document-example-environments {
    :deep(.#{$environment}) {
      @include example-environment;
    }
  }

  :deep(details) {
    margin: 1rem 0 1.35rem;

    summary::marker {
      content: '> ';
    }

    &[open] {
      padding-bottom: 0.1rem;

      .proof-label::marker {
        content: '⌄ ';
      }
    }
  }

  :deep(.devlink > a)::before {
    content: '> ';
  }

  :deep(.proof-label),
  :deep(.devlink > a) {
    float: left;
    font-family: var(--bs-font-sans-serif), sans-serif;
    color: var(--bs-secondary);
    text-decoration: none !important;
    font-size: 0.8em;
  }

  :deep(.proof) {
    @include environment;

    border-left: 2px solid rgb(23 23 23 / 20%);
    padding: 0.45rem 0 0.1rem 1rem;
    color: rgb(23 23 23 / 82%);
    transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;

    &:hover {
      border-color: rgb(23 23 23 / 30%);
      color: var(--bs-body-color);
    }
  }

  :deep(.bookref) {
    font-family: var(--bs-font-sans-serif), sans-serif;

    &.book > *:first-child strong {
      @include label-box;
    }

    > *:first-child {
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

  :deep(ol) {
    counter-reset: ol;
    padding-left: 0;

    > li {
      list-style: none;
      counter-increment: ol;
      padding-left: 0;
    }

    > li::marker {
      content: "(" counter(ol, lower-roman) ") ";
    }

    &.safari-ol-fix {
      padding-left: 0;

      .safari-li-fix {
        display: flex;

        > *:not(.safari-marker) {
          flex: 1;
        }

        .safari-marker {
          display: inline-block;
          text-align: right;
          padding-right: 0.3rem;
          min-width: 2rem;
        }
      }
    }
  }

  :deep(.center) {
    text-align: center;
  }
}
</style>
