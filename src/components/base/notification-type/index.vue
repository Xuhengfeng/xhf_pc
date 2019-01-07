<template>
  <div>
    <!-- 引用@lcsoft/vue-components里面的HeaderBar插件 -->
    <header-bar :title="typeName" :button-list="buttonList"></header-bar>
    <main class="lc-pt-15">
      <!-- 主体表格 -->
      <el-table :data="tableData" header-row-class-name="lc-table-header" row-class-name="lc-no-hover" border @selection-change="selectItems">
        <el-table-column align="center" type="selection"></el-table-column>
        <el-table-column align="center" prop="no" label="序号" width="60"></el-table-column>
        <el-table-column align="center" prop="name" :label="typeName + '名称'"></el-table-column>
        <el-table-column align="center" label="操作" width="130">
          <template slot-scope="scope">
            <div class="lc-table-button">
              <span class="lc-color-theme" @click="showDialog(scope.row)">
                <i class="iconfont icon-edit"></i>编辑</span>
              <span class="lc-color-red" @click="del([scope.row])">
                <i class="iconfont el-icon-delete"></i>删除</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </main>
    <footer>
      <!-- 引用@lcsoft/vue-components里面的DialogBox插件 -->
      <!-- 新增和编辑弹框：title动态加载 -->
      <dialog-box ref="dialog" v-model="show" :title="title" width="480px" :autoClose="false" @cancel="show=false" @confirm="confirm">
        <div slot="body" class="lc-p-30">
          <el-form size="small" ref="form" :model="formData" :rules="rules" :validate-on-rule-change="false" label-width="60px">
            <el-form-item label="排序:" prop="no">
              <el-input type="number" placeholder="请输入序号" min="0" v-model="formData.no"></el-input>
            </el-form-item>
            <el-form-item label="名称:" prop="name">
              <el-input v-model="formData.name" placeholder="请输入名称" maxlength="30"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </dialog-box>
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    // 数据字典类型
    type: {
      type: String,
      default: ''
    },
    // 数据字典类型汉字
    typeName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 弹窗是否显示
      show: false,
      // 弹窗标题
      title: '新增',
      // HeaderBar右侧按钮
      buttonList: [
        {
          text: '新增',
          type: 'primary',
          size: 'small',
          icon: 'el-icon-plus',
          callback: this.showDialog
        },
        {
          text: '批量删除',
          type: 'danger',
          size: 'small',
          icon: 'el-icon-delete',
          callback: this.del
        }
      ],
      // 表格数据
      tableData: [],
      // 弹框表单
      formData: {
        no: '',
        name: ''
      },
      // 表单验证
      rules: {
        no: [{ required: true, message: '请输入序号（格式为大于0的数字）', trigger: 'blur', pattern: /^[0-9]*$/ }],
        name: [{ required: true, message: '请输入名称（格式为非空格的任何字符）', trigger: 'blur', pattern: /^[\s\S]*.*[^\s][\s\S]*$/ }]
      },
      // 表格已选数据
      selectedList: []
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    // 获取表格数据
    getList () {
      this._loading(true, '.el-table')
      this.$notificationAjax.get('/notificationParam/list', { type: this.type }).then((res) => {
        this.tableData = res.sort((a, b) => a.no - b.no)
      }).finally(() => { this._loading(false, '.el-table') })
    },
    // 添加和编辑,显示弹框，对弹框表单赋值和初始化
    showDialog (row) {
      this.show = true
      this.formData.type = this.type
      if (row) {
        this.title = '编辑'
        this.formData.no = row.no
        this.formData.name = row.name
        this.formData.id = row.id
      } else {
        this.title = '新增'
        this.formData.id = null
      }
    },
    // 提交
    confirm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formData.type = this.type
          this.$notificationAjax.post('/notificationParam/add-or-update', this.formData).then(res => {
            this.$message.success('操作成功')
            this.show = false
          }).finally(() => { this.getList() })
        }
      })
    },
    // 多选
    selectItems (list) {
      this.selectedList = list
    },
    // 删除
    del (list) {
      if (list === undefined) {
        list = this.selectedList
      }
      if (list.length) {
        this.$confirm('此操作将永久删除该数据,继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$notificationAjax.post('/notificationParam/batch-delete', list.map((item) => item.id)).then(() => {
            this.$message.success('操作成功')
          }).finally(() => { this.getList() })
        }).catch(() => {
          this.$message.info('操作取消')
        })
      } else {
        this.$message.warning('请选择数据')
        return false
      }
    }
  },
  watch: {
    show (show) {
      if (!show) {
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>
