import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'
import modules from './modules'
import logger from 'vuex/dist/logger'

Vue.use(Vuex)
var debug = process.env.NODE_ENV === 'development'
const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  modules,
  strict: debug,
  plugins: debug ? [logger()] : []
})

export default store
