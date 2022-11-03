<template>
  <div :class="cell_classes" @click="edit">
    <div class="ac-cell-wrapper_inner" :style="cell_styles">
      <slot name="default"></slot>
    </div>

    <slot name="icon">
      <div
        v-if="!is_edit"
        class="ac-cell_clean align-items-center"
        @click.stop="$emit('click-icon')"
      >
        <i class="fas fa-times-circle"></i>
      </div>
    </slot>
  </div>
</template>
<script>
/**
 * Ac Cell Wrapper - wrapper of table cell
 */
export default {
  name: 'ac-cell-wrapper',

  props: {
    hide_border: {
      type: Boolean,
      default: false
    },

    max_width: Number
  },

  computed: {
    is_edit () {
      return this.$parent.edit_mode
    },

    cell_classes () {
      return [
        'ac-cell-wrapper',
        {
          'ac-cell-wrapper_before': !this.hideBorder,
          'ac-cell-edit': this.is_edit
        }
      ]
    },

    cell_styles () {
      if (!this.maxWidth) return null
      return {
        maxWidth: `${this.maxWidth}px`
      }
    }
  },

  methods: {
    edit (value) {
      if (typeof this.$parent.set_edit === 'function') {
        this.$parent.set_edit(value)
      }

      this.$emit('update:edit', value)
    }
  }
}
</script>
<style scoped>
.ac-cell-wrapper {
  /* width: 100%; */
  min-height: 25px;
  height: 100%;
  position: relative;
  cursor: text;
  text-align: inherit;
}
.ac-cell-wrapper > * {
  z-index: 1;
}
.ac-cell-wrapper_inner {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ac-cell-wrapper_inner > * {
  text-overflow: inherit;
  overflow: inherit;
  width: 100%;
}

.ac-cell-wrapper_before::before {
  content: "";
  display: none;
  position: absolute;
  top: -2px;
  bottom: -2px;
  right: -2px;
  left: -2px;
  border: 1px dashed;
  pointer-events: none;
}
.ac-cell-wrapper:hover .ac-cell_clean,
.ac-cell-wrapper_before:hover:not(.ac-cell-edit)::before {
  display: flex !important;
}
.ac-cell_clean {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0.5;
  padding: 0.2rem;
  z-index: 2;
  cursor: pointer;
  height: 100%;
  background: white;
  box-shadow: -10px 0px 12px -5px white;
  color: inherit;
}

.ac-cell_clean:hover {
  opacity: 1;
}
/* box-shadow: inset 0 0 0 1px #99d4ff; */
</style>
