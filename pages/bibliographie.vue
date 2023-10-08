<script setup lang="ts">
import type { Book } from '~/types'
import BookCard from '~/components/Cards/BookCard.vue'

const route = useRoute()
const { pending, data: books } = useLazyAsyncData(
  route.path,
  () => queryContent<Book>('livres')
    .sort({ title: 1 })
    .find()
)
</script>

<template>
  <div>
    <page-head title="Bibliographie" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="books">
      <h1>Bibliographie</h1>
      <cards :items="books" :search-fields="['title', 'subtitle', 'short', 'authors', 'publisher']">
        <template #default="slotProps">
          <book-card :book="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="500" />
    </div>
  </div>
</template>
