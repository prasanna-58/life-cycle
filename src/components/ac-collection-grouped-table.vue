<template>
  <div class="ac-table">
    <header v-if="hasHeaderslot" class="ac-table__header my-3">
      <!-- Use this slot for table header -->
      <slot name="header"></slot>
    </header>
    <div v-if="Object.keys(data).length">
      <div
        class="table-responsive"
        @scroll="infiniteScroll"
        :style="scroll_style"
      >
        <table class="table border">
          <thead :class="header_class">
            <tr>
              <!-- Check for bluk prop -->
              <th scope="col" :class="checkbox_class">
                <b-form-checkbox
                  v-if="bulk"
                  v-model="select_all"
                  @change="bulk_actions($event)"
                />
              </th>
              <template v-for="(table_column, index) in table_columns">
                <th
                  scope="col"
                  :class="rclass + table_column.class"
                  :key="index"
                >
                  <div v-if="table_column.label">{{ table_column.label }}</div>
                </th>
              </template>
            </tr>
          </thead>

          <tbody v-for="(value, key) in actual_data" :key="key">
            <tr>
              <!-- Check for group wise bluk actions prop -->
              <td v-if="grouped_bulk && value[0][empty_group_key] != null">
                <b-form-checkbox
                  v-model="group_form[key]"
                  @change.native="grouped_bulk_actions(value)"
                />
              </td>
              <td :colspan="col_span" class="align-middle">
                <!-- Use this slot group_header for each item in response -->
                <slot name="group_header" :group-item="value[0]"></slot>
              </td>
            </tr>
            <template
              v-if="value[0][empty_group_key] == null && empty_group_state"
            >
              <tr>
                <td :colspan="col_span + 1" class="align-middle">
                  <!-- Use this slot group_header for each item in response -->
                  <slot name="empty_group" :data="value"></slot>
                </td>
              </tr>
            </template>
            <template v-else>
              <ac-draggable
                v-model="actual_data[key]"
                class="stretched-table"
                :options="{ disabled: get_enable_drag }"
                @change="on_change($event, actual_data[key])"
              >
                <tr v-for="(innerObject, key) in value" :key="key">
                  <td
                    scope="col"
                    class="align-middle"
                    v-if="bulk || grouped_bulk"
                  >
                    <b-form-checkbox
                      v-model="selected"
                      :value="innerObject"
                      @change.native="checkbox_click(innerObject)"
                    />
                  </td>
                  <template v-for="(column, index) in columns">
                    <td
                      scope="col"
                      class="align-middle"
                      @click="$emit('row_clicked', innerObject)"
                      @dblclick="$emit('row_dblclicked', innerObject)"
                      :key="index"
                    >
                      <div v-if="column.slot || column.__slot__">
                        <slot :name="column.key" :item="innerObject">{{
                          innerObject[column.key]
                        }}</slot>
                      </div>
                      <div v-else>{{ innerObject[column.key] }}</div>
                    </td>
                  </template>
                  <td scope="col" class="align-middle" v-if="dropdown">
                    <slot
                      name="option"
                      :data="{ item: innerObject, index: key }"
                    >
                      <ac-material-dropdown
                        :options="dropdown_options_handler"
                        :button_options="button_options"
                        :right="button_options.right"
                         :show_dropdown_icons="true"
                        @item_click="
                          on_dropdown_item_click($event, innerObject, key)
                        "
                      />
                    </slot>
                  </td>
                  <!-- <slot name="body" :data="value1"></slot> -->
                </tr>
              </ac-draggable>
            </template>
          </tbody>
        </table>
      </div>
      <div v-if="loadmore_icon" class="text-center">
        <img
          src="https://cdn.500apps.io/images/icons/loadmore.gif"
          class="loader__image m-auto"
          alt="loading"
        />
      </div>
    </div>

    <div
      v-if="
        !Object.keys(actual_data).length && data_loaded == true && !is_loading
      "
    >
      <!-- Use this slot for Empty State -->
      <slot name="empty_state"></slot>
    </div>

    <!-- loader image -->
    <div v-show="is_loading" class="loader row">
      <img :src="loading_image" class="loader__image m-auto" alt="loader" />
    </div>

    <!-- <div
      v-show="load_more_type === 'loadMoreButton'"
      ref="loader_div"
      class="load-more text-center mt-2"
    >

      <slot name="load_more_button"></slot>
    </div>-->
    <div
      v-show="load_more_type === 'loadMoreButton'"
      v-if="pagination_type === 'loadMore' && Object.keys(actual_data).length"
      ref="loader_div"
      class="load-more text-center"
    >
      <!--
          Use this slot for load more button, shown only if load_more_type is 'loadMoreButton'
          and there is more data to fetch
      -->
      <slot name="load_more_button">
        <button
          type="button"
          class="btn btn-link"
          :class="page_number >= load_option ? 'd-none' : ''"
          @click="loadmore_click_fun()"
        >
          Load More...
        </button>
      </slot>
    </div>

    <footer class="ac__footer">
      <!-- Use this slot for footer -->
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
import acCollection from './ac-collection.vue'
import acMaterialDropdown from './ac-material-dropdown.vue'
// import group by from lodash
let _groupBy = require('lodash.groupby')
/**
 * ac Table component which can be used to display data from API in table view
 * @requires VueBootstrap
 * @requires ac-collection.vue
 * @requires ac-material-dropdown.vue
 *
 * Fires event on row click and row double click
 * @event row_clicked
 * @event row_dblclicked
 * @type {object} row data
 *
 * @event checkbox_clicked
 * @type {object} row data
 *
 * @inherits ac-collection,ac-data,ac-preload
 *
 * @author Dharma teja TV
 */

