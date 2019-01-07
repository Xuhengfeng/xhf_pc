<template>
  <label class="label">
    <input ref="fileInput" class="input" type="file" multiple @change="onSelectFile">
    <a href="javascript:" class="def-upload-icon">
      <slot v-if="!sending || !progress">
        <img src="./file.svg" width="40">
      </slot>
    </a>
    <x-circle class="x-circle" v-show="sending && progress" @click.native.prevent.stop="abort" :percent="percent" :stroke-width="5" stroke-color="#04BE02">
      <span>{{ percent }}%</span>
    </x-circle>
  </label>
</template>

<script type="ecmascript-6">
import XCircle from './x-circle'
import axios from 'axios'
const { Prefix, AuthUrl } = window.COS_CONFIG || {}
const { cfsApi, fileApi } = window.SYSTEM_CONFIG
const ERR_OK = 200
const CancelToken = axios.CancelToken
const imagesExts = ['jpg', 'jpeg', 'bmp', 'gif', 'png', 'webp', 'tiff']

export default {
  components: {
    XCircle // 默认进度条
  },
  props: {
    // 上传服务器地址
    action: {
      type: String,
      default: Prefix || `${fileApi}/file`
    },
    // 请求头参数
    query: {
      type: Object,
      default () {
        return {
          terminal_type: 'pc',
          access_token: window.localStorage.getItem('token')
        }
      }
    },
    // 其他要上传的参数
    params: Object,
    // 上传的文件字段名
    name: {
      type: String,
      default: 'file'
    },
    // 接受的文件类型
    accept: {
      type: Array,
      default () {
        return []
        // return ['doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xml', 'ppt', 'pptx', 'txt', 'pdf', 'zip', 'rar', 'tar', 'gz', '7z']
        // return ['jpg', 'jpeg', 'bmp', 'gif', 'png', 'webp', 'tiff']
      }
    },
    // 限制文件大小，默认 500M
    maxSize: {
      type: Number,
      default: 500 * 1024 * 1024
    },
    // 是否显示进度条,派发 on-progress 事件
    progress: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // 发送中
      sending: false,
      // 上传进度
      percent: 0
    }
  },

  mounted () {
    this.fileInput = this.$refs.fileInput
  },

  methods: {
    // 获取授权信息
    _getAuthorization () {
      return axios.get(`${AuthUrl}?method=POST`).then(res => {
        if (res.data.success) {
          return res.data.data
        } else {
          this.$emit('on-error', res.data.error)
        }
      }).catch(err => {
        this.$emit('on-error', err.message || err)
      })
    },

    onSelectFile () {
      let files = this.fileInput.files
      if (window.COS_CONFIG) {
        this._upload1(files, 0)
      } else {
        this._upload2(files, 0)
      }
    },
    // 上传到腾讯云
    _upload1 (files, uploadIndex) {
      this.sending = true
      this.percent = 0
      let file = files[uploadIndex]
      if (!file) {
        this.sending = false
        this.fileInput.value = null
        return
      }

      // 校验文件格式
      let ext = file.name.slice(file.name.lastIndexOf('.') + 1)
      if (this.accept && this.accept.length && !this.accept.includes(ext)) {
        this.$emit('on-error', `不支持${ext}格式的文件，请选择 ${this.accept} 格式`)
        uploadIndex++
        this._upload1(files, uploadIndex)
        return
      }
      // 校验文件大小
      if (this.maxSize && file.size > this.maxSize) {
        let size = this.maxSize / 1024 // K
        size = size >= 1024 ? (size / 1024).toFixed(1) + 'M' : size.toFixed(1) + 'K'
        this.$emit('on-error', `请选择小于${size}的文件`)
        uploadIndex++
        this._upload1(files, uploadIndex)
        return
      }
      this._getAuthorization().then(auth => {
        // 表单
        let pathname = 'file-' + parseInt(1000000 * (Math.random() + 1)) + '/' + file.name // 随机文件夹名以避免同名文件覆盖
        const formData = new FormData()
        formData.append('Signature', auth.Authorization)
        if (auth.XCosSecurityToken) {
          formData.append('x-cos-security-token', auth.XCosSecurityToken)
        }
        formData.append('key', pathname)
        formData.append('file', file)
        // 其他参数
        for (var k in this.params) {
          formData.append(k, this.params[k])
        }
        this.sending = true
        axios({
          url: this.action,
          method: 'post',
          data: formData,
          params: this.query,
          // 上传进度
          onUploadProgress: e => {
            this.percent = parseInt(e.loaded / e.total * 100)
            this.$emit('on-progress', this.percent)
          },
          // 取消上传
          cancelToken: new CancelToken(cancel => {
            this.cancel = cancel
          })
        }).then(res => {
          const { name, size } = file
          const data = { name, size, ext, url: `${this.action.replace(/\/$/, '')}/${pathname}` }
          event.target.value = null
          // 图片文件转转 base64 预览
          if (imagesExts.includes(ext)) {
            data.src = data.url
          }
          this.$emit('on-success', data)
          this.sending = false
          this.percent = 0
          this.$emit('on-progress', this.percent)
          uploadIndex++
          this._upload1(files, uploadIndex)
        }).catch((err, xhr) => {
          uploadIndex++
          this._upload1(files, uploadIndex)
          this.$emit('on-error', err.message || err)
          this.sending = false
          this.percent = 0
          this.$emit('on-progress', this.percent)
        })
      })
    },
    // 上传到局域网
    _upload2 (files, uploadIndex) {
      this.sending = true
      this.percent = 0
      let file = files[uploadIndex]
      if (!file) {
        this.sending = false
        this.fileInput.value = null
        return
      }
      // 校验文件格式
      let ext = file.name.slice(file.name.lastIndexOf('.') + 1)
      if (this.accept && this.accept.length && !this.accept.includes(ext)) {
        this.$emit('on-error', `不支持${ext}格式的文件，请选择${this.accept}格式`)
        uploadIndex++
        this._upload2(files, uploadIndex)
        return
      }

      // 校验文件大小
      if (this.maxSize && file.size > this.maxSize) {
        let size = this.maxSize / 1024 // K
        size = size >= 1024 ? (size / 1024).toFixed(1) + 'M' : size.toFixed(1) + 'K'
        this.$emit('on-error', `请选择小于${size}的文件`)
        uploadIndex++
        this._upload2(files, uploadIndex)
        return
      }
      // 表单
      const formData = new FormData()
      // 文件
      formData.append(this.name, file)
      // 其他参数
      for (let k in this.params) {
        formData.append(k, this.params[k])
      }

      axios({
        url: this.action,
        method: 'post',
        data: formData,
        params: this.query,
        // 上传进度
        onUploadProgress: e => {
          this.percent = parseInt(e.loaded / e.total * 100)
          this.$emit('on-progress', this.percent)
        },
        // 取消上传
        cancelToken: new CancelToken(cancel => {
          this.cancel = cancel
        })
      }).then(res => {
        this.percent = 0
        this.$emit('on-progress', this.percent)
        uploadIndex++
        this._upload2(files, uploadIndex)

        if (res.data.code === ERR_OK) {
          const { name, size } = file
          const data = Object.assign({ name, size, ext }, res.data.data)
          data.url = res.data.data.relativePath // 坑
          data.fileUuid = res.data.data.uuid // 坑
          // 图片文件转转 base64 预览
          if (imagesExts.includes(ext)) {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = e => {
              data.src = e.target.result
              this.$emit('on-success', data)
            }
          } else {
            this.$emit('on-success', data)
          }
        } else {
          this.$emit('on-error', res.data.msg)
        }
      }).catch((err, xhr) => {
        this.percent = 0
        this.$emit('on-progress', this.percent)
        uploadIndex++
        this._upload2(files, uploadIndex)
        this.$emit('on-error', err)
      })
    },
    // 取消上传
    abort () {
      this.$confirm('是否取消上传？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.cancel('用户已取消上传')
      })
    }
  }
}
</script>

<style scoped>
.label {
  position: relative;
  height: 35px;
  min-width: 40px;
  line-height: normal;
  display: inline-block;
  cursor: pointer;
}
.label .input[type='file'] {
  display: none;
}
.label .def-upload-icon {
  display: inline-block;
  height: 100%;
  width: 100%;
  pointer-events: none;
}
.label .x-circle {
  position: absolute;
  top: 0;
}
</style>
