import { platformAjax } from '@/ajax'
import { storage } from '@lcsoft/utils'
export default {
  // 获取用户信息
  getUserDetail ({ commit }) {
    return new Promise((resolve, reject) => {
      let _userDetail = storage.get('user-detail')
      if (!window.diableUserDetailCache && _userDetail) {
        commit('updateUserDetail', _userDetail)
        resolve()
      } else {
        platformAjax.get('/user/detail').then((res) => {
          commit('updateUserDetail', res)
          if (res.rolePermission && res.defaultRoleId.trim() === '') {
            reject(new Error('无默认身份'))
          } else {
            storage.set('user-detail', res)
            resolve()
          }
        })
      }
    })
  },
  // 获取菜单权限
  getMenuList ({ commit, state }) {
    let params = {}
    if (state.userDetail.rolePermission) {
      params.roleId = state.userDetail.defaultRoleId
    }
    return new Promise((resolve, reject) => {
      platformAjax.get('/menu/mine/' + window.APP_CONFIG.appCode, params).then((res) => {
        if (res === 'offline') {
          resolve('offline')
        } else {
          commit('updateMenuList', res.menu)
          commit('updateAppAlias', res.appAlias)
          resolve(res.menu)
        }
      })
    })
  }
}
