1. 引入`FileList`组件

    `import { FileList } from '@lcsoft/vue-components-app'`

2. 注册组件
    ```js
    components: {
        FileList
    },
    ```
3. 属性

    属性名 | 说明 | 数据类型 | 默认值
    ---|---|---|---
    action | 获取文件的服务器地址 | String |  `window.SYSTEM_CONFIG.fileApi + '/file/IoReadFile'`
    query | query请求参数(预览、下载) | Object | `{ terminal_type: 'mobile', access_token: token }`
    value | 文件数组 `[{ url, name, size, ext }]` | Array
    edit | 是否可编辑 | Boolean | `false` 
    iconSize | 文件图标大小 | Number | `50`
    rowSize | 图片列数 | Number | `4`
    props | 指定文件数组的键值 | Obejct | `{ ext: 'fileType', name: 'fileTitle', uuid: 'fileUuid', url: 'fileUrl', id: 'id' }`
    previewRouteName | 文件预览路由名字 | String | `PreviewFile`
    previewExts | 支持预览的文件格式 | Array | `['doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xml', 'ppt', 'pptx', 'txt', 'pdf']`

4. 事件

    事件名 | 说明 | 回调参数
    ---|---|---
    on-remove | `edit`为`true`时派发 | 共2个参数：文件对象及其在数组中的索引值

5. 示例
```html

<file-list v-model="files" :icon-size="45" :row-size="6" edit @on-remove="delFile"></file-list>

```

```js
data: {
    return {
        files: [{ url: 'http://ddfddf.docx', name: 'xx.docx', size: 4501, ext: 'docx' }]
    };
},
methods: {
    delFile(file, index) {
        this.files.splice(index, 1)
    }
}
```



