<!-- eslint-disable camelcase -->
<template>
  <div class="ac-excel-table">
    <!-- <ac-collection-table-custom-headers></ac-collection-table-custom-headers> -->
    <header class="ac-table__header my-3">
      <!-- Use this slot for table header -->
      <slot name="header"></slot>
    </header>
    <div v-if="Object.keys(data).length">
      <div class="table-responsive">
        <table
          class="table border ac-excel-table"
          :class="{ col_dragging: cols_dragging }"
        >
          <thead :class="header_class">
            <ac-draggable
              tag="tr"
              handle=".ac-draggable_handle"
              v-bind="cols_drag_options"
              @start="cols_dragging = true"
              @end="cols_dragging = false"
              @input="cols_drag_input"
            >
              <!-- Check for bluk prop -->
              <th
                scope="col"
                :class="[checkbox_class]"
                :key="table_columns.length + 1"
                v-if="bulk"
              >
                <b-form-checkbox
                  v-model="select_all"
                  @change="bulk_actions($event)"
                />
              </th>
              <template v-for="(table_column, index) in table_columns">
                <th
                  scope="col"
                  :ref="`ac-excel-table_col_${table_column.key}`"
                  :class="get_table_header_class(table_column, index)"
                  :style="get_table_col_style(table_column)"
                  :key="`column_${index}`"
                  @mouseleave="
                    hide_dropdown(`header_dropdown_${table_column.key}`)
                  "
                >
                  <i
                    v-if="!table_column.drag_disable"
                    class="fas fa-grip-vertical ac-draggable_handle"
                  ></i>

                  <!-- Inline edit header -->
                  <input
                    v-if="is_edit_element(`column_${index}`)"
                    type="text"
                    :value="table_column.label"
                    :autofocus="true"
                    :ref="`inline-edit-input`"
                    class="text-center w-100 p-0 m-0"
                    @blur="unset_element_edit(`column_${index}`)"
                    @input="
                      update_column_label($event.target.value, table_column)
                    "
                    @keyup.enter="unset_element_edit(`column_${index}`)"
                  />
                  <span v-else @click="set_element_edit(`column_${index}`)">{{
                    table_column.label
                  }}</span>

                  <!-- Column actions dropdown -->
                  <ac-nested-dropdown
                    v-if="!table_column.actions_disable"
                    class="ac-excel-table_action_dropdown rounded-pill"
                    key_value="id"
                    item_class="dropdown-item ac-excel-table_action_dropdown-item"
                    :ref="`header_dropdown_${table_column.key}`"
                    :emit_event="true"
                    :nested_dropdown_list="column_actions"
                    @nested_menu_emit="
                      on_action_click($event, table_column, table_columns)
                    "
                  >
                    <template #btn_slot>
                      <i class="fas fa-sort-down"></i>
                    </template>
                  </ac-nested-dropdown>

                  <div
                    :class="[
                      'ac-excel-table_action_dropdown ac-excel-table_sort rounded-pill',
                      {
                        sort_up: table_column.sort === 'down',
                        sort_down: table_column.sort === 'up'
                      }
                    ]"
                  >
                    <b-button
                      @click="sort_column(table_column, index)"
                      :variant="table_column.sort ? 'primary' : 'default'"
                      class="p-0"
                    >
                      <i class="fas fa-sort"></i>
                    </b-button>
                  </div>

                  <!-- Column resize handler -->
                  <div
                    v-if="!table_column.resize_disable"
                    class="ac-table_col-resize"
                    @mousedown="start_resize_col(table_column, $event)"
                  ></div>
                </th>
              </template>
            </ac-draggable>
          </thead>

          <tbody
            v-for="(row, table_key) in actual_data"
            :key="`tbody_${table_key}`"
            :class="{ row_dragging: rows_dragging }"
          >
            <tr>
              <td
                :colspan="col_span - 1"
                class="align-middle ac-excel-table_group_label"
              >
                <ac-grouped-dropdown
                  class="ac-excel-table_action_dropdown rounded-pill"
                  :data="group_actions"
                  :show_group_name="false"
                  :button_options="action_btn"
                  :ref="`group_dropdown_${table_key}`"
                  @mouseleave.native="
                    hide_dropdown(`group_dropdown_${table_key}`)
                  "
                  @dd_item_clicked="on_action_group($event, table_key)"
                >
                  <template #drop_down_item="{item}">
                    <i :class="[item.icon, 'mr-1']" aria-hidden="true"></i>
                    {{ item.label }}
                  </template>
                </ac-grouped-dropdown>

                <ac-color-picker
                  :value="get_group_color(table_key)"
                  :ref="`color_picker_${table_key}`"
                  @hide="update_group_preview_color(null)"
                  @hover="update_group_preview_color($event, table_key)"
                  @update:value="update_group_color($event, table_key)"
                />

                <!-- Group label -->
                <input
                  v-if="is_edit_element(`table_label_${table_key}`)"
                  type="text"
                  :value="get_group_label(table_key)"
                  :autofocus="true"
                  :ref="`table_label_${table_key}`"
                  :style="{ color: get_group_color(table_key) }"
                  class="w-100 p-0 m-0"
                  @blur="unset_element_edit(`table_label_${table_key}`)"
                  @keyup.enter="unset_element_edit(`table_label_${table_key}`)"
                  @input="update_group_label($event.target.value, table_key)"
                />
                <h5
                  v-else
                  class="w-100 p-0 m-0"
                  @click="set_element_edit(`table_label_${table_key}`)"
                  :style="{
                    color:
                      group_preview === table_key
                        ? group_preview_color
                        : get_group_color(table_key)
                  }"
                >
                  <!-- {{get_group_label(table_key)}} -->
                  <!-- Use this slot for group name -->
                  <slot
                    name="group_header"
                    :groupItem="actual_data[table_key][0]"
                    >{{ get_group_label(table_key) }}</slot
                  >
                </h5>
              </td>
            </tr>

            <ac-draggable
              v-model="actual_data[table_key]"
              v-bind="rows_drag_options"
              class="stretched-table"
              @start="cancel_cells_edit(table_key)"
              @end="rows_dragging = false"
              @change="$emit('on-drag', $event)"
            >
              <tr
                v-for="(innerObject, row_key) in row"
                :key="row_key"
                class="ac-excel-table_row"
              >
                <!-- Bulk checkbox -->
                <td scope="col" class="align-middle" v-if="bulk">
                  <div
                    :class="[
                      {
                        selected: selected.some(
                          item => item.id === innerObject.id
                        )
                      },
                      'ac-excel-table_row_color'
                    ]"
                    :style="{
                      backgroundColor:
                        group_preview === table_key
                          ? group_preview_color
                          : get_group_color(table_key)
                    }"
                  >
                    <b-form-checkbox
                      class="ml-2"
                      v-model="selected"
                      :value="innerObject"
                      @change="$emit('checkbox_clicked', innerObject)"
                    />
                  </div>
                  <!-- Row actions dropdown -->
                  <ac-grouped-dropdown
                    class="ac-excel-table_action_dropdown rounded-pill"
                    :data="row_actions"
                    :show_group_name="false"
                    :button_options="action_btn"
                    :ref="`row_dropdown_${table_key}_${row_key}`"
                    @dd_item_clicked="on_action_click($event, innerObject, row)"
                    @mouseleave.native="
                      hide_dropdown(`row_dropdown_${table_key}_${row_key}`)
                    "
                  >
                    <template #drop_down_item="{item}">
                      <i :class="[item.icon, 'mr-1']" aria-hidden="true"></i>
                      {{ item.label }}
                    </template>
                  </ac-grouped-dropdown>
                </td>

                <!-- Table columns -->
                <template v-for="(column, index) in columns">
                  <td
                    v-if="column.key !== 'options'"
                    scope="col"
                    :class="get_table_col_class(column)"
                    @row-clicked="$emit('row_clicked', $event)"
                    @row-dblclicked="$emit('row_dblclicked', $event)"
                    :key="index"
                  >
                    <div v-if="column.__slot__">
                      <slot :name="column.key" :item="innerObject"></slot>
                    </div>
                    <component
                      v-else
                      :is="`ac-cell-${column.type || 'text'}`"
                      :value="innerObject"
                      :column="column"
                      :ref="`cells_${row_key}`"
                      @update:value="
                        update_cell_value(
                          $event,
                          table_key,
                          row_key,
                          column.type
                        )
                      "
                    ></component>
                  </td>
                  <td
                    v-else
                    scope="col"
                    :key="`option_${index}`"
                    class="align-middle text-center"
                  >
                    <ac-material-dropdown
                      :options="dropdown_options_handler"
                      :button_options="button_options"
                      :right="button_options.right"
                       :show_dropdown_icons="true"
                      @item_click="on_dropdown_item_click($event, innerObject)"
                    />
                  </td>
                </template>

                <!-- <slot name="body" :data="value1"></slot> -->
              </tr>
            </ac-draggable>

            <!-- Add row input -->
            <tr class="ac-excel-table_add_row">
              <td :colspan="col_span - 1" class="p-0">
                <b-input-group class="mt-0">
                  <b-form-input
                    class="rounded-0 border-0"
                    v-model="add_row_inputs[table_key]"
                    type="text"
                    placeholder="+ add row"
                    @focus="set_active_input(table_key)"
                    @blur="set_active_input(table_key, false)"
                    @keyup.enter="add_row(table_key)"
                  ></b-form-input>
                  <b-input-group-append
                    v-show="active_add_row_input === table_key"
                  >
                    <b-button variant="info" @mousedown="add_row(table_key)"
                      >append</b-button
                    >
                  </b-input-group-append>
                </b-input-group>
              </td>
            </tr>

            <!-- Column summary -->
            <tr class="ac-excel-table_summary">
              <td
                class="bg-light p-0"
                v-for="(column, index) in [{}, ...columns]"
                :key="`${column.key}_${index}_summary`"
              >
                <ac-summary
                  :column="column"
                  :table_data="row"
                  @update:column="replace_column(column, $event)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!Object.keys(actual_data).length">
      <!-- Use this slot for Empty State -->
      <slot name="empty_state"></slot>
    </div>

    <!-- loader image -->
    <div v-show="is_loading" class="loader row">
      <img :src="loading_image" class="loader__image m-auto" alt="loader" />
    </div>

    <div
      v-show="load_more_type === 'loadMoreButton'"
      v-if="show_loadmore"
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
  </div>
