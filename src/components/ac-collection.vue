<!-- eslint-disable camelcase -->
<template>
  <div
    ref="collection_wrapper"
    :style="{ maxHeight: max_height }"
    class="ac-collection card d-flex flex-column"
  >
    <div v-show="is_loading" class="loader row">
      <!-- onError is to handle the broken image of loader -->
      <img
        :src="loading_image"
        class="loader__image"
        :onError="onerror_handle_loader"
        alt="loader m-auto"
      />
    </div>

    <header class="ac-collection-header">
      <!-- Use this slot for header -->
      <slot name="header"></slot>
    </header>

    <main class="ac-collection-body">
      <div @scroll="infiniteScroll" :style="scroll_style">
        <!-- Use this slot for empty group -->
        <div v-if="show_default">
          <slot name="default">
            <div class="col-sm-12 col-xl-4 col-lg-4 col-md-4 col-xs-12 p-2">
              <div class="card cursor-pointer">
                <div class="card-body text-center py-5 my-3">
                  <button class="btn text-secondary">
                    <i class="fal fa-plus fa-2x"></i>
                  </button>
                </div>
              </div>
            </div>
          </slot>
        </div>
        <!-- Use this slot for body -->
        <slot name="body" :data="actual_data"></slot>

        <div
          v-if="
            actual_data &&
              !actual_data.length &&
              data_loaded == true &&
              !is_loading
          "
        >
          <!-- Use this slot for Empty State -->
          <slot name="empty_state"></slot>
        </div>
        <div v-if="loadmore_icon" class="text-center">
          <img
            src="https://cdn.500apps.io/images/icons/loadmore.gif"
            class="loader__image m-auto"
            alt="loading"
          />
        </div>
        <div
          v-show="load_more_type === 'loadMoreButton'"
          v-if="pagination_type === 'loadMore'"
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
    </main>

    <footer class="ac-collection-footer">
      <!-- Use this slot for footer -->
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
import AppData from '.././mixins/ac-data'
import AppPreload from '.././mixins/ac-preload'

/**
 * ac Colection component which can be used to display data from API
 * @requires VueBootstrap
 * @requires ac-data.js,ac-preload.js
 * @inherits ac-data,ac-preload
 */
