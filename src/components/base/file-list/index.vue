<template>
  <div class="file-list-wrapper">
    <!-- 图片列表 -->
    <div class="images" v-show="images.length">
      <div class="image-item" v-for="(item, index) in images" :key="index" :style="imageItemStyle(item, index)" @click="previewImage(item, index)">
        <a href="javascript:" v-if="edit" class="icon-clear">
          <img class="icon-remove" src="./close.svg" v-if="edit" @click.stop="removeFile(item, index)">
        </a>
      </div>
    </div>
    <!-- 间隔 -->
    <div class="gutter" v-show="showGutter"></div>
    <!-- 文件列表 -->
    <div class="files" v-show="files.length">
      <div class="file-item" v-for="(item, index) in files" :key="index">
        <div class="panel">
          <div class="img" :style="{height: iconSize + 'px', width: iconSize + 'px'}" >
            <div class="loading" v-show="item.converting"></div>
            <img class="img-el" :src="item.ext | fileIcon">
          </div>
          <div class="des" :class="{'align-center': !item.size || iconSize < 35}">
            <span class="name"
                  :class="{'link': canPreview(item)}"
                  :style="lineClamp(item)"
                  @click.stop="previewFile(item)"
            >{{ item.name }}</span>
            <span class="size" v-if="item.size && iconSize > 35">{{ item.size | prettySize }}</span>
          </div>
          <a :href="item.download" :download="item.name" v-if="!edit" class="btn-download el-icon-download"></a>
          <img class="icon-remove" src="./close.svg" v-if="edit" @click.stop="removeFile(item, index)">
        </div>
      </div>
    </div>
    <!-- 图片预览 -->
    <div>
      <previewer :list="images" ref="previewer"></previewer>
    </div>
    <!-- 文件预览弹层 -->
    <el-dialog :title="docTitle" :visible.sync="showPreviewDoc" width="100%" center fullscreen>
      <iframe frameborder="0" ref="iframe" width="100%" height="100%"></iframe>
    </el-dialog>
  </div>
</template>

<script type="ecmascript-6">
import axios from 'axios'
import Previewer from 'base/previewer'
const { apiServer, flowApi, cfsApi, htmlUrl, fileApi, officePreviewUrl, previewPDFUrl } = window.SYSTEM_CONFIG
const imagesExts = ['jpg', 'jpeg', 'bmp', 'gif', 'png', 'webp', 'tiff']
const defIcon = require('./unknow.png')
const iconMap = [
  { icon: require('./csv.png'), exts: ['csv'] },
  { icon: require('./txt.png'), exts: ['txt'] },
  { icon: require('./pdf.png'), exts: ['pdf'] },
  { icon: require('./zip.png'), exts: ['zip', 'rar', '7z', 'tar', 'gz'] },
  { icon: require('./excel.png'), exts: ['xls', 'xlsx', 'xlsm'] },
  { icon: require('./ppt.png'), exts: ['ppt', 'pptx'] },
  { icon: require('./word.png'), exts: ['doc', 'docx'] }
]

