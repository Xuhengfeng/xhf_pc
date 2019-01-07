// 全部服务器
const ALL_SERVERS = {
  // 1. 内网版
  'LCSOFT_SERVER': {
    'webServer': '//192.168.0.201:8070', // 前端静态页面地址
    'apiServer': '//192.168.0.201:9094', // 接口网关地址
    'fileServer': '//192.168.0.201:9091' // 文件服务地址(特殊,未走网关)
  },
  // 2. ngrok穿透版,可外网访问
  'NGROK_SERVER': {
    'webServer': '//v2.izheng.top',
    'apiServer': '//v2-api.izheng.top',
    'fileServer': '//v2-file.izheng.top'
  },
  // 2. 腾讯云上的ngrok穿透版,可外网访问
  'TX_NGROK_SERVER': {
    'webServer': 'http://lc.ct.szlcsoft.com',
    'apiServer': 'http://lc-api.ct.szlcsoft.com',
    'fileServer': 'http://lc-file.ct.szlcsoft.com'
  }
}
// 当前使用的服务器
const ACTIVE_SERVER = 'LCSOFT_SERVER'
window.SYSTEM_CONFIG = {
  'webServer': ALL_SERVERS[ACTIVE_SERVER]['webServer'],
  'apiServer': ALL_SERVERS[ACTIVE_SERVER]['apiServer'],
  'fileServer': ALL_SERVERS[ACTIVE_SERVER]['fileServer'],
  'homePage': ALL_SERVERS[ACTIVE_SERVER]['webServer'] + '/neptune-home-pc/', // 我的主页
  'loginPage': ALL_SERVERS[ACTIVE_SERVER]['apiServer'] + '/sso-server/pc/login', // 登录页
  'fileApi': ALL_SERVERS[ACTIVE_SERVER]['fileServer'] + '/dfs-neptune', // 文件API
  'platformApi': '/platform-neptune' // 平台API
}
// 腾讯云cos
window.COS_CONFIG = {
  Prefix: `${window.location.protocol}//lunyu-1255697909.cos.ap-guangzhou.myqcloud.com/`,
  AuthUrl: '//134.175.237.224:3000/auth'
}