export default {
  name: 'ac-collection',

  mixins: [AppData, AppPreload],

  props: {
    /**
     * Will statis data instead from url
     * @label Data
     * @category_name 1_General
     */
    static_data: {
      type: Array,
      required: false,
      default: () => []
    },
    /**
     * If Show Default grouped card if True
     * @label Show Default Card
     * @category_name 1_General
     */
    show_default: {
      type: Boolean,
      required: false
    },
    /**
     * If true displays loader image
     * @param {string} is_loading
     * @label Display Loader
     * @category_name 4_Style
     */
    is_loading: {
      type: Boolean,
      required: false
    },
    // /**
    //  * Image to show while loading data
    //  * @param {string} loading_image
    //  * @label Loading Image
    //  * @category_name 4_Style
    //  */
    // loading_image: {
    //   type: String,
    //   default:
    //     'https://cmswebsites.s3.us-west-1.amazonaws.com/Dual%20Ring-0.9s-200px.gif'
    // },

    /**
     * Max height of component
     * @param {string} max_height
     * @label Maximum Height
     * @category_name 4_Style
     */
    max_height: {
      type: String,
      required: false,
      default: '100%'
    },

    /**
     * Fetch data count with given url
     * @param {string} data_count_url
     * @label Data Count Url
     * @category_name 3_Advanced
     */
    data_count_url: {
      type: String,
      required: false
    },

    /**
     * This key will be used to get count from data_count_url
     * @param {string} count_key
     * @label Count Key
     * @category_name 3_Advanced
     */
    count_key: {
      type: String,
      required: false
    },

    // /**
    //  * Type of pagination
    //  * @param {string} pagination_type
    //  * @properties {"label":"Pagination Type", "type": "List", "default": "deselect", "values": ["deselect","pagination", "loadMore","scroll"]}
    //  * @default "deselect"
    //  * 'deselect, pagination, loadMore'
    //  * @label Pagination Type
    //  * @category_name 3_Advanced
    //  */
    // pagination_type: {
    //   type: String,
    //   default: 'deselect',
    //   validator: value =>
    //     ['deselect', 'pagination', 'loadMore', 'scroll'].indexOf(value) !== -1
    // },

    // /**
    //  * Type of loading more information
    //  * @param {string} load_more_type
    //  * @properties {"label":"Load More Type", "type": "List", "default": "deselect", "values": ["deselect","loadMoreButton", "infiniScroll"]}
    //  * @default loadMoreButton
    //  * 'loadMoreButton, infiniScroll'
    //  * @label Load More Type
    //  * @category_name 3_Advanced
    //  */
    // load_more_type: {
    //   type: String,
    //   default: 'loadMoreButton',
    //   validator: value =>
    //     ['deselect', 'loadMoreButton', 'infiniScroll'].indexOf(value) !== -1
    // },
    // /**
    //  * Call handler when preload page
    //  * @param {string} preload
    //  * @label Preload
    //  */
    // preload: {
    //   type: String,
    //   required: false
    // },
    // /**
    //  * Provide params to handler
    //  * @param {string} handler_params
    //  * @label Handler Params
    //  * @category_name 1_General
    //  */
    // handler_params: {
    //   type: String,
    //   required: false
    // },

    // /**
    //  * If it is true show load more option
    //  * @param {string} show_loadmore
    //  * @label Show Load More
    //  * @category_name 3_Advanced
    //  * @private
    //  */
    // show_loadmore: {
    //   type: Boolean,
    //   default: false
    // },
    /**
    //  * When Pagination Type is true give total count of data for loading with limit
    //  * @param {Number} total_count
    //  * @label Total Count
    //  * @category_name 3_Advanced
    //  */
    // total_count: {
    //   type: Number,
    //   required: false,
    //   default: 0
    // },
    // /**
    //  * When pagination type is true displays the data based on limit
    //  * @param {Number} limit
    //  * @label Limit
    //  * @category_name 3_Advanced
    //  */
    // limit: {
    //   type: Number,
    //   required: false
    // },
    // /**
    //  * When Show Load More is true limit should append for which key in url
    //  * @param {Number} limit_key
    //  * @label Limit Key
    //  * @category_name 3_Advanced
    //  */
    // limit_key: {
    //   type: String,
    //   required: false
    // },
    // /**
    //  * When Show Load More is true offset should append for which key in url
    //  * @param {Number} offset_key
    //  * @label Offset Key
    //  * @category_name 3_Advanced
    //  */
    // offset_key: {
    //   type: String,
    //   required: false
    // },
    /**
     * Style for sroll bar eg:{"over-flow" : "auto","max-height" : "350px"}
     * @param {Object} scroll_style
     * @label Scroll Style
     * @category_name 4_Style
     */
    scroll_style: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      offset: 0,
      page_number: 0,
      actual_data: [],
      custom: '',
      from_load_more: false,
      data_loaded: false,
      loadmore_icon: false,
      loading_image:
        'https://infinity.500apps.com/img/siterecording/loading.png',
      limit: 5,
      total_count: 20,
      pagination_type: 'loadMore',
      load_more_type: 'loadMoreButton',
      limit_key: '_limit',
      offset_key: '_start'

    }
  },

  computed: {
    /**
     * Disable load more option by comparing dara length
     * @return Integer - Page Number
     */
    load_option () {
      let l = parseInt(this.total_count)
      let s = parseInt(this.limit)
      if (l % s !== 0) return Math.floor(l / s)
      else return Math.floor(l / s) - 1
    },
    /**
     * getting count of loaded data
     */
    loaded_data_count () {
      // return this.actual_data.length;
      return parseInt(this.limit) + parseInt(this.offset)
    },
    /**
     * To handle the broken image of loader
     * @return String - Loading Image
     */
    onerror_handle_loader () {
      if (this.loading_image) {
        return "this.onerror=null;this.src='" + this.loading_image + "';"
      } else {
        return "this.onerror=null;this.src='https://cmswebsites.s3.us-west-1.amazonaws.com/Dual%20Ring-0.9s-200px.gif';"
      }
    }
  },

  watch: {
    ac_cursor (newval, oldval) {
      // this.appendToacCursor();
      // this.set_ajax();
    },
    body_data (newval, oldval) {
      this.body_data = newval
    },
    static_data: {
      handler (val) {
        this.is_loading = false
        this.data = val
      },
      deep: true
    },
    // To keep track with data on change
    data: {
      handler (val) {
        this.data_loaded = true
        this.is_loading = false
        if (!this.page_number || this.data_changed) {
          if (
            (this.pagination_type === 'loadMore' ||
              this.pagination_type === 'scroll') &&
            this.page_number
          ) {
            // check for data
            if (this.data && this.data.length) {
              this.actual_data = this.actual_data.concat(this.data)
            } else if (this.data && Object.keys(this.data).length) {
              this.actual_data = { ...this.actual_data, ...this.data }
            } else {
              this.actual_data = this.actual_data
            }
            // this.actual_data =
            //   (this.data && (this.data.length || Object.keys(this.data).length))
            //     ? ((this.data.length)?this.actual_data.concat(this.data): {...this.data})
            //     : this.actual_data;
          } else {
            if (
              this.data &&
              this.data.length !== undefined &&
              this.data.length
            ) {
              this.actual_data = this.data
            } else if (this.data && Object.keys(this.data).length) {
              this.actual_data = { ...this.data }
            } else {
              this.actual_data =
                this.data && (this.data.length || Object.keys(this.data).length)
                  ? this.data
                  : this.actual_data
            }
          }
          this.data_changed = false
        }
      },
      deep: true
    },

    // To get data when count_url is changed
    data_count_url (newval, oldval) {
      this.data_count_url = newval
      this.get_total_data_count()
    },
    pagination_type (newval, oldval) {
      this.pagination_type = newval
    }
  },

  created () {
    this.$parent.$emit('collection_added', {
      name: this.$options.name,
      component: this
    })
  },

  mounted () {
    if (this.static_data && this.static_data.length) {
      this.data = this.static_data
    } else if (this.url) {
      // this.data_loaded = (this.static_data && !this.static_data.length && !this.url)?true:false;
      this.set_ajax_data()
    } else {
      this.data = []
    }
    if (
      this.pagination_type === 'scroll' &&
      this.load_more_type === 'infiniScroll'
    ) {
      this.scroll_style =
        typeof this.scroll_style === 'string'
          ? JSON.parse(this.scroll_style)
          : this.scroll_style
    }

    if (this.pagination_type !== 'deselect') {
      this.get_total_data_count()
    }

    /**
     * If prop load_more_type is infiniScroll then add listener for scroll
     * when scroll reaches bottom of page then load more data
     */

    if (this.load_more_type === 'infiniScroll') {
      const wrapper = this.$refs.collection_wrapper
      if (wrapper) {
        wrapper.onscroll = () => {
          if (
            wrapper.scrollTop ===
            wrapper.scrollHeight - wrapper.offsetHeight
          ) {
            if (!this.is_loading) {
              this.has_more()
              this.set_ajax()
            }
          }
        }
      }
    }

    // calls preload handler
    // if (this.preload) {
    //   if (this.handler_params) {
    //     try {
    //       this.custom = JSON.parse(this.handler_params);
    //     } catch (e) {
    //       this.custom = this.handler_params;
    //     }
    //   } else {
    //     this.custom = {};
    //   }

    //   this.start(this.preload, {
    //     helper: {
    //       component: this,
    //       custom: this.custom
    //     }
    //   });
    // }
  },

  beforeDestroy () {
    /**
     * Remove scroll listener when component about to destroy
     */
    window.onscroll = () => {}

    this.$parent.$emit('collection_removed', {
      name: this.$options.name,
      component: this
    })
  },

  methods: {
    /**
     * To get the data from ajax call
     * @function set_ajax_data
     */
    async set_ajax_data () {
      // return new Promise(resolve => {
      //   setTimeout(() => {

      // If show loadmore true appends limit and offset key to url
      if (
        this.pagination_type === 'loadMore' ||
        this.pagination_type === 'scroll'
      ) {
        if (!this.from_load_more) {
          this.page_number = 0
          this.offset = 0
        }

        // forming params with limit and offset
        this.changed_ac_cursor = {
          [this.limit_key]: parseInt(this.limit),
          [this.offset_key]: parseInt(this.offset)
        }

        this.from_load_more = false
      }

      await this.set_ajax()
      this.loadmore_icon = false
      //  this.data = this.actual_data;
      //  console.log("after load more option ",this.actual_data,this.data);
      // resolve("data");
      //   }, 2000);
      // });
    },

    /**
     * @function @async get_total_data_count - local function to get count of data from API
     * @public
     */
    async get_total_data_count () {
      if (this.data_count_url && this.data_count_url !== '') {
        // eslint-disable-next-line camelcase
        let body_data =
          this.body_data && typeof this.body_data === 'object'
            ? this.body_data
            : JSON.parse(this.body_data)
        // eslint-disable-next-line camelcase
        let data_count = await this.fetch_data(
          this.data_count_url,
          this.method,
          body_data
        )
        // eslint-disable-next-line camelcase
        if (data_count && Array.isArray(data_count)) {
          this.total_count = this.count_key
            ? data_count[0][this.count_key]
            // eslint-disable-next-line operator-linebreak
            : // eslint-disable-next-line camelcase
            data_count
          // eslint-disable-next-line camelcase
        } else if (data_count && typeof data_count === 'object') {
          this.total_count = this.count_key
            ? data_count[this.count_key]
            // eslint-disable-next-line operator-linebreak
            : // eslint-disable-next-line camelcase
            data_count
        }
      } else {
        console.log('Provide data_count_url to get length of data')
      }
    },
    /**
     * Onclick of loadmore to load with the new data
     */
    loadmore_click_fun: function () {
      this.loadmore_icon = true
      this.page_number++
      this.from_load_more = true
      try {
        this.offset += parseInt(this.limit)
      } catch (error) {
        console.log(error)
      }
      this.set_ajax_data()
    },
    /**
     * Get data when scroll reaches end
     */
    async infiniteScroll (event) {
      if (this.load_more_type === 'infiniScroll') {
        if (
          Math.ceil(event.target.scrollTop) >=
          event.target.scrollHeight - event.target.clientHeight
        ) {
          if (this.loaded_data_count < this.total_count) {
            this.page_number++
            this.offset = parseInt(this.limit) * this.page_number
            this.from_load_more = true
            this.set_ajax_data()
            // const result = await this.loadmore_click_fun();
            // this.stored_data = this.actual_data.concat(this.data);
          }
        }
      }
    }
  }
}
</script>

<style>
.ac__item {
  display: flex;
  flex-wrap: wrap;
}

.ac-collection {
  overflow-y: auto;
  overflow-x: hidden;
}

.ac-collection-body {
  flex: auto;
}

.loader {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.65);
}
.loader__image {
  width: 100px;
}
</style>
