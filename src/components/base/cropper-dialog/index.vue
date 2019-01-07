<template>
  <dialog-box ref="dialog" v-model="show" title="上传公告封面" width="880px" top="150px" :show-footer="false" :autoClose="false" @cancel="cancel">
    <div slot="body" class="lc-p-20">
      <el-container>
        <el-aside width="50%">
          <div class="wrapper" style="width:400px;height:300px;">
            <vueCropper ref="cropper" :autoCrop="option.autoCrop" :autoCropWidth="option.autoCropWidth" :autoCropHeight="option.autoCropHeight" :fixed="option.fixed" :fixedNumber="option.fixedNumber" :img="option.img" :outputSize="option.size" :outputType="option.outputType" :info="true" :full="option.full" :canMove="option.canMove" :canMoveBox="option.canMoveBox" :fixedBox="option.fixedBox" :original="option.original" @realTime="realTime">
            </vueCropper>
          </div>
          <div class="test-button">
            <el-button type="success" size="small">
              <label for="uploads">选择图片</label>
            </el-button>
            <input type="file" id="uploads" style="position:absolute; clip:rect(0 0 0 0);" accept="image/png, image/jpeg, image/gif, image/jpg" @change="uploadImg($event, 1)">
            <i class="iconfont icon-fangda" @click="imgMagnify"></i>
            <i class="iconfont icon-suoxiao" @click="imgShrink"></i>
            <i class="iconfont icon-zuozhuan" @click="clearCrop"></i>
          </div>
        </el-aside>
        <el-main style="padding:0 0 0 0;">
          <p class="preview_img">裁剪预览</p>
          <div class="show-preview" :style="{'width': '375px', 'height': '150px',  'overflow': 'hidden', 'margin': '5px', 'background' : '#f7f7f7'}">
            <div :style="{'width': '375px', 'height': '150px'}">
              <img :src="previews.url" :style="previews.img">
            </div>
          </div>
          <div class="min-button">
            <el-button type="danger" size="small" icon="iconfont icon-yun_import" @click="down">上传</el-button>
          </div>
        </el-main>
      </el-container>
    </div>
  </dialog-box>
</template>

<script>
import vueCropper from 'vue-cropper'
import { storage } from '@xuhengfeng/utils'
export default {
  components: { vueCropper },
  data () {
    return {
      show: true, // 弹框状态
      option: {
        img: '', // 裁剪图片地址
        size: 1, // 裁剪生成图片的质量
        full: false, // 是否输出原图比例的截图
        outputType: 'png', // 裁剪生成图片的格式
        canMove: true, // 上传图片是否可以拖动
        canMoveBox: true, // 截图框能否拖动
        fixedBox: false, // 截图框是否可以改变
        original: false, // 上传图片是否显示原始比例大小
        autoCrop: true, // 是否默认生成截图框
        fixed: true, // 开启宽度和高度比例
        fixedNumber: [5, 2] // 宽高比例
      },
      previews: {}, // 截取的图片参数对象
      imageUuid: null
    }
  },
  methods: {
    // 放大
    imgMagnify () {
      this.$refs.cropper.changeScale(1)
    },
    // 缩小
    imgShrink () {
      this.$refs.cropper.changeScale(-1)
    },
    // 弹框取消
    cancel () {
      this.$emit('showDialog')
    },
    // 清除截取框
    clearCrop () {
      this.$refs.cropper.clearCrop()
      this.$refs.cropper.startCrop()
    },
    // 实时预览效果
    realTime (data) {
      let percentage = 375 / data.w
      let regular = /translate3d\((.*),(.*),/
      if (percentage !== Infinity) {
        let w = Number(data.img.width.slice(0, data.img.width.length - 2)) * percentage
        let h = Number(data.img.height.slice(0, data.img.height.length - 2)) * percentage
        let x = `${regular.exec(data.img.transform)[1]}`
        let y = `${regular.exec(data.img.transform)[2]}`
        data.img.width = w + 'px'
        data.img.height = h + 'px'
        data.img.transform = `${data.img.transform.split('translate3d')[0]}translate3d(${x.slice(0, x.length - 2) * percentage}px,${y.slice(0, y.length - 2) * percentage}px,0)rotateZ(0deg)`
      }
      this.previews = data
    },
    // 上传图片
    down () {
      // 输出
      this.$refs.cropper.getCropData((data) => {
        /**
         * 将以base64的图片url数据转换为Blob
         * @param urlData
         * 用url方式表示的base64图片数据
         */
        function convertBase64UrlToBlob (urlData) {
          var bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
          // 处理异常,将ascii码小于0的转换为大于0
          var ab = new ArrayBuffer(bytes.length)
          var ia = new Uint8Array(ab)
          for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i)
          }
          return new Blob([ab], { type: 'image/png', name: `${parseInt(1000000 * (Math.random() + 1))}.png` })
        }
        this.$cosUploadFile(convertBase64UrlToBlob(data)).then(res => {
          this.$emit('showDialog', res.url)
        })
        // this.$dfsApi.post('file/uploadBase64', { 'base64Str': data }).then(res => {
        //   this.$emit('showDialog', res.uuid)
        // })
      })
    },
    // 选择图片
    uploadImg (e, num) {
      // this.option.img
      var file = e.target.files[0]
      if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
        alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
        return false
      }
      var reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
      }
      // 转化为base64
      reader.readAsDataURL(file)
      // 转化为blob
      // reader.readAsArrayBuffer(file)
    }
  }
}
</script>

<style lang="scss" scoped>
.preview_img {
  border-left: 5px solid $color-theme;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  padding-left: 15px;
  margin-bottom: 20px;
}
.test-button {
  padding-top: 15px;
  text-align: left;
  .iconfont {
    color: $color-theme;
    cursor: pointer;
    margin-left: 70px;
    font-size: 20px;
  }
}
.min-button {
  padding-top: 45px;
  text-align: center;
}
</style>
