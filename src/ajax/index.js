import {
  Ajax,
  storage,
  regExp
} from '@xuhengfeng/utils-pc'

// 获取ACCESS_TOKEN
let tokenMatch = regExp.isToken.exec(window.location.href)
let ACCESS_TOKEN
if (tokenMatch) {
  ACCESS_TOKEN = tokenMatch[1]
  storage.set('token', ACCESS_TOKEN)
  // 去除地址栏上的token
  window.location.href = window.location.href.replace(regExp.isToken, '')
  throw SyntaxError('跳转触发,阻止js执行')
} else {
  if (storage.get('token')) {
    ACCESS_TOKEN = storage.get('token')
  } else {
    window.location.href = window.SYSTEM_CONFIG.loginPage + '?redirect_url=' + window.location.href
    throw SyntaxError('跳转触发,阻止js执行')
  }
}

// 实例化AJAX
const platformAjax = new Ajax(window.SYSTEM_CONFIG.apiServer + window.SYSTEM_CONFIG.platformApi, ACCESS_TOKEN)
export {
  platformAjax
}
