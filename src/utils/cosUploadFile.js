import axios from 'axios'
export default function cosUploadFile (inputEle, msgId = 'msg') {
  return new Promise((resolve, reject) => {
    const method = 'POST'
    const prefix = window.COS_CONFIG.Prefix
    // 显示错误信息
    function showMsg (msg, color = 'red') {
      let msgEle = document.querySelector(`#${msgId}`)
      msgEle.innerHTML = `<pre style="color: ${color};">${JSON.stringify(msg, null, 2)}</pre>`
    }
    // 获取授权信息
    function getAuthorization () {
      let url = `${window.COS_CONFIG.AuthUrl}?method=${method}`
      return new Promise((resolve, reject) => {
        axios.get(url).then(res => {
          if (res.data.success) {
            resolve(res.data.data)
          } else {
            showMsg(res.data.error)
            reject(res.data.error)
          }
        }).catch(error => {
          showMsg('获取授权失败')
          reject(error)
        })
      })
    }
    // 上传文件
    function uploadFile (file) {
      let name = `${parseInt(1000000 * (Math.random() + 1))}.png`
      let pathname = 'file-' + parseInt(1000000 * (Math.random() + 1)) + '/' + name // 随机文件夹名以避免同名文件覆盖
      getAuthorization().then(auth => {
        let url = prefix
        var fd = new FormData()
        fd.append('Signature', auth.Authorization)
        auth.XCosSecurityToken && fd.append('x-cos-security-token', auth.XCosSecurityToken)
        fd.append('key', pathname)
        fd.append('file', file)

        axios({ method, url, data: fd }).then(() => {
          resolve({ url: prefix + pathname, name: name })
        }).catch(() => {
          showMsg('上传失败')
        })
      })
    }
    if (inputEle) {
      uploadFile(inputEle)
    } else {
      showMsg('请选择文件')
    }
  })
}
