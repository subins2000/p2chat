import App from './App.vue'
import Vue from 'vue'

require('normalize.css/normalize.css')
require('./styles/index.scss')

// Focus element
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

const app = new Vue({
  render: h => h(App)
}).$mount('#app')