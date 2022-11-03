<!-- eslint-disable camelcase -->
<template>
  <ac-cell hide-border disable-auto-edit @click-icon="update_value(null)">
    <date-range-picker
      class="ac-cell-date_picker w-100"
      ref="date_picker"
      single-date-picker
      auto-apply
      :date-range="current_date || {}"
      @click.native.prevent
      @update="update_date"
      @toggle="set_edit"
    >
      <template #input>
        <i class="fas fa-calendar"></i>
        <span v-if="current_date_value" class="ml-2">{{current_date_value}}</span>
      </template>
    </date-range-picker>
  </ac-cell>
</template>
<script>
import dateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import moment from 'moment'

import AcCellMixin from '../../mixins/ac-cell'
import AcCellWrapper from './ac-cell-wrapper'

/**
 * Ac Cell Phone - view of cell type of 'date'
 *
 * @mixin AcCellMixin
 * @requires AcCellWrapper
 * @requires dateRangePicker
 */
export default {
  name: 'ac-cell-date',

  mixins: [AcCellMixin],

  components: {
    'ac-cell': AcCellWrapper,
    dateRangePicker
  },

  watch: {
    edit_mode (value) {
      if (!value && this.$refs.date_picker) {
        this.$refs.date_picker.clickAway()
      }
    }
  },

  computed: {
    // Create value for dateRangePicker component
    current_date () {
      return moment(this.current_value).isValid()
        ? {
          startDate: this.current_date_value,
          endDate: this.current_date_value
        }
        : null
    },

    // Parse current value to moment and format
    current_date_value () {
      // eslint-disable-next-line camelcase
      const moment_date = moment(this.current_value)
      return moment_date.isValid() ? moment_date.format('MM-DD-YYYY') : null
    }
  },

  methods: {
    update_date (picked) {
      // eslint-disable-next-line camelcase
      const formated_date = moment(picked.startDate).format('MM-DD-YYYY')
      this.update_value(formated_date)
    }
  }
}
</script>
<style>
.vue-daterange-picker {
  position: unset !important;
}
.ac-cell-date_picker {
  z-index: unset !important;
}
.ac-cell-date_picker .form-control {
  z-index: 2;
}
.ac-cell-date_picker .daterangepicker {
  z-index: 3;
}
</style>
