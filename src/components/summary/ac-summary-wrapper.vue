<template>
  <b-dropdown auto no-caret variant="link" ref="dropdown" class="w-100">
    <template #button-content>
      <slot></slot>
    </template>

    <!-- Number type form -->
    <template v-if="summary.type === 'number'">
      <b-dropdown-form>
        <b-form-group label="Unit of measurement" class="inline-form" @submit.stop.prevent>
          <b-form-radio-group
            size="sm"
            :options="unit_options"
            :checked="checked_unit"
            @input="update_params('unit', $event)"
            buttons
            button-variant="outline-info"
          ></b-form-radio-group>

          <b-form-input
            :value="unit_input_value"
            size="sm"
            type="text"
            class="mr-5"
            @input="update_custom_unit"
          />

          <b-form-radio-group
            size="sm"
            :options="pre_options"
            :checked="checked_pre"
            @input="update_params('pre', $event)"
            ref="pre_input"
            buttons
            button-variant="outline-info"
          ></b-form-radio-group>
        </b-form-group>

        <b-form-group label="Function">
          <b-form-radio-group
            size="sm"
            :options="type_options"
            :checked="checked_type"
            @input="update_params('type', $event)"
            name="buttons-1"
            buttons
            button-variant="outline-info"
          ></b-form-radio-group>
        </b-form-group>
      </b-dropdown-form>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-text>Value {{ checked_type }}: {{full_value}}</b-dropdown-text>
    </template>
  </b-dropdown>
</template>
<script>

/**
 * Ac Summary Wrapper - wrapper for 'summary' components
 */
export default {
  name: 'ac-summary-wrapper',

  props: {
    summary: {
      type: Object,
      required: true
    }
  },

  computed: {
    unit_input_value () {
      const {
        params: { unit }
      } = this.summary
      return typeof unit === 'string' ? null : unit && unit.value
    },

    checked_unit () {
      return this.summary.params.unit || this.unit_options[0]
    },

    checked_pre () {
      return this.summary.params.pre || this.pre_options[0]
    },

    checked_type () {
      return this.summary.params.type || 'sum'
    },

    /**
     * Get cell value
     * @returns {String}
     */
    full_value () {
      const { dropdown } = this.$refs
      return dropdown && dropdown.$children[0]
        ? dropdown.$children[0].full_value
        : this.full_value_init
    }
  },

  data () {
    return {
      unit_options: ['not', '$', '€', '£', '%'],

      pre_options: ['L', 'R'],

      // Options for function select - only for number type column
      type_options: [],

      full_value_init: null
    }
  },

  mounted () {
    this.set_options()
  },

  methods: {
    /**
     * Set function options for select
     */
    set_options () {
      if (this.$refs.dropdown && this.summary.type === 'number') {
        const {
          types,
          // eslint-disable-next-line camelcase
          get_label,
          // eslint-disable-next-line camelcase
          full_value
        } = this.$refs.dropdown.$children[0]
        this.type_options = Object.keys(types).map(type => ({
          text: get_label(type),
          value: type
        }))
        // eslint-disable-next-line camelcase
        this.full_value_init = full_value
      }
    },

    /**
     * Set custom unit
     * @param {String} value
     */
    update_custom_unit (value) {
      const obj = {
        value,
        custom: true
      }
      this.update_params('unit', obj)
    },

    /**
     * Update summary params
     * @param {String} key
     * @param {any} value
     */
    update_params (key, value) {
      // eslint-disable-next-line camelcase
      const new_summary_params = { ...this.summary.params, [key]: value }
      // eslint-disable-next-line camelcase
      const new_summary = { ...this.summary }
      // eslint-disable-next-line camelcase
      new_summary.summary = new_summary_params
      this.$emit('update:summary', new_summary)
    }
  }
}
</script>
<style>
.inline-form [role="group"] {
  display: flex;
}
</style>
