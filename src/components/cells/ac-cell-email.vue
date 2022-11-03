<template>
  <ac-cell @click-icon="update_value(null)">
    <b-button @mousedown="edit_mode = !edit_mode" ref="label" variant="link">{{label}}</b-button>

    <b-popover
      :target="popover_target"
      :show.sync="edit_mode"
      triggers="focus"
      placement="bottom"
      ref="popover"
      @hide="update_email"
    >
      <b-form-group class="ac-cell-email_form" label="Email" @submit.stop.prevent>
        <b-form-input
          autofocus
          size="sm"
          placeholder="email@example.com"
          ref="email-input"
          :value="email"
          @keyup.enter="update_email"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Label">
        <b-form-input
          type="text"
          size="sm"
          ref="label-input"
          :value="label"
          @keyup.enter="update_email"
        ></b-form-input>
      </b-form-group>
    </b-popover>
  </ac-cell>
</template>
<script>
import AcCellMixin from '../../mixins/ac-cell'
import AcCellWrapper from './ac-cell-wrapper'

/**
 * Ac Cell Email - view of cell type of 'email'
 *
 * @mixin AcCellMixin
 * @requires AcCellWrapper
 */
export default {
  name: 'ac-cell-email',

  components: {
    'ac-cell': AcCellWrapper
  },

  mixins: [AcCellMixin],

  computed: {
    // Label of email
    label () {
      const val = this.current_value
      return val && val.label
        ? val.label
        : typeof val === 'string'
          ? val
          : null
    },

    email () {
      const val = this.current_value
      return val && val.email
        ? val.email
        : typeof val === 'string'
          ? val
          : null
    }
  },

  data () {
    return {
      popover_target: {}
    }
  },

  mounted () {
    this.popover_target = this.$refs.label
  },

  methods: {
    /**
     * Update cell value
     */
    update_email () {
      const val = {
        email: this.$refs['email-input'].$el.value || '',
        label:
          this.$refs['label-input'].$el.value ||
          this.$refs['email-input'].$el.value ||
          ''
      }

      this.update_value(val)
    }
  }
}
</script>
<style scoped>
.ac-cell-email_form {
  min-width: 200px;
}
</style>
