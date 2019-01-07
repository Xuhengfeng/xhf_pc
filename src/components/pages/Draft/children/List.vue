<template>
  <div class="wrapContent">
    <!-- 引用@lcsoft/vue-components里面的HeaderBar插件 -->
    <div class="blockTop">
      <header-bar title="我的草稿" :button-list="buttonList"></header-bar>
    </div>
    <div class="mainContent">
      <main class="lc-pt-15">
        <section class="search-bar">
          <div class="search">
            <el-input width="130" class="search-input" size="medium" placeholder="请输入通知主题" suffix-icon="el-icon-search" v-model="params.searchText" clearable @keyup.enter.native="search" @clear="search">
            </el-input>
          </div>
        </section>
        <!-- 主体表格 -->
        <el-table :data="tableData" header-row-class-name="lc-table-header" row-class-name="lc-no-hover" border @selection-change="selectItems">
          <el-table-column align="center" type="selection"></el-table-column>
          <el-table-column align="center" type="index" label="排序" width="60"></el-table-column>
          <el-table-column align="center" label="标题">
            <template slot-scope="scope">
              <span class="lc-color-theme" @click="openDetails(scope.row)" style="cursor:pointer">{{scope.row.noticeName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="发布范围">
            <template slot-scope="scope">
              <span>{{scope.row.noticeStudent ? '学生' : ''}}</span>
              <span>{{scope.row.noticeParent ? '、家长' : ''}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="保存时间">
            <template slot-scope="scope">{{scope.row.createTime | time('yyyy-MM-dd HH:mm:ss')}}</template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="130">
            <template slot-scope="scope">
              <div class="lc-table-button">
                <span class="lc-color-theme" @click="getEdit(scope)">
                  <i class="iconfont icon-edit"></i>编辑</span>
                <span class="lc-color-red" @click="del([scope.row])">
                  <i class="iconfont el-icon-delete"></i>删除</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="lc-pagination-wrap">
          <el-pagination background @current-change="pageChange" :current-page="params.pageNum" @size-change="sizeChange" :page-sizes="[10, 50, 100, params.total]" :page-size="params.pageSize" layout="total,sizes,prev,pager,next,jumper" :total="params.total"></el-pagination>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { storage } from '@lcsoft/utils'
export default {
  data () {
    return {
      buttonList: [
        {
          text: '删除',
          type: 'danger',
          size: 'small',
          icon: 'el-icon-delete',
          callback: this.del
        }
      ],
      // 获取列表参数
      params: {
        pageNum: 1,
        pageSize: 10,
        sortName: null, // 排序
        isAsc: true, // 升序、倒序
        searchText: '',
        sendStatus: 0, // 0草稿 1历史通知
        userId: '', // 用户id
        tenantId: '', // 租户id
        total: 1
      },
      selectedList: [], // 表格已选数据
      tableData: [] // 表格数据
    }
  },
  watch: {
    params: {
      handler () {
        this.getList()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 查看详情
    openDetails (item) {
      this.$router.push({ path: '/Draft/Details',
        query: {
          id: item.id,
          noread: item.notReadUserIdList.join('-'),
          read: item.readUserIdList.join('-')
        }
      })
    },
    // 重新编辑
    getEdit (item) {
      this.$router.push({ path: '/Draft/Edit',
        query: {
          item: item,
          id: item.row.id,
          noread: item.row.notReadUserIdList.join('-'),
          read: item.row.readUserIdList.join('-')
        }
      })
    },
    // 获取表格数据
    getList (pageNum) {
      this._loading(true, '.el-table')
      this.$classAjax.get(this.$URL.classNoticeSendList, this.params).then(res => {
        this.tableData = res.records
        this.params.total = res.total
      }).finally(() => { this._loading(false, '.el-table') })
    },
    // 多选
    selectItems (list) {
      this.selectedList = list
    },
    // 新增
    add () {
      this.$router.push('/PublishNotice/Edit')
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
          this.$classAjax.delete(this.$URL.classNoticeDel, list.map(el => el.id)).then(() => {
            this.$message.success('操作成功')
          }).finally(() => { this.getList() })
        }).catch(() => {
          this.$message.info('操作取消')
        })
      } else {
        this.$message.warning('请选择数据')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.search-bar {
  .search {
    float: left;
    margin-bottom: 15px;
  }
}
.wrapContent {
  .blockTop {
    padding-left: 20px;
    margin-bottom: 10px;
    background: #fff;
  }
  height: 100%;
  .mainContent {
    overflow: auto;
    height: calc(100% - 110px);
    background: #fff;
    padding-left: 20px;
  }
  .blockBottom {
    padding: 10px 0;
    padding-left: 20px;
    text-align: center;
    background: #fff;
  }
}
</style>
