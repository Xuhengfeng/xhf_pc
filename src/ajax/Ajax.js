import axios from 'axios'
import storage from './storage'
import regExp from './regExp'
import {
  Message
} from 'element-ui'
import NProgress from 'nprogress'
NProgress.configure({
  showSpinner: false
})
var reqPool = [] // 请求池,用于去掉重复的请求

export default class Ajax {
  /**
   *
   * @param { String } baseURL        基础请求地址
   * @param { String } access_token   token
   * @param { Number } timeout        超时时间
   */
  constructor (baseURL = '', access_token = '', timeout = 30000) {
    // 错误提醒实例
    this.message = null
    // 创建一个新的axios实例，并设置默认请求地址和请求头
    this._axios = axios.create({
      baseURL,
      timeout,
      headers: {
        access_token,
        terminal_type: 'pc'
      }
    })
    // 设置进度条和错误处理
    this._axios.interceptors.request.use((config) => {
      // 保存第一次 post请求，剔除重复的 post 请求
      if (/post/i.test(config.method)) {
        var url = config.baseURL + config.url
        if (reqPool.includes(url)) return Promise.reject(new Error('数据正在处理中...'))
        reqPool.push(url)
      }
      NProgress.start() // 开启Progress
      return config
    }, (error) => {
      this.onError(error)
      return Promise.reject(error)
    })
    this._axios.interceptors.response.use((response) => {
      // 剔除已完成的 post 请求
      var config = response.config
      if (/post/i.test(config.method)) {
        console.log(123123)
        reqPool = reqPool.filter(url => url !== config.url)
      }
      if (response.data.code === 200) {
        NProgress.done() // 关闭Progress
        return response.data.data
      } else if (response.data.code === 401) {
        storage.get('token') && storage.remove('token')
        window.location.href = window.SYSTEM_CONFIG.loginPage + '?redirect_url=' + window.location.href.replace(regExp.isToken, '')
      } else {
        this.onError(response.data.msg)
        return Promise.reject(new Error(response.data.msg))
      }
    }, (error) => {
      if (error.message) {
        this.onError(error.message)
        return
      }
      try {
        let errorObj = JSON.parse(JSON.stringify(error))
        if (errorObj.response) {
          this.onError('错误码:' + errorObj.response.data.status + '  错误信息:' + errorObj.response.data.error)
        } else {
          this.onError('网络似乎出现问题,请稍后重试')
        }
      } catch (err) {
        this.onError(error)
      }
      return Promise.reject(error)
    })
  }
  // 错误处理
  onError (error) {
    NProgress.done() // 关闭Progress
    this.message && this.message.close()
    this.message = Message({
      type: 'error',
      message: error || '未知错误',
      duration: 2000,
      showClose: true
    })
  }
  // 各种请求
  get (url, params = {}) {
    return this._axios({
      method: 'get',
      url,
      params
    })
  }
  post (url, data = {}, params = {}) {
    return this._axios({
      method: 'post',
      url,
      data,
      params
    })
  }
  delete (url, data = {}, params = {}) {
    return this._axios({
      method: 'delete',
      url,
      data,
      params
    })
  }
  put (url, data = {}, params = {}) {
    return this._axios({
      method: 'put',
      url,
      data,
      params
    })
  }
  /**
   * 设置额外的默认参数
   * @param { Object } setting  例如 { params : { tenantId: store.state.userDetail.tenantId } }
   */
  setDefault (setting = {}) {
    for (let key in setting) {
      this._axios.defaults[key] = setting[key]
    }
  }
  // 返回原始的axios
  getAxios () {
    return axios
  }
}