</template>

<script>
import AcCollectionGroupedTable from './ac-collection-grouped-table'
import AcSummary from './summary'
import AcColorPicker from './ac-color-picker'
import * as CELLS from './cells'
import AcNestedDropdown from './ac-nested-dropdown'
import AcGroupedDropdown from './ac-grouped-dropdown'
import AcDraggable from 'vuedraggable'
const cloneDeep = require('lodash.clonedeep')

//  * @requires VueBootstrap
//  * @requires ac-summary.vue
/**
 * Ac Excel Table component similar to monday.com
 * @requires ac-collection-grouped-table.vue

 * Fires event on row click and row double click

 * @event row_clicked
 * @event row_dblclicked
 * @type {object} row data
 *
 * @event update:columns
 * @type {array} columns data
 *
 * @event update:group_data
 * @type {array} group data
 *
 * @inherits ac-collection-grouped-table
 *
 */

export default {
  name: 'ac-excel-table',

  extends: AcCollectionGroupedTable,

  components: {
    ...CELLS,
    AcSummary,
    AcColorPicker,
    AcNestedDropdown,
    AcGroupedDropdown,
    AcDraggable
  },

  props: {
    /**
     * Name of draggable group
     * @param {string} group_name
     * @label Group Name
     */
    // group_name: {
    //   type: String,
    //   required: true
    // },

    /**
     * Min column resizing width
     * @param {string} min_col_width
     */
    min_col_width: {
      type: Number,
      default: 155
    },

    /**
     * Max column resizing width
     * @param {string} group_name
     * @label Group Name
     */
    // max_col_width: {
    //     type: Number,
    //     default: 500
    // },

    // /**
    //  * Array of possible actions for rows
    //  * @param {Array} - Array<{ name: String, id: Number, items: Array<{id: Number, label: String, type: "add:before|add:after|clone|delete"}>, icon: String }>
    //  */
    // row_actions: {
    //   type: Array,
    //   default: () => []
    // },

    // /**
    //  * Prop 'nested_dropdown_list' for ac-nested-dropdown
    //  */
    // column_actions: {
    //   type: Array,
    //   default: () => []
    // },

    // /**
    //  * Prop 'data' for ac-grouped-dropdown
    //  */
    // group_actions: {
    //   type: Array,
    //   default: () => []
    // },

    // /**
    //  * Prop 'button_options' for ac-grouped-dropdown
    //  */
    // action_btn: {
    //   type: Object
    // },

    /**
     * Description for each table in group
     * @param {Object} - { [key: String(table key)]: { color: String, label: String } }
     */
    // group_data: {
    //   type: Object,
    //   required: false,
    //   default: () => ({})
    // },
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
  computed: {
    /**
     * Filter draggable columns
     * @private
     */
    draggable_columns () {
      const cols = []
      // add empty element to array for correct work sortable.js
      // delete this code with html for bulk checkbox
      cols.push({
        hidden_element: true,
        drag_disable: true
      })
      cols.push(...this.table_columns)
      return cols
    },

    /**
     * Draggable options for rows
     * @private
     */
    rows_drag_options () {
      return {
        animation: 200,
        group: this.group_name,
        ghostClass: 'ac-draggable_ghost'
      }
    },

    /**
     * Draggable options for columns
     * @private
     */
    cols_drag_options () {
      return {
        animation: 200,
        value: this.draggable_columns,
        move: this.check_drag_cols_move,
        ghostClass: 'ac-draggable_ghost'
      }
    }
  },

  updated () {
    this.set_inline_input_focus()
  },

  data () {
    return {
      // Info about current resizing column
      current_resize: {},

      // Input for new row, each table in group contain input
      add_row_inputs: {},

      // Columns drag state
      cols_dragging: false,

      // Rows drag state
      rows_dragging: false,

      // Key of active add row input
      // Updated on focus input
      active_add_row_input: null,

      // Keys of current inline edit blocks
      elements_editing: [],

      // Hovered color in color picker for group color
      group_preview_color: null,

      // Current table key when opened color picker
      group_preview: null,

      url: 'https://jsonplaceholder.typicode.com/comments',
      loading_image:
        'https://infinity.500apps.com/img/siterecording/loading.png',
      // ac_cursor: {},
      // method: 'GET',
      // params: {
      //   headers: {
      //     'Custom-Header': 'My custom header'
      //   }
      // },
      // sort_key: 'name',
      bulk: true,
      dropdown: true,
      group_name: 'ac-excel-table-group',
      group_data: {
        1: {
          color: 'rgb(3, 127, 76)',
          label: 'In progress'
        }
      },
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
      action_btn: {
        icon: 'fas fa-caret-down',
        pill: true,
        size: 'sm',
        'no-caret': true
      },
      group_actions: [
        {
          name: 'custom',
          id: 1,
          items: [
            {
              id: 2,
              label: 'Change group color',
              icon: 'fas fa-tint',
              type: 'color'
            }
          ]
        }
      ],

      column_actions: [
        {
          id: 10,
          keyvalue: 'id',
          isSubMenu: false,
          text: 'Clone column',
          type: 'clone',
          strategy: 'update:columns',
          icon: 'fas fa-clone'
        },
        {
          id: 13,
          keyvalue: 'id',
          isSubMenu: true,
          text: 'Change type of column',
          type: 'column_type',
          icon: 'fas fa-exchange-alt',
          sublist_header: 'Change column {{column.key}} to:',
          subMenuList: [
            {
              id: 10,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Text',
              icon: 'fas fa-paragraph',
              type: 'column_type:text'
            },
            {
              id: 1,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Numbers',
              icon: 'fas fa-sort-numeric-up',
              type: 'column_type:number'
            },
            {
              id: 2,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Date',
              icon: 'fas fa-calendar-alt',
              type: 'column_type:date'
            },
            {
              id: 3,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Status',
              icon: 'fas fa-bars',
              type: 'column_type:status'
            },
            {
              id: 4,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Phone',
              icon: 'fas fa-mobile-alt',
              type: 'column_type:phone'
            },

            {
              id: 7,
              keyvalue: 'id',
              isSubMenu: false,
              text: 'Dropdown',
              icon: 'fas fa-tags',
              type: 'column_type:tags'
            }
          ]
        },
        {
          id: 9,
          keyvalue: 'id',
          isSubMenu: false,
          text: 'Add column to the right',
          type: 'add:before',
          strategy: 'update:columns',
          icon: 'fas fa-plus-circle'
        },
        {
          id: 12,
          keyvalue: 'id',
          isSubMenu: false,
          text: 'Delete column',
          type: 'delete',
          strategy: 'update:columns',
          icon: 'fas fa-trash'
        }
      ],
      row_actions: [
        {
          name: 'add',
          id: 1,
          items: [
            {
              id: 2,
              label: 'Add row below',
              type: 'add:before',
              icon: 'fas fa-plus-circle'
            },
            {
              id: 3,
              label: 'Add row above',
              type: 'add:after',
              icon: 'fas fa-plus-circle'
            }
          ]
        },
        {
          name: 'clone',
          id: 4,
          items: [
            {
              id: 5,
              label: 'Clone row',
              type: 'clone',
              icon: 'fas fa-clone'
            }
          ]
        },
        {
          name: 'delete',
          id: 6,
          items: [
            {
              id: 7,
              label: 'Delete row',
              type: 'delete',
              icon: 'fas fa-trash'
            }
          ]
        }
      ],
      button_options: {
        icon: 'fas fa-ellipsis-v',
        variant: 'outline-secondary',
        size: 'sm',
        right: true
      },
      show_loadmore: true,
      load_more_type: 'loadMoreButton'
    }
  },

  created () {
    /**
     * Add event listeners for resizing
     */
    window.addEventListener('mousemove', this.move_resize_col)
    window.addEventListener('mouseup', this.end_resize_col)
    window.addEventListener('keyup', this.on_key_up)
  },

  destroyed () {
    /**
     * Remove event listeners for resizing
     */
    window.removeEventListener('mousemove', this.move_resize_col)
    window.removeEventListener('mouseup', this.end_resize_col)
    window.removeEventListener('keyup', this.on_key_up)
  },

  watch: {
    actual_data () {
      this.validate_actual_data()
    }
  },

  methods: {
    /**
     * Set 'task' field if doesn't contain in table data
     */
    validate_actual_data () {
      Object.keys(this.actual_data).forEach(tableKey => {
        this.actual_data[tableKey].forEach((item, index) => {
          item.task = item.task || `Task ${index + 1}`
        })
      })
    },

    /**
     * Check draggable columns
     * @public
     * @param {SortableEvent}
     * @returns {boolean}
     */
    // eslint-disable-next-line camelcase
    check_drag_cols_move (drag_event) {
      const is =
        drag_event.draggedContext.element &&
        drag_event.relatedContext.element &&
        !drag_event.relatedContext.element.drag_disable

      return Boolean(is)
    },

    /**
     * Update table columns
     * @public
     */
    cols_drag_input (list) {
      const columns = list.filter(item => item && !item.hidden_element)
      this.$emit('update:columns', columns)
    },

    /**
     * Cancel edit forms in cell
     * @public
     */
    // eslint-disable-next-line camelcase
    cancel_cells_edit (table_key) {
      this.rows_dragging = true
      // eslint-disable-next-line camelcase
      const cells = this.$refs[`cells_${table_key}`]

      cells &&
        cells.forEach(cell => {
          cell.set_edit(false)
        })
    },

    /**
     * Get array of classes for header
     * @public
     * @returns {array}
     */
    get_table_header_class (column, index) {
      return [
        {
          'current-resize': column === this.current_resize.element,
          [this.rclass + column.class]: column.class,
          'current-edit': this.is_edit_element(`column_${index}`),
          'ac-excel-table_col-dropdown-right':
            index >= this.table_columns.length - 2
        },
        'ac-excel-table_col',
        `text-${column.key === 'task' ? 'left' : 'center'}`
      ]
    },

    /**
     * Get array of classes for column
     * @public
     * @returns {array}
     */
    get_table_col_class (column, index) {
      return [
        'align-middle',
        `text-${column.key === 'task' ? 'left' : 'center'}`
      ]
    },

    /**
     * Get styles for column
     * @public
     * @returns {object}
     */
    get_table_col_style (column) {
      const width =
        this.current_resize.element === column
          ? this.current_resize.changed_width
          : column.width

      return {
        width: `${width || this.min_col_width}px !important`
      }
    },

    /**
     * Get specified table label
     * @param {String} table_key
     * @returns {String}
     */
    // eslint-disable-next-line camelcase
    get_group_label (table_key) {
      return this.group_data[table_key]
        ? this.group_data[table_key].label
        // eslint-disable-next-line operator-linebreak
        : // eslint-disable-next-line operator-linebreak
      // eslint-disable-next-line camelcase
        `Group ${table_key}`
    },

    /**
     * Get specified table color
     * @param {String} table_key
     * @returns {String}
     */
    // eslint-disable-next-line camelcase
    get_group_color (table_key) {
      return this.group_data[table_key]
        ? this.group_data[table_key].color
        : 'grey'
    },

    /**
     * Start resizing, set init state
     * @public
     * @param {object} column
     * @param {MouseEvent} event - mousedown event
     */
    start_resize_col (column, event) {
      // eslint-disable-next-line camelcase
      const current_column_el = this.$refs[`ac-excel-table_col_${column.key}`]
      // eslint-disable-next-line camelcase
      let init_width = Math.floor(
        current_column_el[0].getBoundingClientRect().width
      )
      // eslint-disable-next-line camelcase
      init_width = init_width !== column.width ? init_width : column.width

      this.current_resize = {
        element: column,
        init_x: event.x,
        changed_width: init_width,
        init_width
      }
    },

    /**
     * Calculate moved distance and save
     * @public
     * @param {MouseEvent} event - mousemove event
     */
    move_resize_col (event) {
      if (!this.current_resize.element) return
      event.preventDefault()
      const width = parseInt(this.current_resize.init_width)

      // eslint-disable-next-line camelcase
      const mouse_x_diff = Math.abs(this.current_resize.init_x - event.x)
      this.current_resize.changed_width =
        width +
        // eslint-disable-next-line camelcase
        (this.current_resize.init_x >= event.x ? -mouse_x_diff : mouse_x_diff)
      this.current_resize.changed_width = this.validate_col_width(
        this.current_resize.changed_width
      )
    },

    /**
     * End of resizing and update column
     * @public
     * @param {MouseEvent} event - mouseup event
     */
    end_resize_col (event) {
      if (!this.current_resize.element) return

      // eslint-disable-next-line camelcase
      const new_column = {
        ...this.current_resize.element,
        width:
          this.current_resize.changed_width || this.current_resize.element.width
      }

      this.replace_column(this.current_resize.element, new_column)
      this.current_resize = {}
    },

    /**
     * Replace column or add new column
     * @public
     * @param {object} column - replaced column
     * @param {object} new_column - new column
     */
    // eslint-disable-next-line camelcase
    replace_column (column, new_column) {
      const list = [...this.table_columns]
      const fIndex = this.table_columns.findIndex(col => col === column)
      if (fIndex < 0) {
        list.push(new_column)
      } else {
        // eslint-disable-next-line camelcase
        list[fIndex] = new_column
      }

      this.$emit('update:columns', list)
    },

    /**
     * Check width with min and max width
     * @public
     * @param {number} width - column width
     * @returns {number} valid width
     */
    validate_col_width (width) {
      // eslint-disable-next-line camelcase
      const valid_width =
        width < this.min_col_width ? this.min_col_width : width
      // valid_width = valid_width > this.max_col_width ? this.max_col_width : valid_width
      // eslint-disable-next-line camelcase
      return valid_width
    },

    /**
     * Add headers
     * @public
     * @param {string} label
     * @param {string} key
     */
    add_headers (label, key) {
      this.replace_column(null, {
        label,
        key
      })
    },

    /**
     * @public
     * @param {string} table_index
     */
    // eslint-disable-next-line camelcase
    add_row (table_index) {
      const data = this.actual_data[table_index]
      // eslint-disable-next-line camelcase
      const last_item = data[data.length - 1]
      // eslint-disable-next-line camelcase
      const new_row = {}
      this.table_columns.forEach(column => {
        new_row[column.key] = null
      })

      new_row[this.table_columns[0].key] =
        this.add_row_inputs[table_index] || `Task ${data.length + 1}`
      new_row.id = last_item.id + 1
      data.push(new_row)
      this.add_row_inputs[table_index] = null
      this.$emit('added_row', {
        item: new_row,
        group_data: this.actual_data[table_index]
      })
    },
    /**
     * Triggered on click column, row actions
     * @param {Object} ev
     * @param {Object} item
     * @param {Array<any>} data
     */
    on_action_click (ev, item = {}, data = []) {
      const action = ev.group_item || ev
      const actionType = action.type.split(':')[0]
      const args = [
        item,
        action.strategy ? [...data] : data,
        action.type.split(':')[1]
      ]

      let result = null

      switch (actionType) {
        case 'add': {
          result = this.add_item(...args)
          break
        }
        case 'clone': {
          result = this.clone_item(...args)
          break
        }
        case 'delete': {
          result = this.delete_item(...args)
          break
        }
        case 'column_type': {
          result = this.change_column_type(...args)
          break
        }
        default: {
          return
        }
      }

      if (action.strategy) {
        this.$emit(action.strategy, result)
      } else {
        data = result
      }
    },

    /**
     * Triggered on click group action
     * @param {Object} event
     * @param {String} table_key
     */
    // eslint-disable-next-line camelcase
    on_action_group (event, table_key) {
      const action = event.group_item || event

      if (action.type === 'label') {
        // eslint-disable-next-line camelcase
        this.set_element_edit(`table_label_${table_key}`)
      } else if (action.type === 'color') {
        // eslint-disable-next-line camelcase
        this.$refs[`color_picker_${table_key}`] &&
          // eslint-disable-next-line camelcase
          this.$refs[`color_picker_${table_key}`].length > 0 &&
          // eslint-disable-next-line camelcase
          this.$refs[`color_picker_${table_key}`][0].show()
      }
    },

    /**
     * Triggered on keyup
     * @param {KeyboardEvent} e
     */
    on_key_up (e) {
      console.log(e)
      switch (e.type) {
        case 'keyup': {
          if (e.shiftKey && e.code === 'Equal') {
            const keys = Object.keys(this.actual_data)
            keys.forEach(key => {
              this.add_row(key)
            })
          }

          break
        }

        default:
          break
      }
    },

    /**
     * Change column type
     * @param {Object} column
     * @param {Array<Object>} columns
     * @param {"date"|"text"|"number"|"phone"|"email"} type
     */
    change_column_type (column, columns, type) {
      // eslint-disable-next-line camelcase
      const new_column = { ...column, type }
      this.replace_column(column, new_column)
    },

    /**
     * Clone item from data and append to data after selected item
     * @param {Object} item
     * @param {Array} data
     * @returns {Array} - changed data
     */
    clone_item (item, data) {
      const findItemFn = _item => item === _item
      const itemCopy = { ...(data.find(findItemFn) || {}) }
      const clonedIndex = data.findIndex(findItemFn)

      // set new key for column and copy table_data
      if (itemCopy.key) {
        // eslint-disable-next-line camelcase
        const new_key = `${itemCopy.key}_copy`
        // eslint-disable-next-line camelcase
        for (const table_key in this.actual_data) {
          if (this.actual_data.hasOwnProperty(table_key)) {
            this.actual_data[table_key].forEach(row => {
              row[new_key] =
                typeof row[itemCopy.key] === 'object' &&
                row[itemCopy.key] !== null
                  ? cloneDeep(row[itemCopy.key])
                  : row[itemCopy.key]
            })
          }
        }

        // eslint-disable-next-line camelcase
        itemCopy.key = new_key
      }

      if (clonedIndex >= 0) {
        itemCopy.sort && delete itemCopy.sort
        itemCopy.label && (itemCopy.label = `Dup. of ${itemCopy.label}`)
        itemCopy.task && (itemCopy.task = `Dup. of ${itemCopy.task}`)
        data.splice(clonedIndex + 1, 0, itemCopy)
      }

      return data
    },

    /**
     * Delete item from array
     * @param {any} item
     * @param {Array} data
     * @returns {Array} - changed data
     */
    delete_item (item, data) {
      const findItemFn = _item => item === _item
      const clonedIndex = data.findIndex(findItemFn)

      if (clonedIndex >= 0) {
        data.splice(clonedIndex, 1)
      }

      return data
    },

    /**
     * Append item to start or end to array
     * @param {any} item
     * @param {Array} data
     * @param {"after"|"before"} option
     * @returns {Array} - data
     */
    add_item (item, data, option) {
      const findItemFn = _item => item === _item
      const newItem = { ...item }
      Object.keys(item).forEach(key => (newItem[key] = null))
      const itemIndex = data.findIndex(findItemFn)

      if (option === 'after') {
        data.splice(itemIndex, 0, newItem)
      } else if (option === 'before') {
        data.splice(itemIndex + 1, 0, newItem)
      }

      return data
    },

    /**
     * Sorting table data by column
     * @param {Object} column
     * @param {Number} column_index
     */
    // eslint-disable-next-line camelcase
    sort_column (column, column_index) {
      // remove old sorting
      const columns = this.table_columns.map(col => {
        // eslint-disable-next-line camelcase
        const new_col = { ...(col || {}) }
        if (new_col.sort && col !== column) {
          delete new_col.sort
        }
        // eslint-disable-next-line camelcase
        return new_col
      })

      const sort = column.sort === 'up' ? 'down' : 'up'
      columns[column_index].sort = sort
      this.$emit('update:columns', columns)

      Object.keys(this.actual_data).forEach((key, index) => {
        const arr = [...this.actual_data[key]].sort((a, b) => {
          // eslint-disable-next-line camelcase
          const sort_up = sort === 'up' && a[column.key] >= b[column.key]
          // eslint-disable-next-line camelcase
          return sort_up ? 1 : -1
        })
        this.actual_data[key] = arr
      })
    },

    /**
     * Updating column label
     * @param {String} new_label
     * @param {Object} column
     */
    // eslint-disable-next-line camelcase
    update_column_label (new_label, column) {
      // eslint-disable-next-line camelcase
      const new_column = { ...column, label: new_label }
      this.replace_column(column, new_column)
    },

    /**
     * Updating cell value
     * @param {Object} row_obj
     * @param {String} table_key
     * @param {Number} row_index
     */
    // eslint-disable-next-line camelcase
    update_cell_value (row_obj, table_key, row_index, type) {
      // eslint-disable-next-line camelcase
      const table_data = this.actual_data[table_key]
      // eslint-disable-next-line camelcase
      const new_row = { ...table_data[row_index], ...row_obj }
      this.actual_data[table_key].splice(row_index, 1, new_row)
      if (type === undefined) {
        this.$emit('update_cell_value', {
          item: row_obj,
          group_data: this.actual_data[table_key],
          index: row_index
        })
      }
    },

    /**
     * Updating table label
     * @param {String} label
     * @param {String} table_key
     */
    // eslint-disable-next-line camelcase
    update_group_label (label, table_key) {
      // eslint-disable-next-line camelcase
      const group_data = {
        ...this.group_data,
        [table_key]: {
          ...this.group_data[table_key],
          color: this.get_group_color(table_key),
          label
        }
      }
      this.$emit('update:group_data', group_data)
    },

    /**
     * Updating preview color
     * @param {String} color
     * @param {String} table_key
     */
    // eslint-disable-next-line camelcase
    update_group_preview_color (color, table_key) {
      // eslint-disable-next-line camelcase
      this.group_preview = color ? table_key : null
      this.group_preview_color = color
    },

    /**
     * Updating table color
     * @param {String} color
     * @param {String} table_key
     */
    // eslint-disable-next-line camelcase
    update_group_color (color, table_key) {
      // eslint-disable-next-line camelcase
      const group_data = {
        ...this.group_data,
        [table_key]: {
          ...this.group_data[table_key],
          label: this.get_group_label(table_key),
          color
        }
      }

      this.$emit('update:group_data', group_data)
    },

    /**
     * Set inline input key to active
     * @param {String} key
     */
    set_element_edit (key) {
      this.elements_editing.push(key)

      this.$nextTick(() => {
        this.$refs[key] &&
          this.$refs[key].length > 0 &&
          this.$refs[key][0].focus()
      })
    },

    /**
     * Set focus on inline input
     */
    set_inline_input_focus () {
      const inputRef = this.$refs['inline-edit-input']

      if (inputRef && inputRef.length) {
        const el = inputRef.length ? inputRef[0] : inputRef
        el && el.focus()
      }
    },

    /**
     * Unset edit state from inline input
     * @param {String} key
     */
    unset_element_edit (key) {
      // eslint-disable-next-line camelcase
      const key_index = this.elements_editing.findIndex(_key => _key === key)
      // eslint-disable-next-line camelcase
      if (key_index >= 0) {
        this.elements_editing.splice(key_index, 1)
      }
    },

    /**
     * Check input key on edit state
     * @param {Object} key
     * @returns {boolean}
     */
    is_edit_element (key) {
      return this.elements_editing.includes(key)
    },

    /**
     * Get headers
     * @public
     * @returns {array} table columns
     */
    get_headers () {
      return this.table_columns
    },

    /**
     * Set active input (focus)
     * @public
     * @param {string} table_index
     * @param {boolean} is_active
     */
    // eslint-disable-next-line camelcase
    set_active_input (table_index, is_active = true) {
      // eslint-disable-next-line camelcase
      this.active_add_row_input = is_active && table_index
    },

    /**
     * Hide dropdown
     * @param {string} dropdown_key
     */
    // eslint-disable-next-line camelcase
    hide_dropdown (dropdown_key) {
      const dropdown = this.$refs[dropdown_key]

      if (dropdown && dropdown[0]) {
        dropdown[0].hide && dropdown[0].hide()
        dropdown[0].hide_dropdown && dropdown[0].hide_dropdown()
      }
    }
  }
}
</script>
<style>
.ac-excel-table {
  position: relative;
  width: auto;
}
.table-responsive {
  overflow: unset;
}

/* Action buttons */
.col_dragging .ac-excel-table_col:not(.ac-draggable_ghost) {
  background-color: inherit;
}
.row_dragging .ac-excel-table_action_dropdown {
  display: none !important;
}

/* Handler for resizing */
.ac-table_col-resize {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: transparent;
  cursor: ew-resize;
}

.ac-table_col-resize:hover,
.ac-excel-table_col.current-resize > .ac-table_col-resize {
  background-color: var(--primary);
}

/* Handler for sorting */
.ac-excel-table_sort.ac-excel-table_action_dropdown {
  position: relative;
  z-index: 1;
}
.ac-excel-table_sort.sort_down::before,
.ac-excel-table_sort.sort_up::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 50%;
  top: 0;
  left: 0;
  background: inherit;
  opacity: 0.9;
  pointer-events: none;
}
.ac-excel-table_sort.sort_up::before {
  bottom: 0;
  top: unset;
}

