<template>
  <nuxt-content class="math-document" :document="document" />
</template>

<script>
export default {
  name: 'MathDocument',
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      const references = this.$el.querySelectorAll('.bookref')
      let rightColumnWidth = 0
      for (const reference of references) {
        rightColumnWidth = Math.max(rightColumnWidth, reference.firstElementChild.offsetWidth)
      }
      const paddingRight = `${rightColumnWidth + 15}px`
      this.$el.style.paddingRight = paddingRight
      for (const reference of references) {
        reference.firstChild.style.right = paddingRight
      }

      const tables = this.$el.querySelectorAll('.math-document table')
      for (const table of tables) {
        table.classList.add('table')
        table.classList.add('table-bordered')
        table.classList.add('table-hover')
      }
    })
  }
}
</script>

<style lang="scss" scoped>
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
}

.math-document {
  position: relative;

  ::v-deep {
    .doccategories {
      display: none;
    }

    .docsummary {
      font-style: italic;
      color: rgba(black, 0.6);
    }

    .property {
      @include environment(#fffde7);
    }

    .proposition {
      @include environment(#fff8e1);
    }

    .lemma {
      @include environment(#fff3e0);
    }

    .theorem {
      @include environment(#fce4f2);
    }

    .corollary {
      @include environment(#ffebee);
    }

    .definition {
      @include environment(#ede7f6);
    }

    .notation {
      @include environment(#f3e5f5);
    }

    .example {
      @include environment(#e0f7fa);
    }

    .cexample {
      @include environment(#efebe9);
    }

    .application {
      @include environment(#e0f2f1);
    }

    .remark {
      @include environment(#e8f5e9);
    }

    .proof {
      @include environment(#e1f5fe);

      margin-bottom: 0;

      &::after {
        float: right;
        content: '\220e';
      }

      > :first-child {
        display: inline;
      }
    }

    .bookref {
      // position: relative;

      > *:first-child {
        @include bubble(rgba(black, 0.05), rgba(black, 0.1), false);

        position: absolute;
        // right: 0;
        text-align: center;
        padding: 7.5px;
        margin-left: 10px;
        font-size: 0.75em;
        text-decoration: none;
        color: black;
        transform: translateX(calc(100% + 15px));
      }

      p {
        margin-bottom: 0;
      }
    }

    .table {
      background-color: white;
    }

    .center {
      text-align: center;
    }
  }
}
</style>