export default {
  name: 'ac-collection-grouped-table',

  components: {
    acMaterialDropdown
  },

  extends: acCollection,

  props: {
    // /**
    //  * List of table columns
    //  * @param {array} columns
    //  * @properties {"label": {"type": "String","description":"Give label name of table header"}, "key": {"type": "String","description":"Give key name from the data"}, "__slot__": {"type": "String","description":"write HTML code and data-scope:item"}}
    //  * @label Columns
    //  * @category_name 2_Data
    //  */
    // columns: {
    //   type: Array,
    //   required: true
    // },

    /**
     * Whenever true show checkbox in the first column
     * @param {boolean} bulk
     * @label Bulk
     * @category_name 1_General
     */
    // bulk: {
    //   type: Boolean,
    //   default: false
    // },
    /**
     * Whenever true show checkbox for every group
     * @param {boolean} grouped_bulk
     * @label Grouped Bulk
     * @category_name 1_General
     */
    grouped_bulk: {
      type: Boolean,
      default: false
    },

    /**
     * Whenever true enables the drag and drop functionality
     * @param {boolean} enable_drag
     * @label Enable Drag
     * @category_name 1_General
     */
    enable_drag: {
      type: Boolean,
      default: false
    },

    // /**
    //  * Whenever true show dropdown in the last column
    //  * @param {boolean} dropdown
    //  * @label Dropdown
    //  * @category_name 1_General
    //  */
    // dropdown: {
    //   type: Boolean,
    //   default: false
    // },

    // /**
    //  * Options for dropdown menu for each row
    //  * @param {object} dropdown_options
    //  * @properties {"label": {"type": "String","description":"Give label name of option"}, "type": {"type": "String", "description":"Type of the option Eg:edit,submit..etc"}, "icon": {"type": "String", "description":"Give icon class for option"},
    //  "inside_grid": {
    //        "name":"options",
    //        "handler_name":{"type": "String"},
    //        "handler_params":{"type": "String"}
    //        }}
    //  * @label Dropdown Options
    //  * @category_name 1_General
    //  */
    // dropdown_options: {
    //   type: Array,
    //   required: false
    // },

    // /**
    //  * If true - display dropdown options icon
    //  * @param {boolean} show_dropdown_icons
    //  * @label Show Dropdown Icons
    //  * @category_name 1_General
    //  */
    // show_dropdown_icons: {
    //   type: Boolean,
    //   default: false
    // },

    // /**
    //  * Dropdown Button Options is a object with keys icon, variant, size, right. It shows three dots based upon icon in each row
    //  * @param {object} dropdown_button_options
    //  * @properties
    //     {
    //       "icon": {"type": "String", "default": "fas fa-ellipsis-v","description":"Give button icon class"},
    //       "variant": {"type": "String", "default": "outline-secondary","description":"Give variant class for button", "values": ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"]},
    //       "size": {"type": "String", "default": "sm", "description":"Give size of the button Eg:sm,lg,md", "values": ["sm", "md", "lg"]},
    //       "right": {"type": "Boolean", "default": "true" , "description":"To display dropdown options right or left"}
    //     }
    //  * @label Dropdown Button Options
    //  * @category_name 1_General
    //  */
    // dropdown_button_options: {
    //   type: Object,
    //   required: false
    // },
    // /**
    //  * Data from every request will be grouped with this key
    //  * @param {string} group_key
    //  * Required
    //  * @label Group Key
    //  * @category_name 1_General
    //  */
    // group_key: {
    //   type: String,
    //   required: false
    // },
    /**
     * If true displays empty state for grouped body
     * @param {string} empty_group_state
     * Required
     * @label Empty Group State
     * @category_name 1_General
     */
    empty_group_state: {
      type: Boolean,
      required: false,
      default: false
    },
    /**
     * Checks condition with this key from data
     * @param {string} empty_group_key
     * Required
     * @label Empty Group Key
     * @category_name 1_General
     */
    empty_group_key: {
      type: String,
      required: false
    },
    /**
     * Header class
     * @param {string} header_class
     * Required
     * @label Header Class
     * @category_name 4_Style
     */
    header_class: {
      type: String,
      required: false,
      default: 'bg-light'
    }
  },

  data () {
    return {
      selected: [],
      select_all: false,
      rclass: 'border-bottom-0 text-nowrap ',
      checkbox_class: 'border-bottom-0 text-nowrap ',
      dragged_ids: {},
      group_form: {},
      data_loaded: false,
      store_original_data: [],
      columns: [
        {
          label: 'Task Name',
          key: 'name',
          drag_disable: true,
          actions_disable: true
        },
        {
          label: 'Status',
          key: 'status',
          type: 'text'
        },
        {
          label: 'Priority',
          key: 'priority',
          type: 'text'
        },
        {
          label: 'Assigned Date',
          key: 'assigned_date',
          type: 'date'
        },
        {
          label: 'options',
          key: 'options'
        }
      ],
      bulk: true,
      dropdown: true,
      button_options: {
        icon: 'fas fa-ellipsis-v',
        variant: 'outline-secondary',
        size: 'sm',
        right: true
      },
      options: [
        {
          label: 'Edit',
          type: 'edit',
          icon: 'fas fa-pencil-alt',
          handler: 'hello'
        },
        {
          label: 'Delete',
          type: 'delete',
          icon: 'fas fa-trash-alt',
          handler: 'hello'
        }
      ],
      group_key: 'postId',
      pagination_type: 'loadMore',
      load_more_type: 'loadMoreButton'

    }
  },

  computed: {
    /**
     * To get enable drag option
     * @return {Boolean}
     */
    get_enable_drag () {
      return !this.enable_drag
    },
    /**
     * colspan for td
     * @return {Integer}
     */
    col_span () {
      let tdata = this.columns.length + 1
      if (this.bulk) {
        tdata += 1
      }
      return tdata
    },
    /**
     * Adds column depending on bulk and dropdown props
     * @private
     */
    table_columns () {
      var cols = [...this.columns]
      // Identifies checkbox or options type
      var checkbox = cols.find(c => c.key === 'checkbox')
      var optionsClass = cols.find(c => c.key === 'options')
      var option = {
        label: 'options',
        key: 'options',
        ...(optionsClass || {})
      }
      if (checkbox || optionsClass) {
        for (var i = 0; i < cols.length; i++) {
          if (cols[i].key === 'checkbox') {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.checkbox_class = this.checkbox_class + checkbox.class
            cols.splice(i, 1)
          }
          if (cols[i].key === 'options') {
            option.class = optionsClass.class
            option.width = optionsClass.width
          }
        }
      }
      if (this.dropdown) {
        // eslint-disable-next-line camelcase
        const option_index = cols.findIndex(c => c.key === 'options')
        // eslint-disable-next-line camelcase
        if (option_index >= 0) {
          cols.splice(option_index, 1, option)
        }
        // eslint-disable-next-line camelcase
        if (option_index === -1) {
          let obj = { key: 'options', label: 'options' }
          cols.push(obj)
        }
      }

      return cols
    },

    /**
     * Not used
     * Depends on dropdown_options prop
     * If dropdown prop is true - checks for dropdown_options presense
     * @private
     */
    dropdown_options_handler () {
      if (!this.dropdown) return []

      if (this.dropdown && !this.options) {
        console.error(
          'dropdown_options is required when dropdown prop is true'
        )
        return []
      }

      return [...this.options]
    },
    hasHeaderslot () {
      return !!this.$slots.header
    }
  },

  watch: {
    data: {
      handler (val) {
        this.is_loading = false
        if (
          (this.pagination_type === 'loadMore' ||
            this.pagination_type === 'scroll') &&
          this.page_number
        ) {
          this.store_original_data = this.store_original_data.concat(
            this.original_data
          )
        } else {
          this.store_original_data = this.original_data
        }
        this.actual_data = this.group_array(
          this.sort_array(this.store_original_data)
        )
        // this.actual_data = this.data;
      },
      deep: true
    },
    actual_data () {
      this.data_loaded = true
      this.is_loading = false
      if (this.select_all) this.bulk_actions(true)
      // for grouped bulk actions
      // initially making grouped check boxes as false from keys
      // eslint-disable-next-line camelcase
      var grouped_keys = Object.keys(this.actual_data)
      for (var i = 0; i < grouped_keys.length; i++) {
        this.group_form[grouped_keys[i]] = false
      }
    },
    selected (newval, oldval) {
      if (this.grouped_bulk) {
        // making group checkbox checked if we select all the rows one by one
        // eslint-disable-next-line camelcase
        let selected_group = _groupBy(this.selected, this.group_key)
        if (Object.keys(selected_group).length > 0) {
          // eslint-disable-next-line camelcase
          for (var key in selected_group) {
            if (selected_group[key].length === this.actual_data[key].length) {
              this.group_form[key] = true
            } else {
              this.group_form[key] = false
            }
          }
        } else {
          // eslint-disable-next-line camelcase
          var grouped_keys = Object.keys(this.actual_data)
          for (var i = 0; i < grouped_keys.length; i++) {
            this.group_form[grouped_keys[i]] = false
          }
        }
      }
      this.select_checkbox(newval)
    }
  },

  methods: {
    /**
     * Execute selected checkbox
     */
    select_checkbox (newval) {
      // It fires when checkboxes are selected
      this.$emit('selected_checkbox', newval)
    },
    /**
     * Executes on change of drag and drop
     * Gets ids for dragged items
     * @param {object} event - event on drag and drop
     * @param {array} change_data - grouped data
     */
    // eslint-disable-next-line camelcase
    on_change (event, change_data) {
      let index = event.moved.newIndex

      if (index !== 0 && index + 1 !== Object.keys(change_data).length) {
        this.dragged_ids.from_id = change_data[index - 1].id
        this.dragged_ids.to_id = change_data[index + 1].id
      } else if (index === 0) {
        this.dragged_ids.to_id = 0
        this.dragged_ids.from_id = change_data[index + 1].id
      } else if (index + 1 === Object.keys(change_data).length) {
        this.dragged_ids.to_id = change_data[index - 1].id
        this.dragged_ids.from_id = 0
      }
      this.dragged_ids.target_id = event.moved.element.id
      this.$emit('on-drag', event, this.dragged_ids)
    },
    /**
     * Executes on click of checkbox to select all from table header
     * when checkbox is selected saves data in a selected array
     * @public
     */
    bulk_actions (target) {
      this.selected = []
      if (!this.select_all || target) {
        // Since data is object here, so need to get key
        for (let key in this.actual_data) {
          if (this.actual_data.hasOwnProperty(key)) {
            this.actual_data[key].forEach(object => {
              this.selected.push(object)
            })
          }
        }
      }
      // It fires array of checked rows
      this.$emit('bulkaction', this.selected)
    },
    /**
     * Executes on click of checkbox to select all grouped data from group header checkbox
     * when checkbox is selected saves data in a selected array
     * @public
     */
    grouped_bulk_actions (item) {
      // If checkbox checked push the objects in selected array else removes the objects
      if (this.group_form[item[0][this.group_key]]) {
        // To avoid duplicates in selected array when click on each row and bulk check
        for (var i = 0, len = item.length; i < len; i++) {
          for (var j = 0, len2 = this.selected.length; j < len2; j++) {
            debugger
            if (item[i][this.group_key] === this.selected[j][this.group_key]) {
              this.selected.splice(j, 1)
              break
            }
          }
        }
        // Push the grouped data in selected
        item.forEach(object => {
          this.selected.push(object)
        })
      } else {
        // Removes groouped data from selected array on checkbox uncheck
        // eslint-disable-next-line no-redeclare
        for (var i = 0, len = item.length; i < len; i++) {
          // eslint-disable-next-line no-redeclare
          for (var j = 0, len2 = this.selected.length; j < len2; j++) {
            if (item[i][this.group_key] === this.selected[j][this.group_key]) {
              this.selected.splice(j, 1)
              break
            }
          }
        }
      }
      // Emits on check of grouped bulk actions
      this.$emit('grouped_bulkaction', this.selected)
    },
    /**
     * Not used
     * Get the data of checkbox selected from table row
     * @public
     * @returns {array} id's array of checked rows
     */
    get_selected () {
      let selected = []
      if (this.selected && this.selected.length) {
        this.selected.forEach(object => {
          selected.push(object.id)
        })
      }
      return selected
      // return [...this.selected];
    },

    /**
     * Not used
     * Sets checked rows to the selected array
     * @public
     * @param {array} data - array of row ids
     */
    // eslint-disable-next-line camelcase
    set_selected (actual_data) {
      // eslint-disable-next-line camelcase
      this.selected = [...actual_data]
    },
    /** f
     * It fires when click on each row checkbox
     * @param  {number} id - id of selected row's data
     */
    checkbox_click (id) {
      // if (this.selected.length === this.actual_data.length)
      //   this.select_all = true;
      // else this.select_all = false;

      // It fires when click on row checkbox
      this.$emit('checkbox_clicked', this.selected)
    },
    /**
     * Executes onclick of dropdown option
     * @public
     * @param {string} type - type of click e.g. 'edit'
     * @param {object} item - row info related to clicked dropdown
     */
    on_dropdown_item_click (option, item, index) {
      // Executes multi handlers functionality
      if (option.options && option.options.length) {
        // eslint-disable-next-line camelcase
        var handlers_array = []
        option.options.forEach(element => {
          // eslint-disable-next-line camelcase
          let handler_object = {}
          handler_object['name'] = element.handler_name
          if (element.handler_params) {
            let custom = {}
            try {
              if (typeof element.handler_params === 'object') {
                custom = element.handler_params
              } else {
                custom = JSON.parse(element.handler_params)
              }
            } catch (error) {
              custom = {}
            }

            handler_object['params'] = {
              helper: {
                component: this,
                custom: custom || {},
                item: item,
                index: index
              }
            }
          }
          // forming array of objects
          handlers_array.push(handler_object)
        })
        this.start(handlers_array)
        // eslint-disable-next-line brace-style
      }
      // Execute appup handler workflow
      else if (option.handler && this.start) {
        let custom = {}
        if (option.handler_params) {
          try {
            custom = JSON.parse(option.handler_params)
          } catch (error) {
            if (typeof option.handler_params === 'object') {
              custom = option.handler_params
            }
          }
        }
        this.start(option.handler, {
          helper: {
            component: this,
            item: item,
            custom: custom,
            index: index
          }
        })
      }
      // It fires when Dropdown Click
      this.$emit('dropdown_click', {
        type: option.type,
        option,
        item,
        index
      })
    }
  }
}
</script>

<style>
.stretched-table {
  display: contents;
}
</style>
