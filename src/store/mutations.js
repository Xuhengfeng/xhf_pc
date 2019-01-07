export default {
  // 更新用户信息
  updateUserDetail (state, data) {
    state.userDetail = data
  },
  // 更新菜单权限
  updateMenuList (state, data) {
    state.menuList = data
  },
  // 更新应用名称
  updateAppAlias (state, data) {
    state.appAlias = data
  }
}
