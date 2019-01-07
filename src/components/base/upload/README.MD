1. 引入`Upload`组件

    `import { Upload } from '@lcsoft/vue-components-app'`

2. 注册组件
    ```js
    components: {
        Upload
    },
    ```
3. 属性

    属性名 | 说明 | 数据类型 | 默认值
    ---|---|---|---
    action | 上传服务器地址 | String |  `window.SYSTEM_CONFIG.fileApi + '/file'`
    query | 请求query参数 | Object | `{ terminal_type: 'mobile', access_token: token }`
    params | 其他要上传的body参数 | Object | -
    name | 上传的文件字段名 | String | `file`
    accept | 接受的文件类型 | Array | `[]`
    maxSize | 限制文件大小，默认 | Number | `50 * 1024 * 1024`
    progress | 是否显示进度条(默认原型进度条) | Boolean | `false`

4. 插槽
    name | 说明
    ---|---
    - | 默认，可以插入图标

5. 事件

    事件名 | 说明 | 回调参数
    ---|---|---
    on-progress | 上传进度 | 上传进度
    on-success | 文件上传成功 | 上传成功的文件信息
    on-error | 错误 | 错误信息

6. 示例
```html
<upload @on-progress="onProgress"
        @on-success="onSuccess"
        @on-error="onError"
>
    <i class="el-icon-plus"></i>
</upload>
```

```js
methods: {
    // 上传进度
    onProgress(percent) {
        console.log(percent) // 28
    }
    // 上传成功
    onSuccess(data) {
        console.log(data) 
        // 格式化了一些属性
        //  {  
        //     name: "wendang.docx",
        //     size: 11437,
        //     ext: "docx",
        //     id: 22029,
        //     uuid: "63f93547641043f8ba6548cc9838abd3",

        //     md5: "806c95c1d31ea288cb9860b8af6b5f21",
        //     fileName: "零星物资及工程修缮采购.docx",
        //     extension: "docx",
        //     diskFileName: "disk9d00eaaf41974207942d5928171bc460.docx",
        //     relativePath: "/M00/00/02/disk9d00eaaf41974207942d5928171bc460.docx",
        //     uploadTime: 1530624078576,
        //     sourceUuid: "d84d258e0a8c4f6f9d4dfffaecde0bb4",
        //     isCompress: false,
        //     realUrl: "D:\\yunsoftware\\ngnix\\storage/M00/00/02/disk9d00eaaf41974207942d5928171bc460.docx",
        //     url: "http://192.168.0.201:9091/dfs-neptune/file/IoReadFile?uuid=63f93547641043f8ba6548cc9838abd3"
        // }
    }
    // 上传出错
    onError() {
        console.log(err) // error message
    }
}
```



