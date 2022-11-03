export default {
  computed: {
    /**
     * Current cell value
     * @returns {*}
     */
    current_value () {
      return this.value[this.column.key]
    }
  },

  data () {
    return {
      // Edit state
      edit_mode: false
    }
  },

  props: {
    // Table row
    value: {
      type: Object
    },

    // Table column
    column: {
      type: Object
    }
  },

  directives: {
    // Autofocus
    focus: {
      inserted (el) {
        el.focus()
      }
    }
  },

  filters: {
    validate_value (val, column) {
      return val
    }
  },

  methods: {
    /**
     * Emit value
     * @param {any} value
     */
    update_value (value) {
      this.edit_mode = false
      const obj = {
        ...this.value,
        [this.column.key]: value
      }
      this.$emit('update:value', obj)
    },

    /**
     * Set edit state
     * @param {Boolean} value
     */
    set_edit (value) {
      this.edit_mode = Boolean(value)
    }
  }
}
