<template>
  <div class="wrapContent">
    <div class="blockTop">
      <header-bar title="发布通知"></header-bar>
    </div>
    <div class="mainContent">
      <main>
        <el-form ref="ruleForm" :rules="rules" :model="form" label-width="120px" size="small">
          <el-form-item label="通知主题：" prop="noticeName">
            <el-input v-model="form.noticeName" clearable placeholder="请输入通知主题"></el-input>
          </el-form-item>
          <el-form-item label="通知内容：" prop="noticeContent">
            <vue-ueditor-wrap style="line-height: 20px;" ref="ueditor" :init="myInit" v-model="form.noticeContent" :config="UeditorConfig"></vue-ueditor-wrap>
          </el-form-item>
          <el-form-item label="添加附件">
            <div class="customize-item">
              <upload progress label-width="105px" @on-success="uploadSuccess" @on-error="uploadError"></upload>
              <file-list edit :icon-size="40" :image-size="80" v-model="attachments" :props="{}"></file-list>
            </div>
          </el-form-item>
          <el-form-item label="发布范围: ">
            <el-checkbox v-for="(person,index) in form.persons" v-model="person.checked" :key="index">{{person.name+'('+person.count+'人)'}}</el-checkbox>
          </el-form-item>
          <!-- 添加人员 -->
          <el-form-item label="">
            <div class="customize-item">
              <!-- 学生 -->
              <avatar :closable="true" v-for="(item, index) in approver" :key="index" @close="splitItem(item,index)" :name="item.studentName"></avatar>
              <!-- 家长 -->
              <avatar :closable="true" v-for="item in parent" :key="item.parentId" @close="splitParentItem(item,index)" :name="item.parentName"></avatar>
              <add-person ref="addCheckPerson" v-model="approver" v-show="true"></add-person>
            </div>
          </el-form-item>
        </el-form>
      </main>
    </div>

    <div class="blockBottom">
      <el-button style="padding:10px 20px;" @click="submitForm('save')">保存草稿</el-button>
      <el-button type="primary" :disabled="disabled" style="margin-left:5%;padding:10px 20px;" @click="submitForm('send')">正式发布</el-button>
    </div>

  </div>
</template>