export default {
  components: {
    Previewer
  },
  props: {
    // 文件数组
    value: Array, // [{ url, name, size, ext }]
    // 是否可编辑
    edit: Boolean,
    // 图标大小
    iconSize: {
      type: Number,
      default: 50
    },
    // 图片列数
    rowSize: {
      type: Number,
      default: 4
    },
    // 图片大小（设置图片大小，列数会失效）
    imageSize: Number,
    // 服务器地址
    action: {
      type: String,
      default: fileApi + '/file/IoReadFile'
    },
    // 请求头参数(预览、下载)
    query: {
      type: Object,
      default () {
        return {
          terminal_type: 'pc',
          access_token: window.localStorage.getItem('token')
        }
      }
    },
    // 文件预览路由名字
    previewRouteName: {
      typ: String,
      default: 'PreviewFile'
    },
    // 支持预览的文件格式
    previewExts: {
      type: Array,
      default () {
        return ['doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xml', 'ppt', 'pptx', 'txt', 'pdf']
      }
    }
  },
  data () {
    return {
      // 显示预览文件
      showPreviewDoc: false,
      docTitle: '文件预览',
      // 图片列表
      images: [],
      // 当前预览的 image
      currImage: {},
      // 文件列表数组
      files: []
    }
  },
  computed: {
    showGutter () {
      return this.images.length && this.files.length
    }
  },

  created () {
    this.value && this.value.length && this.normalize()
  },

  mounted () {
    this.$watch('value', () => {
      this.normalize()
    })
  },

  methods: {
    previewImage (item, index) {
      this.$refs.previewer.show(index)
    },
    removeFile (item, index) {
      // this.stopWatch = true
      const list = this.value.filter(file => file !== item)
      this.$emit('input', list)
      this.$emit('on-remove', item, index)
    },
    // 控制文件名显示行数
    lineClamp (item) {
      let lines = parseInt(this.iconSize / 15)
      if (item.size && this.iconSize > 35) {
        lines--
      }
      return lines > 1
        ? { 'display': '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': lines, 'white-space': 'normal' }
        : { 'display': 'inline-block', 'white-space': 'nowrap' }
    },
    // 图片列数
    imageItemStyle (item, index) {
      const imageSize = this.imageSize
      if (imageSize) {
        return {
          width: imageSize + 'px',
          paddingTop: imageSize + 'px',
          marginRight: '10px',
          marginBottom: '10px',
          backgroundImage: `url("${item.src}")`
        }
      }

      const total = 100 // 总宽度
      const row = this.rowSize || 4 // 列数
      const gaps = row - 1 // 间隔个数
      let w = null
      switch (row) {
        case 3:
          w = 32
          break
        case 4:
          w = 23.5
          break
        case 5:
          w = 19.2
          break
        case 6:
          w = 16
          break
      }
      let m = (index + 1) % row ? (total - row * w) / gaps : null // margin 值
      return {
        width: w + '%',
        paddingTop: w + '%',
        marginRight: m + '%',
        marginBottom: m + '%',
        backgroundImage: `url(${item.src})`
      }
    },
    // 分离文件图片,格式化对象属性
    normalize () {
      // 标准化数据
      const images = []
      const files = []

      this.value.forEach(item => {
        item.url = item.url || item.fileUrl
        item.name = item.name || item.fileTitle
        item.ext = item.ext || item.fileType
        item.uuid = item.fileUuid || '0' // 腾讯云文件没有 uuid
        item.size = item.size
        item.download = /\/\//.test(item.url) ? item.url : (this.action + '?uuid=' + item.uuid) // 局域网保存的是相当路径

        if (imagesExts.includes(item.ext)) {
          item.src = item.src || (/\/\//.test(item.url) ? item.url : (this.action + '?uuid=' + item.uuid)) // 图片预览需要 src 属性
          images.push(item)
        } else {
          files.push(item)
        }
      })
      this.images = images
      this.files = files
    },
    // 是否能预览
    canPreview (file) {
      return this.previewExts.includes(file.ext)
    },
    // 预览文件
    previewFile (file) {
      // if (this.edit) return
      // 判断是否支持
      if (this.canPreview(file)) {
        // 是否已将转换过？
        const hadConvert = file.fileConvertUuid && file.fileConvertUrl
        if (hadConvert) {
          this._previewDoc(file)
        } else {
          // 提示延迟
          this.tipTimer = setTimeout(() => {
            this._message('文件转换中...请耐心等待~', 'danger')
          }, 300)
          // 请求转换
          this.$set(file, 'converting', true)
          if (file.uuid !== '0') {
            this._convertFile(file).then((file) => {
              clearTimeout(this.tipTimer)
              this.$set(file, 'converting', false)
              this._previewDoc(file)
            }).catch((err) => {
              clearTimeout(this.tipTimer)
              this.$set(file, 'converting', false)
              this._message(err || '抱歉，转换失败', 'error')
            })
          } else {
            this._previewDoc(file)
            this.$set(file, 'converting', false)
            clearTimeout(this.tipTimer)
          }
        }
      } else {
        this._message('抱歉，该文件不支持预览', 'warning')
      }
    },

    _previewDoc (file) {
      // this.$router.push({ name: this.previewRouteName, params: { url: htmlUrl + url } })
      // window.location.href = htmlUrl + url + '?t=' + Date.now()
      this.docTitle = file.fileTitle
      if (file.uuid === '0' && file.ext !== 'pdf') {
        window.open(officePreviewUrl + '?src=' + file.url, '_blank')
      } else {
        this.showPreviewDoc = true
        this.$nextTick(() => {
          this.$refs.iframe.src = file.uuid === '0'
            ? previewPDFUrl + '?file=' + file.url
            : htmlUrl + file.fileConvertUrl + '?t=' + Date.now()
        })
      }
    },
    // 转换文件
    _convertFile (file) {
      const url = cfsApi + '/doconvert'
      const params = Object.assign({}, this.query, { uuid: file.uuid })
      return axios.post(url, null, { params }).then(res => {
        const data = res.data
        if (data.code === '0' && data.isSuccess) {
          file.fileConvertUuid = data.destFile
          file.fileConvertUrl = data.destPath
          this._markFile(file)
          return Promise.resolve(file)
        }
        return Promise.reject(res.data.message)
      })
    },
    // 标记被转换的文件
    _markFile (file) {
      const url = apiServer + flowApi + (file.isStep ? '/flowInstanceStepFile/updateConvert/' : '/flowFormFile/updateConvert/') + file.id
      const data = { fileConvertUuid: file.fileConvertUuid, fileConvertUrl: file.fileConvertUrl }
      const params = this.query
      axios.put(url, data, { params }).then(res => {
        if (res.data.code === 200) {
          // convert success
        }
      })
    },
    // 提示
    _message (message, type = 'success') {
      this.$message({
        message,
        type
      })
    }
  },

  filters: {
    // file icon
    fileIcon (extension) {
      const index = iconMap.findIndex(icon => icon.exts.includes(extension))
      return index < 0 ? defIcon : iconMap[index]['icon']
    },
    // human size
    prettySize (val) {
      const size = parseInt(val)
      if (!size) return '未知大小'
      if (size > 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + 'M'
      }
      if (size > 1024) {
        return (size / 1024).toFixed(2) + 'K'
      }
      return size + 'B'
    }
  }
}
</script>

<style lang="scss" scoped>
.file-list-wrapper {
  line-height: normal;
  font-size: 0;
  // 图片列表
  .images {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    .image-item {
      position: relative;
      height: 0;
      border-radius: 5px;
      text-align: center;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
      box-shadow: 0.5px 0.5px 3px 1px #eee;
      background-color: #f0f0f0;
      cursor: pointer;
      &:hover {
        box-shadow: 1px 1px 5px 2px #ddd;
      }
      .icon-clear {
        position: absolute;
        top: -8px;
        right: -6px;
        width: 20%;
        padding-top: 20%;
        border-radius: 50%;
        background: #fff;
        z-index: 1;
        .icon-remove {
          transform: scale3d(1.2, 1.2, 1.2);
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          fill: #d81e06;
        }
      }
    }
  }
  // 分割线
  .gutter {
    height: 1px;
    background-color: #ddd;
    margin: 5px 0 8px;
  }
  // 文件列表
  .files {
    .file-item {
      display: flex;
      position: relative;
      align-items: center;
      margin-top: 5px;
      padding-bottom: 6px;
      border-bottom: 1px solid #ddd;
      &:last-child {
        border-bottom-color: transparent;
        padding-bottom: 0;
      }
      .panel {
        flex: 1;
        display: flex;
        align-items: center;
        max-width: 100%;
        text-decoration: none;
        overflow: hidden;
        .img {
          height: 50px;
          position: relative;
          .img-el {
            width: 100%;
            height: 100%;
          }
          .loading {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            &::before {
              content: " ";
              display: inline-block;
              box-sizing: border-box;
              width: 90%;
              height: 90%;
              border-radius: 50%;
              border: 2px dotted #fff;
              border-right-color: transparent;
              animation: rotate 1s infinite;
            }
          }
        }
        .des {
          flex: 1;
          width: 50px;
          align-self: stretch;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-left: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          &.align-center {
            justify-content: center;
          }
          .name {
            max-width: 100%;
            // flex: 1;
            align-self: flex-start;
            padding-top: 1px;
            overflow: hidden;
            word-break: break-all;
            text-overflow: ellipsis;
            font-size: 14px;
            color: #777;
            cursor: pointer;
            &.link {
              color: #4e97d9;
              &:hover {
                text-decoration: underline;
              }
            }
          }
          .size {
            padding-bottom: 1px;
            font-size: 13px;
            color: #ccc;
          }
        }
        .btn-download {
          padding: 0 8px;
          height: 100%;
          margin-right: -8px;
          font-weight: bold;
          font-size: 20px;
          color: #4e97d9;
          text-decoration: none;
          transition: transform 0.3s;
          &:hover {
            transform: scale3d(1.3, 1.3, 1.3)
          }
        }
        .icon-remove {
          // position: absolute;
          // right: 5px;
          width: 25px;
          height: 25px;
          cursor: pointer;
          // fill: $color-danger;
        }
      }
    }
  }
}

.el-dialog__wrapper /deep/ .el-dialog__body  {
  height: 100%;
  box-sizing: border-box;
  text-align: initial;
  padding: 30px 0px;
}
// 图片预览插件下载按钮
.image-download-btn {
  float: right;
  padding: 12px;
  .el-icon-download {
    font-size: 21px;
    font-weight: bold;
    color: #ddd;
    &:hover {
      color: #fff;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotateZ(0deg)
  }
  to {
    transform: rotateZ(360deg)
  }
}
</style>
