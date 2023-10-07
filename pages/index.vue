<script setup lang="ts">
import { siteMeta } from '~/site/meta'
</script>

<template>
  <div>
    <page-head title="Accueil" />
    <h1>Bienvenue !</h1>
    <p>
      Bonjour et bienvenue sur ce site où je mettrai tout un tas de resources concernant l'agrégation de mathématiques.
    </p>
    <p>
      Vous trouverez donc sur ce site :
    </p>
    <ul>
      <li>
        Mes <nuxt-link to="/lecons/">plans</nuxt-link> de leçons.
      </li>
      <li>
        Mon choix de <nuxt-link to="/developpements/">développements</nuxt-link>.
      </li>
      <li>
        Ma <nuxt-link to="/bibliographie/">bibliographie</nuxt-link> personnelle.
      </li>
    </ul>
    <p>
      En espérant que le contenu de ce site vous aide dans votre préparation à l'oral. Si vous avez une quelconque remarque
      / idée / correction à me soumettre, vous pouvez me contacter via <a href="https://skyost.eu/fr/#contact">le formulaire</a>
      présent sur mon site.
    </p>
    <h2>Liens utiles</h2>
    <p>
      Je me permets de glisser quelques liens vers des sites qui m'ont grandement aidés personnellement :
    </p>
    <ul>
      <li>
        Le <a href="https://agreg.org">site du jury</a>. Vous y trouverez des annales, les rapports des années passés,
        les convocations aux oraux, des informations pratiques, ... Bref, à consulter régulièrement !
      </li>
      <li>
        <a href="https://agreg-maths.fr/">agreg-maths.fr</a>. Un super site qui contient plein de plans, de développements,
        et d'outils en tout genre pour préparer votre oral. Je ne peux que conseiller les profils
        d'<a href="https://agreg-maths.fr/users/21875">Owen</a>,
        d'<a href="https://agreg-maths.fr/users/32881">Antoine</a>,
        d'<a href="https://agreg-maths.fr/users/629">Inès</a> et de
        <a href="https://agreg-maths.fr/users/156">Marie</a>.
      </li>
      <li>
        <a href="https://www.coquillagesetpoincare.fr/agregation-2019.html">Coquillages & Poincaré</a>. Véritable mine
        d'or remplie de plans et de développements avec des références très précises.
      </li>
    </ul>
    <h2>Licence</h2>
    <p>
      Les contenus présents sur ce site sont disponibles sous licence
      <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr">CC BY-NC-SA 4.0</a>.
      Le site est, pour sa part, totalement <a :href="`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/blob/master/LICENSE`">open-source</a>.
      Vous pouvez aller consulter son code source sur <a :href="`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}`">Github</a>.
    </p>
  </div>
</template>
