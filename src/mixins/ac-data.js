/* eslint-disable camelcase */
import Handlebars from 'handlebars'
/**
 * @mixin
 */
export default {
  name: 'ac-data',

  props: {
    /**
     * Fetch data with given url
     * @param {string} url
     * @label URL
     * @category_name 1_General
     */
    // url: {
    //   type: String,
    //   required: false
    // },
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
     * Fetch data with given Method
     * @properties {"label":"method", "type": "List", "default": "GET", "values": ["GET", "POST", "DELETE", "PUT"]}
     * @param {string} method
     * 'GET/POST/PUT/DELETE'
     * @label Method
     * @category_name 1_General
     */
    // method: {
    //   type: String,
    //   default: 'GET',
    //   validator: value => ['GET', 'POST', 'DELETE', 'PUT'].indexOf(value) !== -1
    // },

    /**
     * Fetch data with given parameters
     * @param {object} params
     * @label Params
     * @category_name 1_General
     */
    // params: {
    //   type: Object,
    //   default: () => ({})
    // },
    /**
     * Fetch data with given raw body data
     * @param {object} body_data
     * @label Body Data
     * @category_name 1_General
     */
    body_data: {
      type: Object,
      default: () => ({})
    },
    /**
     * Data will be filtered by this key
     * @param {string} filter_key
     * @label Filter Key
     * @category_name 3_Advanced
     * @private
     */
    filter_key: {
      type: String,
      default: ''
    },

    /**
     * Filter data by value of filter_key
     * @param {string|number} filter_value
     * @label Filter Value
     * @category_name 3_Advanced
     * @private
     */
    filter_value: {
      type: [String, Number],
      default: ''
    },

    // /**
    //  * Object for generating url query params params
    //  * @param {string|number} ac_cursor
    //  * @label Ac Cursor
    //  * @category_name 1_General
    //  */
    // ac_cursor: {
    //   type: Object,
    //   default: () => ({})
    // },

    /**
     * Count for the API calls
     * @param {string|number} count
     * @label Fetch Count
     * @category_name 3_Advanced
     * @private
     */
    fetch_count: {
      type: [String, Number],
      default: 1,
      validator: val => val > 0
    },

    // /**
    //  * This key will be used in each object to sort data
    //  * @param {string} sort_key
    //  * @label Sort Key
    //  * @category_name 3_Advanced
    //  */
    // sort_key: {
    //   type: String,
    //   required: false
    // },

    /**
     * This key will be used in response to set data
     * @param {string} response_key
     * @label Response Key
     * @category_name 3_Advanced
     */
    response_key: {
      type: String,
      required: false
    }
  },

  data () {
    return {
      /**
       * @type {object} - dynamic query params to url
       */
      changed_ac_cursor: {},

      /**
       * @type {boolean} - is loading are in progress now
       */
      // is_loading: false,

      /**
       * @type {boolean} - is loading are finished
       */
      loaded: false,
      /**
       * @type {boolean} - url changed
       */
      data_changed: false,
      /**
       * @type {boolean} - is API has more data
       */
      ac_has_more: false,

      /**
       * @type {array} - data from API to sort, filter, etc.
       */
      data: [],

      /**
       * @type {array} - original data from API
       */
      original_data: [],
      sort_key: 'name',
      params: {
        headers: {
          'Custom-Header': 'My custom header'
        }
      },
      method: 'GET',
      ac_cursor: {},
      url: 'https://jsonplaceholder.typicode.com/comments',
      group_key: 'postId'

    }
  },

  methods: {
    /**
     * @function @async set_ajax - Get data from API with url, method and params from props
     * @public
     * and sets it to data and original_data. If response has no data - sets empty array to data
     * Also updates url depending on ac_cursor and response length
     */
    async set_ajax () {
      if (this.url) {
        let data = ''
        if (this.method === 'POST') {
          const body_params = this.prepare_body_params()
          data = await this.fetch_data(`${this.url}`, this.method, body_params)
        } else {
          const url_params = this.prepare_url_params()
          data = await this.fetch_data(
            `${this.url}${url_params}`,
            this.method,
            this.params
          )
        }

        data = this.response_key ? data[this.response_key] : data
        /* const search = `${url_params.length ? `${url_params}&` : '?'}offset=${data.length}`
        window.history.pushState(null, null, search) */

        this.original_data = [...data]
        this.data = this.group_key ? this.group_array(data) : data
        this.has_more()
        this.sort()

        /**
         * Fires when data is successfully loaded from API.
         *
         * @event success
         * @type {string}
         * @property {array} response - data from API.
         */
        this.$emit('success', this.data)
      }
    },

    prepare_url_params () {
      const params = []
      const url_has_params = this.url.split('?').length > 1
      const cursor = { ...this.ac_cursor, ...this.changed_ac_cursor }
      Object.keys(cursor).forEach(key => {
        if (cursor[key]) {
          params.push(`${key}=${cursor[key]}`)
        }
      })

      return params.length
        ? `${url_has_params ? '&' : '?'}${params.join('&')}`
        : params
    },

    prepare_body_params () {
      const body = {}
      body.data =
        this.body_data && typeof this.body_data === 'object'
          ? this.body_data.data
          : JSON.parse(this.body_data).data
      body.data = {
        ...body.data,
        ...this.ac_cursor,
        ...this.changed_ac_cursor
      }
      return body
    },

    /**
     * @function @async group_array - Group given array by group_key prop.
     * @param {array} arr - array to be grouped
     */
    group_array (arr) {
      if (!arr.length) return {}

      const data = [...arr]
      const grouped = {}

      data.forEach(el => {
        const key = el[this.group_key]
        // delete el[this.group_key]

        if (grouped[key]) {
          grouped[key].push(el)
        } else {
          grouped[key] = [el]
        }
      })

      return grouped
    },

    /**
     * @function has_more - Check if there is more data to fetch
     * @public
     */
    has_more () {
      this.ac_has_more =
        (this.original_data && this.original_data.length) < this.fetch_count
    },

    /**
     * @function @async fetch_data - local function to get data from API
     * @public
     * @param {string} url - url to get data from
     * @param {string} method - name of method
     * @param {string} params - url to get data from
     */
    async fetch_data (url, method, params) {
      console.log('url------------->', url)
      console.log(params, 'method------------->', method)

      let response = null
      // handle loader variables
      this.loaded = false
      // this.is_loading = true

      // compilation of handlebars
      var template = Handlebars.compile(url)
      // Compile and assign to this.compileUrl
      let compileData = {}
      compileData['route'] = {}
      compileData.route.params = this.$route.params
      compileData.ui_json = window.UIJSON
      compileData.appup = window.APPUP
      // eslint-disable-next-line no-undef
      var compileUrl = template(compileData)

      /**
       * Fires before call to API starts.
       * @event loading
       * @type {string}
       */
      this.$emit('loading')
      if (method.toUpperCase() === 'GET') {
        let Header_params = null
        if (params.headers) {
          Header_params = params.headers
        } else {
          Header_params = params
        }
        console.log('Header_params---->', Header_params)
        response = await this.$appupajax
          .get2(
            compileUrl,
            {},
            {},
            { ...Header_params, withCredentials: true, credentials: 'include' }
          )
          .then(this.$appupajax.handleResponse)
          .catch(error => {
            console.error('Error:', error)
            this.is_loading = false
          })
      } else if (method.toUpperCase() === 'POST') {
        response = await fetch(compileUrl, {
          method: 'POST',
          credentials: 'include',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }).catch(() => {
          this.is_loading = false
        })
      } else {
        response = await fetch(compileUrl, {
          ...params,
          method,
          withCredentials: true,
          credentials: 'include'
        }).catch(error => {
          console.error('Error:', error)
          this.is_loading = false
        })
      }

      this.loaded = true
      // this.is_loading = false

      /**
       * Fires when API gives responce.
       *
       * @event loaded
       * @type {string}
       * @property {Promise} response - response from API.
       */
      this.$emit('loaded', response)

      if (response && method.toUpperCase() === 'GET') {
        response = await response.data
        this.is_loading = false
      } else if (response.ok) {
        response = await response.json()
        this.is_loading = false
      } else {
        // response = []
        this.is_loading = false
      }
      return response
      /**
       * Fires when data is failed to loaded from API.
       *
       * @event failure
       * @type  {Promise}
       */
      // eslint-disable-next-line no-unreachable
      this.$emit('failure', response)
      return null
    },

    /**
     * @function get_cursor - get current value of current ac_cursor
     * @returns {string|number}
     * @public
     */
    get_cursor () {
      return this.ac_cursor
    },

    /**
     * @function get_data - returns data array
     * @returns {array}
     * @public
     */
    get_data () {
      return [...this.data]
    },

    /**
     * @function reset - resets data
     * sets ac_cursor to 1 and loads data from api
     * @public
     */
    reset () {
      this.set_ajax()
    },

    /**
     * @function set_data - set new data
     * @param {array} new_data - new data to be used as data
     * @public
     */
    set_data (new_data = []) {
      this.original_data = [...new_data]
      this.data = this.group_key ? this.group_array(new_data) : [...new_data]
    },

    /**
     * @function add - add new data to data
     * @param {array} new_data - new data to be added to data
     * @public
     */
    add (new_data = []) {
      if (!new_data.length) return
      this.original_data = [...this.data, ...new_data]
      this.data = this.group_key
        ? this.group_array(this.original_data)
        : [...this.data, ...new_data]
    },

    /**
     * @function sort - sort data with key specified in prop sort_key
     * @public
     */
    sort () {
      if (!this.sort_key) return
      const sorted = this.sort_array(this.original_data)
      this.data = this.group_key ? this.group_array(sorted) : sorted
    },

    sort_array (arr) {
      const sorted = [...arr]

      return sorted.sort((a, b) => {
        if (a[this.sort_key] > b[this.sort_key]) return 1

        if (a[this.sort_key] < b[this.sort_key]) return -1

        return 0
      })
    },

    /**
     * @function filter - filter data
     * @public
     * @param {string|number} key - filter data by this key
     * @param {string|number} key_value - filter data with this value in key
     */
    filter (key, key_value) {
      if (!key || !key_value) {
        key = this.filter_key
        key_value = this.filter_value
      }

      const filtered = this.original_data.filter(obj => {
        const obj_key = String(obj[key]).toLowerCase()
        const val = String(key_value).toLowerCase()

        return obj_key === val
      })

      this.data = this.group_key ? this.group_array(filtered) : filtered
    },

    /**
     * @function remove - remove item from data
     * @param {string} key - filter data by this key
     * @param {string} key_value - filter data with this value in key
     * @public
     * Does not changes original_data
     */
    remove (key, key_value) {
      if (!key || !key_value) return

      if (this.group_key) {
        delete this.data[this.group_key]
        return
      }

      this.data = this.data.filter(obj => obj[key] !== key_value)
    }
  },

  watch: {
    // Whenever url params is changed, call Ajax
    changed_ac_cursor () {
      this.data_changed = true
      // this.set_ajax();
    },
    ac_cursor () {
      this.data_changed = true
      this.set_ajax()
    }
  }
}