<script>
import { storage } from '@lcsoft/utils'
import { VueUeditorWrap } from '@lcsoft/vue-components'
import AddPerson from 'base/add-person'
import uploadFile from '@/mixin/upload-file'
export default {
  mixins: [uploadFile],
  components: { VueUeditorWrap, AddPerson },
  data () {
    return {
      approver: [], // 学生
      parent: [], // 家长
      attachments: [], // 附件
      disabled: false,
      InformTypeSelect: [], // 通知类型列表
      RoleSelect: [], // 角色下拉列表
      // 双向绑定表单参数
      form: {
        checkedPerson: ['学生', '家长'],
        noticeContent: '', // 通知内容
        noticeName: null, // 通知主题
        persons: [ // 范围
          { name: '学生', count: 0, checked: true },
          { name: '家长', count: 0, checked: true }
        ]
      },
      // 提交接口
      params: {
        arg1: 0, // 学生人数
        arg2: 0, // 家长人数
        id: '',
        noticeContent: '', // 通知内容
        noticeFileList: [ // 附件
          {
            'fileTitle': '',
            'fileType': '',
            'fileUrl': '',
            'fileUuid': ''
          }
        ],
        parentIdList: [],
        noticeName: 'string', // 通知主题
        noticeStudent: 1, // 是否通知学生
        noticeParent: 1, // 是否通知家长
        sendStatus: null, // 0草稿  1发布
        userIdList: [] // 学生id
      },
      // 表单验证
      rules: {
        noticeName: [{ required: true, message: '请输入通知主题（格式为非空格的任何字符）', trigger: 'blur', pattern: /^[\s\S]*.*[^\s][\s\S]*$/ }],
        noticeContent: [{ required: true, message: '请填写通知内容', trigger: 'blur' }]
      },
      // 百度编辑器配置
      UeditorConfig: {
        autoHeightEnabled: false,
        serverUrl: `${window.SYSTEM_CONFIG.fileApi}/file/ueditor?access_token=${storage.get('token')}&terminal_type=pc`,
        toolbars: [
          [
            'fullscreen', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch',
            'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|', 'rowspacingtop',
            'rowspacingbottom', 'lineheight', '|', 'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|', 'directionalityltr', 'directionalityrtl', 'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|', 'link', 'unlink', 'anchor', '|',
            'imagenone', 'imageleft', 'imageright', 'imagecenter', '|', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'insertframe', 'insertcode',
            'pagebreak', 'template', '|', 'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|', 'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow',
            'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|', 'print', 'preview', 'searchreplace'
          ]
        ],
        elementPathEnabled: false,
        zIndex: 100,
        initialFrameWidth: '100%',
        initialFrameHeight: 200,
        enableAutoSave: true,
        saveInterval: 100
      },
      // 当前班级
      currentClass: {},
      // 班级学生
      classStudent: []
    }
  },
  watch: {
    // 具体学生
    approver (value) {
      if (value.length) {
        this.form.persons[0].count = value.length
        this.getParentList(value)
      } else {
        this.form.persons[0].count = 0
      }
    },
    $route: {
      handler (value) {
        let item = value.query
        item.id && this.getFormData(item)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 删除添加的学生
    splitItem (item) {
      let tagIndex = this.approver.findIndex(el => el.userId === item.userId)
      this.approver.splice(tagIndex, 1)
    },
    // 删除添加的父母
    splitParentItem (item) {
      let tagIndex = this.parent.findIndex(el => el.userId === item.userId)
      this.parent.splice(tagIndex, 1)
      this.form.persons[1].count = this.parent.length
    },
    // 获取家长列表
    getParentList (value) {
      this.$classAjax.post(this.$URL.classNoticeListStudentParent, value.map(el => el.studentId)).then(res => {
        if (res != null && res.length) {
          this.form.persons[1].count = res.length
          res.forEach((el, index) => {
            if (!this.parent.includes(el)) {
              this.parent.push(el)
            }
          })
        } else {
          this.form.persons[1].count = 0
        }
      })
    },
    // 富文本编辑器
    myInit () {
      this.$refs.ueditor.registerButton({
        name: 'center',
        icon: './static/center.png',
        tip: '表格居中',
        handler: (editor, name) => {
          var tables = editor.document.querySelectorAll('table')
          if (tables.length) {
            tables.forEach((table) => {
              table.style.margin = '0 auto'
            })
          } else {
            editor.trigger('showmessage', {
              content: '没有表格',
              timeout: 2000
            })
          }
        }
      })
    },
    // 根据ID获取单个通知详情
    getFormData (item) {
      var params = {
        notReadUserIdList: item.noread.split('-'),
        readUserIdList: item.read.split('-'),
        id: item.id
      }
      this.$classAjax.post(this.$URL.classNoticeDetail, params).then(res => {
        this.attachments = res.noticeFileList
      })
    },
    // 提交
    submitForm (type) {
      this.params = {
        arg1: this.form.persons[0].count, // 学生人数
        arg2: this.form.persons[1].count, // 家长人数
        id: '',
        noticeContent: this.form.noticeContent, // 通知内容
        noticeFileList: this.attachments.map(el => {
          return {
            'fileTitle': el.name,
            'fileType': el.ext,
            'fileUrl': el.url,
            'fileUuid': el.uuid
          }
        }),
        parentIdList: [],
        noticeName: this.form.noticeName, // 通知主题
        noticeStudent: Number(this.form.persons[0].checked), // 是否通知学生
        noticeParent: Number(this.form.persons[1].checked), // 是否通知家长
        sendStatus: null, // 0草稿  1发布
        userIdList: this.approver.map(el => el.studentId) // 学生id
      }
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          if (type === 'send') {
            this.$confirm('此操作将发送通知到已选人员，发送后将不能进行任何操作，是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.params.sendStatus = 1
              this.submit()
            }).catch(() => {
              this.$message.info('操作取消')
            })
          } else if (type === 'save') {
            this.params.sendStatus = 0
            this.submit()
          }
        } else {
          return false
        }
      })
    },
    // 发布班级通知
    submit () {
      this.disabled = true
      this.$classAjax.post(this.$URL.classNoticeAdd, this.params).then(res => {
        if (this.params.sendStatus === 0) {
          this.$router.push('/Draft/List')
        } else {
          this.disabled = false
          this.$router.push('/InformList/List')
          this.$message.success('提交成功')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
main {
  padding: 50px 10% 0;
}
.wrap {
  @include flex(row, space-between, flex-start);
  .tree-wrap {
    width: 230px;
    max-height: 400px;
    box-sizing: border-box;
    padding: 10px;
    overflow: auto;
    @include scrollbar(6px);
    .el-tree {
      min-width: fit-content;
    }
  }
  .table-wrap {
    width: calc(100% - 250px);
    .teacher_name {
      cursor: pointer;
    }
  }
}
.customize-item {
  line-height: normal;
  .org-tree {
    margin-bottom: 10px;
  }
  .avatar {
    margin: 0 10px 10px 0;
  }
}
</style>