/* Dropdown */
.ac-excel-table_row .dropdown-menu {
  transform: unset !important;
  will-change: unset !important;
  top: 23px !important;
}

.ac-excel-table_action_dropdown {
  z-index: 99999;
}
.ac-excel-table_action_dropdown-item,
.ac-excel-table_action_dropdown-item.pl-2 {
  padding: 0 !important;
}
.ac-excel-table_action_dropdown-item p {
  margin: 0;
  height: 100%;
  width: 100%;
  padding: 0.25rem 1.5rem !important;
}
.ac-excel-table_action_dropdown > button,
.ac-excel-table_sort > button {
  width: 1.7vw;
  height: 1.7vw;
  overflow: hidden;
}
.ac-excel-table_action_dropdown button.btn,
.ac-excel-table_action_dropdown button.btn:active,
.ac-excel-table_sort button.btn:active,
.ac-excel-table_sort button.btn {
  background-color: inherit !important;
  border: none;
  display: flex;
  color: inherit !important;
  justify-content: center;
}
.ac-excel-table_action_dropdown:hover,
.ac-excel-table_sort.sort_up,
.ac-excel-table_sort.sort_down {
  background-color: #edeef0;
}

/* Table column */
.ac-excel-table_col {
  text-align: center;
  position: relative;
}
.ac-excel-table_col-dropdown-right
  > .ac-excel-table_action_dropdown
  > .dropdown-menu {
  transform: translateX(11%);
}
.ac-excel-table_col-dropdown-right .dropdown-menu,
.ac-excel-table_col-dropdown-right .dropdown-submenu > .dropdown-menu {
  right: 100%;
  left: unset !important;
}
.ac-excel-table_col span:hover {
  outline: 1px dashed;
  outline-offset: 2px;
}
.ac-excel-table_col > span:empty {
  display: block;
  height: 25px;
  width: 80px;
  margin-left: 25px;
}
.ac-excel-table_col .ac-excel-table_action_dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(-50%, -50%);
}
.ac-excel-table_col .ac-excel-table_sort {
  width: fit-content;
  top: 0;
  left: 50%;
  transform: translate(-50%, -65%);
}
.ac-excel-table_col:hover .ac-excel-table_action_dropdown,
.ac-excel-table_col .ac-excel-table_sort.sort_down,
.ac-excel-table_col .ac-excel-table_sort.sort_up {
  display: block;
}

