<template>
  <div v-if="$fetchState.pending">
    <spring-spinner />
  </div>
  <div v-else-if="books">
    <social-head title="Bibliographie" />
    <h1>Bibliographie</h1>
    <cards :items="books" :search-fields="['title', 'subtitle', 'short', 'authors', 'publisher']">
      <template #default="slotProps">
        <book-card :book="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error-code="404" />
  </div>
</template>

<script>
import BookCard from '~/components/Cards/BookCard'

export default {
  components: { BookCard },
  data () {
    return {
      books: null
    }
  },
  async fetch () {
    this.books = await this.$content('livres')
      .sortBy('title')
      .fetch()
  },
  head () {
    return {
      title: 'Bibliographie'
    }
  }
}
</script>
