import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import Home from '@/Home'
import Simple from '@/Simple'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/simple'},
  { path: '/home', component: Home },
  { path: '/simple', component: Simple }
]

const router = new VueRouter({
  routes
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
