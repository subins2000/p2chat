import App from './App.vue'
import Vue from 'vue'

require('normalize.css/normalize.css')
require('./styles/index.scss')

const app = new Vue({
  render: h => h(App)
}).$mount('#app')