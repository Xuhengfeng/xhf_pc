<template>
  <div id="app" :class="{'full-screen': fullscreen}">
    <!-- 头部、侧边栏 -->
    <template v-if="!fullscreen">
      <frame-header :title="title" :username="username" :logo="$store.state.userDetail.logo"></frame-header>
      <frame-menu :dev-menu-list="devMenuList"></frame-menu>
    </template>
    <!-- 中间主区域 -->
    <main id="main-wrap">
      <router-view></router-view>
    </main>
    <!-- 返回顶部 -->
    <transition name="back-top-fade">
      <div class="back-top" v-show="showBackTop" @click="backTop">
        <i class="el-icon-caret-top"></i>
      </div>
    </transition>
  </div>
</template>

<script>
import { FrameHeader, FrameMenu } from '@lcsoft/vue-components'
import PerfectScrollbar from 'perfect-scrollbar'
export default {
  name: 'App',
  components: {
    FrameHeader,
    FrameMenu
  },
  data () {
    return {
      title: this.$store.state.appAlias,
      username: this.$store.state.userDetail.realName,
      // 是否是快捷应用,全屏显示
      fullscreen: /\?fullscreen=1/.test(window.location.href),
      // 是否显示返回顶部按钮
      showBackTop: false,
      // 主区域DOM
      mainDom: null,
      // 侧边栏菜单
      devMenuList: [
        { menuAliasName: '发布通知', menuName: '发布通知', menuCode: 'PublishInform', menuIcon: 'icon-publish-inform' },
        { menuAliasName: '我的草稿', menuName: '我的草稿', menuCode: 'Draft', menuIcon: 'icon-info' },
        { menuAliasName: '历史通知', menuName: '历史通知', menuCode: 'InformList', menuIcon: 'icon-notice' }
      ]
    }
  },
  mounted () {
    // 美化滚动条
    this.mainDom = document.querySelector('#main-wrap')
    // const ps = new PerfectScrollbar(this.mainDom, {
    //   handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel'],
    //   swipeEasing: false,
    //   scrollingThreshold: 5000
    // })
    // 控制是否显示返回顶部按钮
    this.mainDom.addEventListener('scroll', (event) => {
      if (this.mainDom.scrollTop > 100) {
        !this.showBackTop && (this.showBackTop = true)
      } else {
        this.showBackTop && (this.showBackTop = false)
      }
    })
  },
  methods: {
    // 缓慢返回顶部
    backTop () {
      this.move(this.mainDom.scrollTop / 30)
    },
    move (length) {
      setTimeout(() => {
        if (this.mainDom.scrollTop > length) {
          this.mainDom.scrollTop -= length
          this.move(length)
        } else {
          this.mainDom.scrollTop = 0
        }
      }, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  width: 100%;
  height: 100%;
  min-width: 960px;
  box-sizing: border-box;
  padding: 70px 0 0 200px;
  position: relative;
  &:after {
    content: "";
    display: block;
    position: absolute;
    top: 70px;
    left: 200px;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    border: 15px solid $color-bg;
    z-index: 100;
    pointer-events: none; // 不捕获点击事件，让事件穿透到伪类下面的元素
  }
  &.full-screen {
    padding: 0;
    min-width: unset;
    &:after {
      top: 0px;
      left: 0px;
    }
  }
  #main-wrap {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 15px;
    background-color: #f4f5f6;
    overflow: hidden;
    position: relative;
  }
  .back-top {
    background-color: $color-white;
    position: fixed;
    right: 50px;
    bottom: 100px;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 0 6px $color-ccc;
    z-index: 1000;
    &:hover {
      box-shadow: 0 0 12px $color-ccc;
      i {
        font-size: 24px;
      }
    }
  }

  .back-top i {
    color: $color-theme;
    display: block;
    line-height: 40px;
    text-align: center;
    font-size: 18px;
  }

  .back-top-fade-enter,
  .back-top-fade-leave-active {
    transform: translateY(-30px);
    opacity: 0;
  }
}
</style>
