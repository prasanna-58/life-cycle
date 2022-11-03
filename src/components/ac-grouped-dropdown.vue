<template>
  <b-dropdown
    id="dropdown-aria"
    :right="right"
    :text="selected_item"
    :variant="variant"
    ref="dropdown"
    v-bind="button_options"
    class="m-2"
  >
    <!-- Toggle button content -->
    <template slot="button-content" v-if="button_options">
      <!-- use this slot for button content -->
      <slot name="button-content" :data="button_options">
        <i v-if="button_options.icon" :class="button_options.icon"></i>
        <span v-if="button_options.label">{{ showlabel }}</span>
      </slot>
    </template>
    <template v-for="(item,index) in JSON_data">
      <b-dropdown-header
        v-if="show_group_name"
        :id="`dropdown-header-${index}`"
        @click="get_data(item)"
        :key="`${index}${item.id}`"
      >{{item[key_label]}}</b-dropdown-header>

      <!-- Sub group template -->

      <template v-if="item.items">
        <template v-for="(subitem,subindex) in item.items">
          <a
            :key="`${subindex}${subitem.id}`"
            :href="subitem.url"
            :id="`sub${index}${subindex}`"
            v-if="subitem.url"
            class="dropdown-item"
          >{{subitem.name}}</a>
          <b-dropdown-item-button
            :key="`${subindex}${subitem.id}`"
            v-else
            :aria-describedby="`dropdown-header${index}${subindex}`"
            @click="get_data(item,subitem)"
          >
            <!-- slot for dropdown item -->
            <slot name="drop_down_item" :item="subitem">{{subitem.name}}</slot>
          </b-dropdown-item-button>
        </template>
      </template>
      <!-- Droprdown divider skips for last group  -->
      <b-dropdown-divider v-if="index !=JSON_data.length-1 " :key="index"></b-dropdown-divider>
    </template>
  </b-dropdown>
</template>
<script>

/**
 * Event fires on click of dropdown item
 * @event dd-item-clicked
 */

export default {
  name: 'ac-grouped-dropdown',
  components: {},
  props: {
    /**
     * Json data for dropdown
     * @param  { array } data
     * If there is no url this data will be considered
     * sample data
     * [{"name":"support","id":1,"items":[{"name":"sub1","id":11},{"name":"sub2","id":12},{"name":"sub3","id":13}]},{"name":"newww","id":"2","items":[{"name":"new1","id":21},{"name":"new2","id":22},{"name":"new3","id":23}]}]
     * @label Data
     * @category_name 2_Data
     */

    data: {
      type: Array,
      required: false
    },

    /**
     * To fetch JSON data from url
     * @param  { String } url
     * @label URL
     * @category_name 1_General
     */
    url: {
      type: String,
      required: false
    },
    /**
     * base_url
     * @param {string} base_url
     * @label Base URL
     * @category_name 1_General
     */
    base_url: {
      type: String,
      required: false
    },
    /**
     * Variant for b-dropdown
     * @param { String } -variant
     * @category_name 4_Style
     */
    variant: {
      type: String,
      default: 'link'
    },

    /**
     * Button content
     * @param {object} button_options
     * @category_name 2_Data
     * @properties
     {
      "icon": {"type": "String", "default": "fas fa-ellipsis-v"},
      "label": {"type": "String"},
      "variant": {"type": "String", "default": "outline-secondary", "values": ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "outline-primary", "outline-secondary", "outline-success", "outline-danger", "outline-warning", "outline-info", "outline-light", "outline-dark"]},
      "size": {"type": "String", "default": "sm", "values": ["sm", "md", "lg"]}
      }
     * @label Button Options
     */
    button_options: {
      type: Object,
      required: false
    },

    /**
     * Dynamic label - picks the label name dynamically for group from the JSON data
     * @param { String } key_label
     * @label Key Label
     * @category_name 2_Data
     */

    key_label: {
      type: String,
      required: false,
      default: 'name'
    },

    /**
     * @param { Boolean } show_group_name
     */
    show_group_name: {
      type: Boolean,
      required: false,
      default: true
    },

    /**
     * Dropdown menu right aligned
     * @param { Boolean } right
     */
    right: {
      type: Boolean,
      default: false
    },

    /**
     * Preload handler
     * @param { String } preload
     * @category_name 2_Data
     */
    preload: {
      type: String,
      required: false
    },

    /**
     * Handler params for preload handler
     * @param { String } handler_params
     * @category_name 2_Data
     */
    handler_params: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      JSON_data: [],
      selected_item: ''
    }
  },

  /**
   * watcher for url
   * fetches data from url when url changed
   */

  watch: {
    url: function (newVal, oldVal) {
      this.url = newVal
      this.set_data()
    },
    data (newVal, oldVal) {
      this.JSON_data = newVal
    }
  },
  /**
   *  created hook
   * sets  data to component when created
   * if no key labelmis given name is taken as default
   */

  created () {
    if (this.url) {
      this.set_data()
    } else {
      this.JSON_data = this.data
    }
  },
  mounted () {
    /**
     * Preload handler
     */
    if (this.preload) {
      this.start(this.preload, {
        helper: {
          component: this,
          custom: this.handler_params ? JSON.parse(this.handler_params) : {}
        }
      })
    }
  },
  methods: {
    /**
     * Triggers droprdown item clickedv evenet
     * @param {Object} item
     * @param {Object} subItem
     */

    get_data (item, subItem) {
      let selected = {}
      this.selected_item = item.name
      selected.group = item

      if (subItem) {
        selected.group_item = subItem
      }

      this.$emit('dd_item_clicked', selected)
    },

    /**
     * Fetch data from url and give it to component
     */

    set_data () {
      var _this = this
      if (_this.url) {
        this.$appupajax
          .get2(
            _this.url,
            {},
            {},
            { withCredentials: true, credentials: 'include' }
          )
          // this.$appupajax.get2(_this.url, {}, { withCredentials: true, credentials: "include" }).
          .then(this.$appupajax.handleResponse)
          .then(response => {
            // Assign JSON data from url to component
            _this.JSON_data = response.data
          })
          .catch(error => {
            console.log(error)
          })
      }
    },

    /**
     * Hide dropdown
     */
    hide () {
      this.$refs.dropdown && this.$refs.dropdown.hide()
    }
  }
}
</script>
