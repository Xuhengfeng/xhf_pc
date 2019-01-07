// 混入公共数据,方法等
import Vue from 'vue'
import {
  Loading
} from 'element-ui'
Vue.mixin({
  // 组件内的data,props是访问不到这个data里数据的
  data () {
    return {
      // loading实例
      loadingService: {},
      // 延迟loading
      loadingDelay: {},
      // 根据uuid获取图片地址
      readFileUrl: window.SYSTEM_CONFIG.fileApi + '/file/IoReadFile?uuid='
    }
  },
  created () {

  },
  mounted () {

  },
  methods: {
    /**
     *
     * 1. Loading加载状态控制
     * @param { Truthy } show 开关状态
     * @param { String } target 要添加Loading的元素的CSS选择器
     * @param { String } text Loading文字
     * @param { Number } delay loadingy延迟
     */
    _loading (show = true, target = '#main-wrap', text = '', delay = 500) {
      if (show) {
        this.loadingDelay[target] = setTimeout(() => {
          if (this.loadingDelay[target]) {
            this.loadingService[target] = Loading.service({
              target,
              text
            })
          }
        }, delay)
      } else {
        if (this.loadingDelay[target]) {
          clearTimeout(this.loadingDelay[target])
          delete this.loadingDelay[target]
        }
        if (this.loadingService[target]) {
          this.loadingService[target].close()
          delete this.loadingService[target]
        }
      }
    }
  }
})
