import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
// import acExcelTable from '.././ac-excel-table'
import acExcelTable from '@/components/ac-excel-table'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'AC',
      component: acExcelTable
    },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
