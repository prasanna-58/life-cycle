<template>
  <ac-cell :max-width="column.width" @click-icon="update_value(null)">
    <div v-if="!edit_mode">{{current_value | validate_value(column)}}</div>
    <input
      v-else
      v-focus
      :class="['p-0 m-0', input_attrs._class]"
      ref="value-input"
      v-bind="input_attrs"
      :value="current_value"
      @keyup.enter="update_value($refs['value-input'].value)"
      @blur="update_value($refs['value-input'].value)"
    />
  </ac-cell>
</template>
<script>
import AcCellMixin from '../../mixins/ac-cell'
import AcCellWrapper from './ac-cell-wrapper'

/**
 * Ac Cell Text - view of cell type of 'text'
 *
 * @mixin AcCellMixin
 * @requires AcCellWrapper
 */
export default {
  name: 'ac-cell-text',

  mixins: [AcCellMixin],

  components: {
    'ac-cell': AcCellWrapper
  },

  computed: {
    input_attrs () {
      return {
        input_type: 'text'
      }
    }
  }
}
</script>
<style>
.ac-cell-text input {
  border: 1px dashed;
  font-weight: inherit;
  width: inherit;
  text-align: inherit;
}
.ac-cell-text input:focus {
  outline: none;
  border-color: var(--primary);
}
</style>
