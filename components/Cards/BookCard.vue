<script setup lang="ts">
import type { Book } from '~/types'

const props = defineProps<{ book: Book }>()

const alt = computed(() => {
  let alt = props.book.title
  if (props.book.subtitle) {
    alt += ': ' + props.book.subtitle
  }
  return alt
})
const authors = computed(() => props.book.authors.join(', '))
const short = computed(() => `[${props.book.short}]`)
const image = computed(() => `/images/livres/${props.book.isbn10}.jpg`)
const date = computed(() => {
  const parts = props.book.date.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
})

const changeImageSrc = (event: Event) => {
  const newSrc = `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${props.book.isbn10}&Format=_SL250_&ID=AsinImage&MarketPlace=FR&ServiceVersion=20070822&WS=1&tag=skyost-21&language=fr_FR`
  const imageElement = event.target as HTMLImageElement
  imageElement.src = newSrc
  imageElement.onerror = null
}
</script>

<template>
  <ski-columns :id="book.short" class="book">
    <ski-column cols="12" md="4" lg="3" class="d-flex align-items-center justify-content-center pt-3 pb-4 pt-md-0 pb-md-0">
      <img class="preview" :src="image" :alt="alt" @error="changeImageSrc">
    </ski-column>
    <ski-column class="info" cols="12" md="8" lg="9">
      <h2 class="title">
        <strong v-text="book.title" /> {{ book.subtitle }}
      </h2>
      <span class="text-muted d-block">
        {{ authors }}
        &bull;
        {{ date }}
        &bull;
        Éditions {{ book.publisher }}
        <span v-if="book.edition">&bull; {{ book.edition }}<sup>ème</sup> édition</span>
      </span>
      <p class="mt-2 comment" v-text="book.comment" />
      <small class="text-muted d-block mb-2">
        <u>Référence :</u> <strong v-text="short" />.
      </small>
      <ski-button-group class="mt-2 align-self-start">
        <ski-button :href="`${book.buy}`">
          <ski-icon icon="cart" /> Acheter le livre
        </ski-button>
        <ski-button :href="`${book.website}`" variant="secondary">
          <ski-icon icon="info-circle" /> Plus d'informations
        </ski-button>
      </ski-button-group>
    </ski-column>
  </ski-columns>
</template>

<style lang="scss" scoped>
.book {
  .preview {
    height: 250px;
  }

  .info {
    display: flex;
    flex-direction: column;

    .title {
      border-bottom: none !important;
      margin-bottom: 0 !important;
    }

    .comment {
      flex: 1;
    }
  }
}
</style>
