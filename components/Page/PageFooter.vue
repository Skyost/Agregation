<template>
  <footer id="page-footer" class="bg-dark">
    <b-container class="pt-4 pb-4">
      <b-row>
        <b-col cols="12" md="6" class="mb-4 mb-md-0">
          <h2>Copyright</h2>
          <p>
            Copyright &copy; 2021 - <a href="https://skyost.eu">Hugo Delaunay</a>. Tous droits réservés.
          </p>
          <p class="mb-0">
            Les contenus de ce site sont disponibles sous licence
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr">CC BY-NC-SA 4.0</a>.
            Le site en lui-même est totalement <a :href="`${githubPage}/blob/master/LICENSE`">open-source</a>,
            vous pouvez aller voir ça sur <a :href="githubPage">Github</a>.
          </p>
        </b-col>
        <b-col cols="12" md="6">
          <h2>PDFs</h2>
          <p>
            Les contenus du site ont été écrits en <a href="https://fr.wikipedia.org/wiki/LaTeX">LaTeX</a>, et sont
            par conséquent téléchargeables en PDF.
          </p>
          <ul class="mb-0">
            <li><a href="/pdf/lecons.pdf">Plans de leçons</a></li>
            <li><a href="/pdf/developpements.pdf">Développements</a></li>
            <li><a href="/pdf/lecons-developpements.pdf">Plans de leçons &amp; développements</a></li>
          </ul>
        </b-col>
      </b-row>
    </b-container>
  </footer>
</template>

<script>
import { GITHUB_PAGE } from '~/utils/site'

export default {
  name: 'PageFooter',
  data () {
    return {
      githubPage: GITHUB_PAGE
    }
  }
}
</script>

<style lang="scss" scoped>
#page-footer {
  padding: 0.5rem 1rem;
  color: rgba(white, 0.5);

  h2 {
    font-size: 1.5em;
    color: rgba(white, 0.75);
    border-bottom: 1px solid rgba(white, 0.75);
    padding-bottom: 0.15em;
    margin-bottom: 0.5em;
  }

  a {
    text-decoration: underline;
    color: rgba(white, 0.75);
  }
}
</style>