/* Table label */
.ac-excel-table_group_label {
  position: relative;
  transition: all 0.1s ease-out;
}
.ac-excel-table_group_label input,
.ac-excel-table_group_label h5 {
  font-size: 1.25rem;
}
.ac-excel-table_group_label .ac-excel-table_action_dropdown {
  display: block;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(calc(-100% - 13px), -45%);
}
.ac-excel-table_group_label .ac-excel-table_action_dropdown .dropdown-menu {
  margin: 0;
}

/* Table row */
.ac-excel-table_row,
.ac-excel-table_row td {
  position: relative;
}
.ac-excel-table_row td:first-child {
  padding: 0;
}
.ac-excel-table_row td:first-child .dropdown-menu {
  margin: 0;
}
.ac-excel-table_row td:first-child:before {
  content: "";
  position: absolute;
  left: -80%;
  top: 0;
  height: 100%;
  width: 100%;
}
.ac-excel-table_row_color {
  position: absolute;
  width: 8px;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transition: all 0.1s ease-in;
}
.ac-excel-table_row_color > .custom-checkbox {
  display: none;
}
.ac-excel-table_row_color:before {
  position: absolute;
  content: "";
  left: 0;
  width: 0;
  height: 100%;
  background: inherit;
  transition: width 0.1s;
}
.ac-excel-table_row_color:hover:before,
.ac-excel-table_row_color.selected:before {
  width: 34px;
}
.ac-excel-table_row_color:hover > .custom-checkbox,
.ac-excel-table_row_color.selected > .custom-checkbox {
  display: block;
}

