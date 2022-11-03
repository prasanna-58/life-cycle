<template>
  <div class="dropdown">
    <button
      @click="show_dropdown()"
      class="btn btn-default dropdown-toggle btn-dropdown"
      type="button"
    >
      <slot @click="show_dropdown" name="btn_slot"></slot>
    </button>
    <ul :class="`dropdown-menu parent-ddm${$attrs.refs}`">
      <template v-for="(dropdown,dInx) in nested_dropdown_list">
        <li
          :class="['pl-2 cursor-pointer', item_class]"
          v-show="!dropdown.isSubMenu"
          :key="`${dropdown[key_value]}${dInx}`"
          @click="emit_nested_data(dropdown)"
        >
          <p v-if="dropdown.text">
            <i v-if="dropdown.icon" :class="[dropdown.icon, 'mr-1']"></i>
            {{dropdown.text}}
          </p>
          <!-- use this slot for main dropdown item -->
          <slot name="step" :item="dropdown"></slot>
        </li>
        <li
          :class="['dropdown-submenu', item_class]"
          v-show="dropdown.isSubMenu"
          :key="`${dropdown[key_value]}-submenu`"
        >
          <p class="test pl-2 cursor-pointer">
            <i v-if="dropdown.icon" :class="[dropdown.icon, 'mr-1']"></i>
            {{dropdown.text}}
            <span class="caret"></span>
          </p>
          <ul class="dropdown-menu">
            <template v-for="(subdd1,d1Inx) in dropdown.subMenuList">
              <li
                :class="['pl-2 cursor-pointer', item_class]"
                v-show="!subdd1.isSubMenu"
                :key="`${subdd1[key_value]}${d1Inx}`"
                @click="emit_nested_data(dropdown,subdd1)"
              >
                <p v-if="subdd1.text">
                  <i v-if="subdd1.icon" :class="[subdd1.icon, 'mr-1']"></i>
                  {{subdd1.text}}
                </p>
                <!-- use this slot for first sub dropdown item -->
                <slot name="step1" :item="subdd1"></slot>
              </li>
              <li
                :class="['dropdown-submenu', item_class]"
                v-show="subdd1.isSubMenu"
                :key="`${subdd1[key_value]}-submenu`"
              >
                <p class="test pl-2 cursor-pointer">
                  <i v-if="subdd1.icon" :class="[subdd1.icon, 'mr-1']"></i>
                  {{subdd1.text}}
                  <span class="caret"></span>
                </p>
                <ul class="dropdown-menu">
                  <template v-for="(subdd2,d2Inx) in subdd1.subMenuList">
                    <li
                      :class="['pl-2', item_class]"
                      v-show="!subdd2.isSubMenu"
                      :key="`${subdd2[key_value]}${d2Inx}`"
                      @click="emit_nested_data(dropdown,subdd1,subdd2)"
                    >
                      <p class="cursor-pointer" v-if="subdd2.text">
                        <i v-if="subdd2.icon" :class="[subdd2.icon, 'mr-1']"></i>
                        {{subdd2.text}}
                      </p>
                      <!-- use this slot for sub dropdown item -->
                      <slot name="step2" :item="subdd2"></slot>
                    </li>
                    <li
                      :class="['dropdown-submenu', item_class]"
                      v-show="subdd2.isSubMenu"
                      :key="`${subdd2[key_value]}-submenu`"
                    >
                      <p class="test pl-2 cursor-pointer">
                        <i v-if="subdd2.icon" :class="[subdd2.icon, 'mr-1']"></i>
                        {{subdd2.text}}
                        <span class="caret"></span>
                      </p>
                    </li>
                  </template>
                </ul>
              </li>
            </template>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ac-nested-dropdown',
  props: {
    /**
     * JSON List of options for dropdown
     * @param {Array} -nested_dropdown_list
     * @category_name 1_General
     */
    nested_dropdown_list: {
      type: Array,
      required: true
    },
    /**
     * Dynamic label to pick value from JSON data
     * @param {String} -key_value
     * @category_name 1_General
     */
    key_value: {
      type: String,
      required: true
    },
    /**
     * Variant of emitted data (item object or item ids)
     * @param {Boolean}
     */
    emit_event: {
      type: Boolean,
      default: false
    },
    /**
     * Hide dropdown after click
     * @param {Boolean}
     */
    auto_close: {
      type: Boolean,
      default: true
    },

    /**
     * Dropdown item class
     */
    item_class: [String, Object]
  },
  data () {
    return {}
  },
  mounted () {
    this.toggle_dropdown()
  },
  methods: {
    /**
     * Toggle dropdown
     * Add event listners tothe dropdown items
     */
    toggle_dropdown () {
      // eslint-disable-next-line camelcase
      let nested_dropdown_list = document.querySelectorAll(
        '.dropdown-submenu p.test'
      )

      for (var i = 0; i < nested_dropdown_list.length; i++) {
        if (nested_dropdown_list[i]) {
          nested_dropdown_list[i].addEventListener('mouseover', function (e) {
            if (!e.target.nextElementSibling) return
            e.target.nextElementSibling.style.display = 'block'
            e.target.nextElementSibling.addEventListener(
              'mouseover',
              function () {
                e.target.nextElementSibling.style.display = 'block'
              }
            )
            e.stopPropagation()
            e.preventDefault()
          })
        }
        nested_dropdown_list[i].addEventListener('mouseout', function (e) {
          if (!e.target.nextElementSibling) return
          e.target.nextElementSibling.style.display = 'none'
          e.target.nextElementSibling.addEventListener('mouseout', function () {
            e.target.nextElementSibling.style.display = 'block'
          })
          e.stopPropagation()
          e.preventDefault()
        })
      }
    },

    /**
     * Emit event on click of dropdown item
     * @param {Object} step - Data of main dropdown
     * @param {Object} step1 -Data of level 1 sub dropdown dropdown
     * @param {Object} step2 -Data of level 2 sub dropdown dropdown
     */
    emit_nested_data (step, step1, step2) {
      let emittedSteps = {}
      if (step) emittedSteps['step'] = step[this.key_value]
      if (step1) emittedSteps['step1'] = step1[this.key_value]
      if (step2) emittedSteps['step2'] = step2[this.key_value]
      this.$emit('nested_menu_emit', this.emit_event ? step2 || step1 || step : emittedSteps)
      this.auto_close && this.hide_dropdown()
    },

    /**
     * Triggers on click of and display the items
     */
    show_dropdown () {
      const dropdown = this.$el.querySelector('.parent-ddm' + this.$attrs.refs)
      if (dropdown.style.display === '' || dropdown.style.display === 'none') { dropdown.style.display = 'block' } else { dropdown.style.display = 'none' }
    },

    /**
     * Hide opened dropdown
     */
    hide_dropdown () {
      this.$el.querySelectorAll('.dropdown-menu').forEach(el => {
        el.style.display = 'none'
      })
    }
  }
}
</script>

<style scoped>
.dropdown-menu li,
.dropdown-submenu li {
  cursor: pointer;
}
.dropdown-submenu {
  position: relative;
}
.dropdown-submenu .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -1px;
}
.dropdown-toggle::after {
  display: none;
}
</style>
