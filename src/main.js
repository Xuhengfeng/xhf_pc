import Vue from 'vue'
import store from './store'
import Router from 'vue-router'
import './filters'
import './mixin'
import {
  TotalRouter,
  ForbiddenRouter,
  OfflineRouter
} from './router'
import {
  platformAjax,
  notificationAjax,
  dfsApi,
  classAjax
} from './ajax'
import classUrl from './ajax/classUrl'
import ElementUI from 'element-ui'
import '@xuhengfeng/styles'
import './styles/index.scss'
import App from './App'
import Role from './Role'
import merge from 'webpack-merge'
import {
  cosUploadFile
} from './utils'
import {
  HeaderBar,
  SearchBar,
  FormHeader,
  DialogBox,
  Cascader,
  UploadPc
} from '@xuhengfeng/vue-components'
import {
  formatDate
} from '@xuhengfeng/utils'
import Avatar from 'base/avatar'
import Upload from 'base/upload'
import FileList from 'base/file-list'
import Voice from 'base/voice'

Vue.use(ElementUI)
Vue.use(Router)
Vue.prototype.$merge = merge
Vue.prototype.$cosUploadFile = cosUploadFile
Vue.filter('formatDate', formatDate)
// 将ajax方法挂载到原型上
Vue.prototype.$platformAjax = platformAjax
Vue.prototype.$notificationAjax = notificationAjax
Vue.prototype.$dfsApi = dfsApi
Vue.prototype.$classAjax = classAjax
Vue.prototype.$URL = classUrl
Vue.config.productionTip = process.env.NODE_ENV === 'development'

// 注册全局组件
Vue.component('upload', Upload)
Vue.component('file-list', FileList)
Vue.component('header-bar', HeaderBar)
Vue.component('search-bar', SearchBar)
Vue.component('form-header', FormHeader)
Vue.component('dialog-box', DialogBox)
Vue.component('cascader', Cascader)
Vue.component('upload-pc', UploadPc)
Vue.component('avatar', Avatar)
Vue.component('Voice', Voice)

// 获取应用用户信息
store.dispatch('getUserDetail')
  .then((res) => {
    // 本地开发环境开放全部路由，线上环境根据接口过滤路由
    if (process.env.NODE_ENV === 'development') {
      // 默认激活第一个
      TotalRouter.push({
        path: '*',
        redirect: `${TotalRouter[0].redirect}`
      })
      let router = new Router({
        routes: TotalRouter
      })
      renderApp(router)
    } else {
      store.dispatch('getMenuList').then((res) => {
        let authoredRouter
        if (res === 'offline') {
          authoredRouter = OfflineRouter
        } else {
          // 过滤出该用户已被授权的路由
          authoredRouter = TotalRouter.filter((item) => {
            return res.findIndex(menu => menu.menuCode === item.name) !== -1
          })
          //	如果有授权的路由跳转到第一个,没有授权的路由跳转到无权限提示页
          if (authoredRouter.length) {
            // 默认激活第一个
            authoredRouter.push({
              path: '*',
              redirect: `${authoredRouter.find(menu => menu.name === res[0].menuCode).redirect}`
            })
          } else {
            authoredRouter = ForbiddenRouter
          }
        }
        let router = new Router({
          routes: authoredRouter
        })
        renderApp(router)
      })
    }
  }).catch(() => {
    renderRole()
  })

// 实例化应用
function renderApp (router) {
  router.afterEach((to, from) => {
    Vue.prototype.$nextTick(() => {
      document.querySelector('#main-wrap').scrollTop = 0 // 跳转路由时,主区域返回顶部
    })
  })
  var app = new Vue({
    el: '#app',
    router,
    store,
    components: {
      App
    },
    template: '<App/>'
  })
}
// 实例化默认角色选择
function renderRole () {
  var app = new Vue({
    el: '#app',
    store,
    components: {
      Role
    },
    template: '<Role/>'
  })
}
