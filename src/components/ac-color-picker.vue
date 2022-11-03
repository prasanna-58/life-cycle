<template>
  <b-modal ref="b_modal" hide-backdrop hide-footer @hidden="on_hidden">
    <template #modal-header>
      <h5 class="d-flex">
        Change color
        <div
          class="ac-color-picker_item mr-2 ml-2"
          :style="current_style"
        ></div>
        to:
        <div
          class="ac-color-picker_item mr-2 ml-2"
          :style="{ background: hover_item }"
        ></div>
      </h5>
      <b-button size="sm" variant="outline-danger" @click="hide">
        <i class="fas fa-times"></i>
      </b-button>
    </template>

    <template>
      <b-form-group class="ac-color-picker_form">
        <b-form-radio
          v-for="color in options"
          :key="`color_${color}`"
          :value="color"
          :checked="value"
          button
          button-variant="link"
          inline
          @input="on_input_color"
        >
          <div
            @mouseover="on_hover_color(color)"
            @mouseleave="on_leave_color"
            class="ac-color-picker_item"
            :style="{ background: color }"
          ></div>
        </b-form-radio>
      </b-form-group>
    </template>
  </b-modal>
</template>
<script>
const colors = [
  'rgb(3, 127, 76)',
  'rgb(0, 200, 117)',
  'rgb(156, 211, 38)',
  'rgb(202, 182, 65)',
  'rgb(120, 75, 209)',
  'rgb(162, 93, 220)',
  'rgb(0, 134, 192)',
  'rgb(87, 155, 252)',
  'rgb(102, 204, 255)',
  'rgb(187, 51, 84)',
  'rgb(226, 68, 92)',
  'rgb(255, 21, 138)',
  'rgb(255, 90, 196)',
  'rgb(255, 100, 46)',
  'rgb(253, 171, 61)',
  'rgb(127, 83, 71)',
  'rgb(196, 196, 196)',
  'rgb(128, 128, 128)',
  'rgb(51, 51, 51)'
]

/**
 * Ac Color Picker - color picker in modal
 *
 * @event hover
 * @param {String}
 *
 * @event update:value
 * @param {String}
 */
export default {
  name: 'ac-color-picker',

  props: {
    value: String
  },

  data () {
    return {
      hover_item: null,
      hide_animation: false
    }
  },

  computed: {
    current_style () {
      return {
        background: this.value
      }
    },

    /**
     * Colors without current value
     * @returns {Array<String>}
     */
    options () {
      // eslint-disable-next-line camelcase
      const copy_colors = [...colors]
      // eslint-disable-next-line camelcase
      const color_index = copy_colors.findIndex(color => color === this.value)
      // eslint-disable-next-line camelcase
      color_index > -1 && copy_colors.splice(color_index, 1)

      // eslint-disable-next-line camelcase
      return copy_colors
    }
  },

  methods: {
    /**
     * Show modal
     */
    show () {
      if (!this.$refs.b_modal) return
      this.$refs.b_modal.show()
    },

    /**
     * Hide modal
     */
    hide () {
      if (!this.$refs.b_modal) return
      this.hide_animation = true
      this.$refs.b_modal.hide()
      this.hover_item = null
      this.$emit('hide')
    },

    on_hidden () {
      this.hide_animation = false
    },

    /**
     * Emit selected color
     * @param {string} value
     */
    on_input_color (value) {
      this.hover_item = null
      this.$emit('update:value', value)
      this.on_leave_color()
      this.hide()
    },

    on_hover_color (value) {
      if (this.hide_animation) return
      this.hover_item = value
      this.$emit('hover', value)
    },

    on_leave_color () {
      this.hover_item = null
      this.$emit('hover', null)
    }
  }
}
</script>
<style>
.ac-color-picker_item {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.ac-color-picker_form label {
  background: none;
  border: none;
}

.ac-color-picker_form div[role="group"] {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>
