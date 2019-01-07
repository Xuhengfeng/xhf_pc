export default {
  data () {
    return {
      uploadProgress: 0 // 附件上传进度
      // attachments: [] // 附件
    }
  },
  methods: {
    // 上传错误
    uploadError (err) {
      this.$message({
        type: 'error',
        message: err
      })
    },
    // 上传成功
    uploadSuccess (file) {
      this.attachments.push(file)
    },
    // 取消上传
    cancelUpload () {
      this.$refs.upload.abort()
    }
  }
}
