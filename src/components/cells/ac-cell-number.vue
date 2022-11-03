<script>
import AcCellText from './ac-cell-text'
import { GetCellText, GetRoundedNumber } from '../../js/utils'

/**
 * Ac Cell Phone - view of cell type of 'number'
 *
 * @extends AcCellText
 */
export default {
  name: 'ac-cell-number',

  extends: AcCellText,

  filters: {
    validate_value (val, { summary }) {
      // eslint-disable-next-line camelcase
      const parsed_value = parseFloat(val)
      if (isNaN(parsed_value)) return ''
      const number = GetRoundedNumber(parsed_value, 2)
      return GetCellText(number, summary)
    }
  },

  mounted () {
    this.validate_current_value()
  },

  computed: {
    input_attrs () {
      return {
        type: 'number',
        _class: 'text-center'
      }
    }
  },

  methods: {
    /**
     * Parse current value to number
     */
    validate_current_value () {
      this.update_value(parseFloat(this.current_value))
    }
  }
}
</script>
<style scoped>
</style>
