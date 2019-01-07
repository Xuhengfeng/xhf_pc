import Vue from 'vue'
import {
  formatDate
} from '@xuhengfeng/utils-pc'
// 时间戳转日期
Vue.filter('time', (timestamp, fmt = 'yyyy-MM-dd HH:mm') => {
  if (timestamp) {
    return formatDate(timestamp, fmt)
  } else {
    return ''
  }
})
