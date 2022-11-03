<template>
  <div class="text-center">
    <b>{{ full_value }}</b>
    <br />
    {{label}}
  </div>
</template>
<script>
import { GetCellText, GetRoundedNumber, MathOfNumbers } from '../../js/utils'

/**
 * Ac Summary Number - view of summary cell for column type of number
 */
export default {
  name: 'ac-summary-number',
  props: {
    column: {
      type: Object,
      required: true
    },

    table_data: {
      type: Array,
      default: () => []
    },

    // Default function
    default_type: {
      type: String,
      validator: val => Object.keys(MathOfNumbers).includes(val),
      default: 'sum'
    }
  },
  computed: {
    /**
     * Create formatted cell value by summary options
     * @returns {String}
     */
    full_value () {
      const { type } = this.column.summary || {}
      let value = this.calculate_value(this.table_data, this.column.key, type)
      value = GetRoundedNumber(value, 2)
      return typeof value === 'number'
        ? GetCellText(value, this.column.summary)
        : value
    },

    /**
     * Formatted selected option
     * @returns {String}
     */
    label () {
      const type = this.column.summary && this.column.summary.type
      return this.get_label(type)
    },

    types () {
      return MathOfNumbers
    }
  },

  methods: {
    get_label (type = this.default_type) {
      // eslint-disable-next-line camelcase
      const first_char = type.substr(0, 1).toUpperCase()
      // eslint-disable-next-line camelcase
      return first_char + type.substr(1)
    },

    /**
     * Calculate value by selected function
     * @param {Array} arr
     * @param {String} key
     * @param {String} type
     * @returns {Number}
     */
    calculate_value (arr, key, type = this.default_type) {
      // eslint-disable-next-line camelcase
      const arr_number = arr
        .map(row => parseFloat(row[key]))
        .filter(item => !isNaN(item))
      const value = MathOfNumbers[type](arr_number)
      return typeof value !== 'number' ? value
        : isFinite(value) && !isNaN(value) ? value : 0
    }
  }
}
</script>
<style scoped>
</style>
