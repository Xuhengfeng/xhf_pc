<template>
  <div class="wrapContent">
    <!-- 引用@lcsoft/vue-components里面的HeaderBar插件 -->
    <div class="blockTop">
      <header-bar title="通知详情" :button-list="buttonList"></header-bar>
    </div>
    <div class="middleContent">
      <div class="title">{{informInfo.noticeName}}</div>
      <div class="desc">
        <div>发布人: {{informInfo.createBy}}</div>
        <div>发布时间：{{informInfo.createTime|formatDate('yyyy-MM-dd MM:ss')}}</div>
      </div>
      <div class="content" v-html="informInfo.noticeContent"></div>
      <div class="files">
        <file-list :edit="false" :icon-size="40" :image-size="80" v-model="attachments" :props="{}"></file-list>
      </div>
      <voice :voice="voice" v-if="voice"></voice>
    </div>

  </div>
</template>

<script>
export default {
  data () {
    return {
      // 是否是快捷应用,全屏显示
      fullscreen: /\?fullscreen=1/.test(window.location.href),
      // HeaderBar插件左侧按钮
      buttonList: [
        {
          text: '返回',
          size: 'small', // 同element-ui
          icon: 'el-icon-back', // iconfont图标
          callback: this.goBack // methods定义的方法
        }
      ],
      informInfo: {}, // 通知信息
      contentHtml: null,
      params: null, // 接收路由传递参数
      readNum: 0,
      readUserList: [],
      noreadNum: 0,
      notReadUserList: [],
      attachments: [],
      voice: null
    }
  },
  watch: {
    $route: {
      handler (value) {
        this.params = value.query
        this.getDetails()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 返回
    goBack () {
      this.$router.go(-1)
    },
    // 获取通知详情
    getDetails () {
      var params = {
        notReadUserIdList: this.params.noread.split('-'),
        readUserIdList: this.params.read.split('-'),
        id: this.params.id
      }
      this.$classAjax.post(this.$URL.classNoticeDetail, params).then(res => {
        this.informInfo = res
        this.attachments = res.noticeFileList.filter(el => el.fileUuid !== 'audio')
        var audioFile = res.noticeFileList.filter(el => el.fileUuid === 'audio')[0]
        this.voice = audioFile ? audioFile.fileUrl : ''
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.middleContent {
  padding: 0 150px;
  margin-bottom: 10px;
  background: #fff;
  height: calc(100% - 20px);
  overflow: auto;
  .title {
    font-size: 25px;
    font-weight: bold;
    text-align: center;
    height: 80px;
    line-height: 80px;
  }
  .desc {
    display: flex;
    flex-flow: row nowrap;
    text-align: center;
    color: #c2c2c2;
    div {
      flex: 1;
    }
  }
  .content {
    color: #858585;
  }
  .files {
    padding: 20px 0;
  }
}

.inform_type {
  display: inline-block;
  padding: 0 10px;
  color: $color-white;
  border-radius: 5px;
  margin-right: 10px;
}
.nodata {
  text-align: center;
  color: #ccc;
}
</style>
