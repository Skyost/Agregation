<script setup lang="ts">
import type { Ref } from 'vue'
import LessonCard from '~/components/Cards/LessonCard.vue'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'
import type { LatexContentObject, Development, Lesson } from '~/types'

const route = useRoute()
const request = computed<string | undefined>(() => route.query.requete?.toString())
const regexPattern = computed<string>(() => request.value ? normalizeString(request.value.toString()) : '.*')

const { pending: lessonsQueryPending, data: allLessons } = useLazyAsyncData(
  route.path + '?lecons',
  // TODO: Follow this issue : https://github.com/nuxt/content/issues/1758 for implementing a "true" search page.
  () => queryContent<Lesson>('latex', 'lecons')
    .sort({ slug: 1 })
    .without(['body'])
    .find()
)

const { pending: developmentsQueryPending, data: allDevelopments } = useLazyAsyncData(
  route.path + '?developpements',
  () => queryContent<Development>('latex', 'developpements')
    .sort({ slug: 1 })
    .without(['body'])
    .find()
)

const doSearch = <T extends LatexContentObject>(list: Ref<Omit<T, string>[] | null>): T[] => {
  const result: T[] = []
  if (!list.value) {
    return result
  }
  for (const value of list.value) {
    const regex = RegExp(regexPattern.value, 'ig')
    const latexObject = value as T
    if (regex.test(latexObject['page-name-search'])) {
      result.push(latexObject)
    }
  }
  return result
}

const lessons = computed<Lesson[]>(() => doSearch<Lesson>(allLessons))
const developments = computed<Lesson[]>(() => doSearch<Development>(allDevelopments))
const isEmpty = computed(() => lessons.value.length === 0 && developments.value.length === 0)
</script>

<template>
  <div>
    <page-head title="Recherche" />
    <div v-if="lessonsQueryPending || developmentsQueryPending">
      <spinner />
    </div>
    <div v-else-if="lessons && developments">
      <h2>Recherche</h2>
      <p v-if="isEmpty">
        Votre recherche n'a donné aucun résultat.
      </p>
      <p v-else class="mb-0">
        Voici les résultats pour votre recherche de <q v-text="request && request.length > 0 ? request : 'Tout'" />.
      </p>

      <div v-if="lessons && !isEmpty" class="mt-4">
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
      <div v-if="developments && !isEmpty" class="mt-4">
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
