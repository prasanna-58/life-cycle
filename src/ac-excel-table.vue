<template>
  <div class="ml-5">
    <b-tabs>
      <b-tab class="mt-3" title="Groups" active>
        <ac-excel-table
          ref="acCollectiontable"
          :columns.sync="table_data.columns"
          :dropdown="table_data.dropdown"
          :dropdown_options="dropdown.options"
          :dropdown_button_options="dropdown.button_options"
          :show_dropdown_icons="true"
          :bulk="table_data.bulk"
          :url="collection.url"
          :method="collection.method"
          :params="collection.params"
          :loading_image="collection.loading_image"
          :sort_key="collection.sort_key"
          :ac_cursor="collection.ac_cursor"
          :show_loadmore="true"
          :stg_data_count="20"
          :limit="5"
          :group_name="table_data.group_name"
          :total_count="20"
          :row_actions="table_data.row_actions"
          :column_actions="table_data.column_actions"
          :group_actions="table_data.group_actions"
          :action_btn="table_data.action_btn"
          :group_data.sync="table_data.group_data"
          @dropdown_click="event_test"
          :loaded_groups="3"
          group_key="postId"
          pagination_type="loadMore"
          load_more_type="loadMoreButton"
          limit_key="_limit"
          offset_key="_start"
        >
          <template v-slot:group_header="{ groupItem }">
            <h6>Group {{ groupItem.email }}</h6>
          </template>
          <template v-slot:header>Main Header</template>
          <template v-slot:footer>Main footer</template>
          <template #empty_state>
            <p>
              <center>No Data</center>
            </p>
          </template>
        </ac-excel-table>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import AcExcelTable from './components/ac-excel-table.vue'
export default {
  components: { AcExcelTable },
  data () {
    return {
      collection: {
        url: 'https://jsonplaceholder.typicode.com/comments',
        loading_image:
          'https://infinity.500apps.com/img/siterecording/loading.png',
        ac_cursor: {},
        method: 'GET',
        params: {
          headers: {
            'Custom-Header': 'My custom header'
          }
        },
        sort_key: 'name'
      },
      table_data: {
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
        ]
      },
      dropdown: {
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
        button_options: {
          icon: 'fas fa-ellipsis-v',
          variant: 'outline-secondary',
          size: 'sm',
          right: true
        }
      }
    }
  },
  methods: {
    event_test (data) {
      console.log(data)
    }
  }
}
</script>
