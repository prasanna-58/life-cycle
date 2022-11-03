<template>
  <ac-cell
    @click-icon="update_value(null)"
    class="d-flex align-items-center justify-content-center"
  >
    <template v-if="!edit_mode">
      <div class="d-flex align-items-center">
        <img v-if="icon" class="mr-1 ac-cell-phone_country" :src="icon" />
        <a @click.stop :href="tel_link" :disable="!is_phone">{{current_value | validate_value }}</a>
      </div>
    </template>
    <input
      v-else
      v-focus
      class="p-0 m-0 text-center"
      ref="value-input"
      v-bind="input_attrs"
      :value="current_value"
      @keyup.enter="update_value($refs['value-input'].value)"
      @blur="update_value($refs['value-input'].value)"
    />
  </ac-cell>
</template>
<script>
import { parsePhoneNumberFromString, findNumbers } from 'libphonenumber-js'
import AcCellMixin from '../../mixins/ac-cell'
import AcCellWrapper from './ac-cell-wrapper'

const countries = {
  RU: 'assets/flags_images/ru.svg',
  US: 'assets/flags_images/us.svg'
}

/**
 * Ac Cell Phone - view of cell type of 'phone'
 *
 * @mixin ac-cell-mixin
 * @requires AcCellWrapper
 */
export default {
  name: 'ac-cell-phone',

  mixins: [AcCellMixin],

  components: {
    'ac-cell': AcCellWrapper
  },

  computed: {
    input_attrs () {
      return {
        type: 'text',
        placeholder: '1 (123) 123 4567'
      }
    },

    /**
     * Create libphonenumber-js instance from cell value
     * @returns {*}
     */
    current_number () {
      const str = (this.current_value && this.current_value.toString()) || ''
      const numbers = findNumbers(str, 'US', { v2: true })
      return numbers.length > 0
        ? parsePhoneNumberFromString(numbers[0].number.number)
        : {}
    },

    tel_link () {
      return this.current_number.getURI && this.current_number.getURI()
    },

    icon () {
      return countries[this.current_number.country]
    },

    is_phone () {
      return this.current_number.isValid
        ? this.current_number.isValid()
        : false
    }
  },

  filters: {
    validate_value (val) {
      const str = (val && val.toString()) || ''
      const number = parsePhoneNumberFromString(str)
      return number && number.formatInternational
        ? number.formatInternational()
        : str
    }
  }
}
</script>
<style scoped>
.ac-cell-phone_country {
  height: 16px;
  min-width: 22px;
  width: auto;
}
</style>
