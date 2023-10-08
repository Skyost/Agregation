<script setup lang="ts">
import LessonCard from '~/components/Cards/LessonCard.vue'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'

const route = useRoute()
const keywords = ref<string>(route.query.requete?.toString() ?? '😉')

const { pending: lessonsQueryPending, data: lessons } = useLazyAsyncData(
  route.fullPath + '&lecons',
  () => queryContent('lecons')
    .where({
      'page-title-search': { $regex: `/${keywords.value}/ig` }
    })
    .sort({ slug: 1 })
    // TODO: Follow this issue : https://github.com/nuxt/content/issues/1758 for implementing a "true" search page.
    .find()
)

const { pending: developmentsQueryPending, data: developments } = useLazyAsyncData(
  route.fullPath + '&developpements',
  () => queryContent('developpements')
    .where({
      title: { $regex: `/${keywords.value}/ig` }
    })
    .sort({ slug: 1 })
    .find()
)
</script>

<template>
  <div>
    <page-head title="Recherche" />
    <div v-if="lessonsQueryPending || developmentsQueryPending">
      <spinner />
    </div>
    <div v-else-if="lessons && developments">
      <h2>Recherche</h2>
      <p v-if="lessons.length > 0 || developments.length > 0">
        Voici les résultats pour votre recherche <q v-text="keywords" />.
      </p>
      <p v-else class="mb-0">
        Votre recherche n'a donné aucun résultat.
      </p>

      <div>
        <h3>Leçons</h3>
        <p v-if="lessons.length === 0" class="mb-0">
          Aucun plan de leçon trouvé pour cette recherche.
        </p>
        <cards v-if="lessons.length > 0" :items="lessons">
          <template #default="slotProps">
            <lesson-card :lesson="slotProps.item" />
          </template>
        </cards>
      </div>
      <div class="mt-4">
        <h3>Développements</h3>
        <p v-if="developments.length === 0" class="mb-0">
          Aucun développement trouvé pour cette recherche.
        </p>
        <cards v-if="developments.length > 0" :items="developments">
          <template #default="slotProps">
            <development-card :development="slotProps.item" />
          </template>
        </cards>
      </div>
    </div>
    <div v-else>
      <error-display error="500" />
    </div>
  </div>
</template>