.ac-excel-table_row .ac-excel-table_action_dropdown {
  position: absolute;
  transform: translate(calc(-100% - 1vw), -45%);
  opacity: 0;
}
.ac-excel-table_row:hover .ac-excel-table_action_dropdown {
  opacity: 1;
}

.ac-excel-table_add_row input:focus {
  box-shadow: none;
}

.ac-excel-table_summary td:empty {
  visibility: hidden;
}

.ac-excel-table_col.current-edit .ac-draggable_handle,
.ac-excel-table_col.current-edit .ac-excel-table_action_dropdown,
.ac-excel-table_col.current-edit .ac-table_col-resize {
  display: none !important;
}
.ac-excel-table_col.current-edit input {
  border: 1px dashed;
  font-weight: inherit;
  height: 100%;
}
.ac-excel-table_col.current-edit input:focus {
  outline: none;
}
.ac-excel-table_col > .ac-draggable_handle {
  display: none;
}
.ac-excel-table_col:hover,
.ac-excel-table_col.current-resize {
  background-color: #dee2e6;
}
.ac-excel-table_col.current-resize ~ .ac-excel-table_col {
  background-color: inherit;
}
.ac-excel-table_col:hover > .ac-draggable_handle {
  display: inline-block;
}

.ac-draggable_handle {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: move;
}
.ac-draggable_ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
