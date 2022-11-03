<template>
  <ac-summary-wrapper v-if="show" :summary="current_summary" @update:summary="update_summary">
    <component :is="current_summary.view" :column="column" :table_data="table_data" />
  </ac-summary-wrapper>
</template>
<script>
import acSummaryWrapper from './ac-summary-wrapper'
import acSummaryNumber from './ac-summary-number'

const TYPES = {
  number: 'ac-summary-number',
  status: 'ac-summary-status'
}

/**
 * Ac Summary - view of summary cell
 */
export default {
  name: 'ac-summary',

  components: {
    acSummaryWrapper,
    acSummaryNumber
  },

  props: {
    column: {
      type: Object,
      default: () => ({})
    },

    table_data: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    /**
     * Current summary object
     * @returns { {view: Object, type: String, params: Object} }
     */
    current_summary () {
      const name = Object.keys(TYPES).find(type => type === this.column.type)
      const params = this.column.summary || {}
      return {
        view: TYPES[name],
        type: name,
        params
      }
    },

    /**
     * Check of possibility summary type for current column
     * @returns {boolean}
     */
    show () {
      return Object.keys(TYPES).indexOf(this.column.type) > -1
    }
  },

  methods: {
    /**
     * Updating column summary
     * @param {Object} changes
     */
    update_summary (changes) {
      // eslint-disable-next-line camelcase
      const new_column = { ...this.column, ...changes }
      this.$emit('update:column', new_column)
    }
  }
}
</script>
<style scoped>
</style>
