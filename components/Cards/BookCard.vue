<template>
  <b-row :id="book.short" class="book">
    <b-col cols="12" md="4" lg="3" class="d-flex align-items-center justify-content-center pt-3 pb-4 pt-md-0 pb-md-0">
      <img class="preview" :src="book.preview" :alt="alt">
    </b-col>
    <b-col class="info" cols="12" md="8" lg="9">
      <h2 class="mb-0">
        <strong v-text="book.title" /> {{ book.subtitle }}
      </h2>
      <span class="text-muted d-block">
        {{ authors }}
        &bull;
        {{ book.date }}
        &bull;
        Éditions {{ book.publisher }}
        <span v-if="book.edition">&bull; {{ book.edition }}<sup>ème</sup> édition</span>
      </span>
      <p class="mt-2 comment" v-text="book.comment" />
      <small class="text-muted d-block mb-2">
        <u>Référence :</u> <strong v-text="short" />.
      </small>
      <b-btn-group class="mt-2 align-self-start">
        <b-btn :href="`${book.buy}`" variant="dark">
          <b-icon-cart /> Acheter le livre
        </b-btn>
        <b-btn :href="`${book.website}`">
          <b-icon-info-circle /> Plus d'informations
        </b-btn>
      </b-btn-group>
    </b-col>
  </b-row>
</template>

<script>
import { BIconCart, BIconInfoCircle } from 'bootstrap-vue'

export default {
  name: 'BookCard',
  components: { BIconCart, BIconInfoCircle },
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  computed: {
    alt () {
      let alt = this.book.title
      if (this.book.subtitle) {
        alt += ': ' + this.book.subtitle
      }
      return alt
    },
    authors () {
      return this.book.authors.join(', ')
    },
    short () {
      return `[${this.book.short}]`
    }
  }
}
</script>

<style lang="scss" scoped>
.book {
  .preview {
    height: 250px;
  }

  .info {
    display: flex;
    flex-direction: column;

    .comment {
      flex: 1;
    }
  }
}
</style>
