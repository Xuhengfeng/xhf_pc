<template>
  <div class="org-tree" style="display:inline-block;vertical-align:top">
    <!-- 已选列表 -->
    <section class="selected-persons" v-if="mode === 0 || mode === 2">
      <el-button style="color: #999;border-color:#999" circle @click="showDialog = true">
        <i class="el-icon-plus" style="font-weight:bold;font-size:24px"></i>
      </el-button>
      <div class="lc-mt-12 lc-color-999">添加人员</div>
    </section>
    <!-- 选人弹窗 -->
    <div class="mask" v-show="showDialog"></div>
    <transition name="dialog-fade">
      <div class="dialog-wrap" v-show="showDialog">
        <div class="dialog">
          <!-- 弹窗头部 -->
          <header slot="title" class="dialog-header">
            <span>{{title}}</span>
            <i class="el-icon-close" @click="cancel"></i>
          </header>
          <!-- 弹窗body -->
          <section class="dialog-body">
            <!-- 上插槽 -->
            <slot name="before-body"></slot>
            <!-- 弹窗body -->
            <div class="add-person">
              <!-- 搜索条 -->
              <section class="search-bar">
                <div class="search">
                  <el-input class="search-input" size="medium" placeholder="查询" suffix-icon="el-icon-search" v-model="searchText" clearable>
                  </el-input>
                </div>
                <div class="selectNum" v-text="`已选${totalCount}人`"></div>
              </section>
              <!-- 主区域 -->
              <section class="main-wrap">
                <!-- 表格 -->
                <div class="table-wrap">
                  <el-table ref="multipleTable" :data="tableData" row-key="studentId" v-loading="loadingTable" header-row-class-name="lc-table-header" row-class-name="lc-no-hover" height="100%" border @selection-change="selectItems">
                    <el-table-column align="center" reserve-selection type="selection"></el-table-column>
                    <el-table-column align="center" prop="studentName" label="姓名" show-overflow-tooltip></el-table-column>
                    <el-table-column align="center" prop="sex" label="性别" show-overflow-tooltip></el-table-column>
                    <el-table-column align="center" prop="studentCode" label="学号" show-overflow-tooltip></el-table-column>
                  </el-table>
                </div>
              </section>
            </div>
            <!-- 下插槽 -->
            <slot name="after-body"></slot>
          </section>
          <!-- 弹窗footer -->
          <footer slot="footer" class="dialog-footer">
            <el-button size="medium" type="primary" @click="confirm">确定</el-button>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
// import { mapState, mapActions } from 'vuex'
import avatar from './avatar.png'
export default {
  props: {
    /**
     * 0 默认模式: 即显示已选人员,也显示选人弹窗
     * 1 弹窗模式: 只显示选人弹窗,支持slot,通常该模式下确认按钮需要结合业务做一些判断,需通过$refs手动关闭
     * 2 只读模式: 只显示人员头像名称列表,通常用于只读情景下
     */
    mode: {
      type: Number,
      default: 0
    },
    // 是否禁用新增
    canAddPerson: {
      type: Boolean,
      default: true
    },
    // 选人弹窗标题
    title: {
      type: String,
      default: '添加人员'
    },
    // v-model语法糖
    value: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      showDialog: false,
      searchText: '',
      selectedPersons: [],
      defaultProps: {
        label: 'deptName',
        children: 'children'
      },
      loadingTable: false,
      tableData: [],
      totalCount: 0, // 选中的总人数
      curNode: {},
      avatar
    }
  },
  watch: {
    searchText: {
      handler (value) {
        this.getStudentList()
      },
      immediate: true
    },
    showDialog () {
      if (this.showDialog) {
        // 清空全部打勾
        this.tableData.forEach((el, index) => {
          this.$refs.multipleTable.toggleRowSelection(this.tableData[index], false)
        })
        // 选中的打勾
        this.value.forEach(item => {
          var tagIndex = this.tableData.findIndex(el => item.studentId === el.studentId)
          this.$refs.multipleTable.toggleRowSelection(this.tableData[tagIndex], true)
        })
      }
    }
  },
  methods: {
    // 获取学生列表
    getStudentList () {
      this.loadingTable = true
      this.$classAjax.get(this.$URL.classNoticeListClass).then(res => {
        this.currentClass = res[0]
        // 当前班级学生接口参数
        var params = {
          classId: this.currentClass.classId,
          className: this.currentClass.className,
          bindClassStatus: 1,
          searchText: this.searchText
        }
        this.$classAjax.get(this.$URL.classNoticeListStudent, params).then(res => {
          this.loadingTable = false
          this.tableData = res
        })
      })
    },
    // 默认勾选的
    defaultSelect () {
      this.selectedPersons.forEach(el => {
        var tagIndex = this.tableData.findIndex(item => item.studentCode === el.studentCode)
        this.$refs.multipleTable.toggleRowSelection(this.tableData[tagIndex], true)
      })
    },
    // 选择人员
    selectItems (list) {
      this.selectedPersons = list
      this.totalCount = list.length
    },
    // 确认选择
    confirm () {
      if (this.mode === 1) {
        this.$emit('confirm')
      } else {
        this.$emit('input', this.selectedPersons)
        this.showDialog = false
      }
    },
    // 取消选择
    cancel () {
      this.showDialog = false
      this.$emit('input', this.selectedPersons)
    }
  }
}
</script>

<style lang="scss" scoped>
.selected-persons {
  width: 100%;
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    li {
      width: 50px;
      height: 80px;
      margin: 0 5px 5px 0;
      > div:nth-of-type(1) {
        width: 50px;
        height: 50px;
        img {
          width: 100%;
          height: 100%;
          display: block;
          border-radius: 50%;
          border: none;
        }
      }
      > div:nth-of-type(2) {
        height: 30px;
        line-height: 30px;
        text-align: center;
      }
      &.add-icon {
        cursor: pointer;
        > div {
          border: 1px solid #cccccc;
          border-radius: 50%;
          position: relative;
          &::before,
          &::after {
            content: "";
            display: block;
            background: #cccccc;
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 2px;
            transform: translate(-50%, -50%);
          }
          &::before {
            width: 60%;
            height: 1px;
          }
          &::after {
            height: 60%;
            width: 1px;
          }
        }
      }
    }
  }
}

.dialog-fade-enter-active {
  animation: dialog-fade-in 0.3s;
}

.dialog-fade-leave-active {
  animation: dialog-fade-out 0.3s;
}

@keyframes dialog-fade-in {
  0% {
    transform: translate3d(-50%, -20px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(-50%, 0, 0);
    opacity: 1;
  }
}

@keyframes dialog-fade-out {
  0% {
    transform: translate3d(-50%, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(-50%, -20px, 0);
    opacity: 0;
  }
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #333333;
  opacity: 0.5;
  z-index: 2000;
}

.dialog-wrap {
  position: fixed;
  top: 100px;
  left: 50%;
  bottom: 100px;
  transform: translate3d(-50%, 0, 0);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2001;
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: #fff;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #4e97d9;
    border-radius: 2em;
  }
  .dialog {
    width: 800px;
    box-sizing: border-box;
    background: #ffffff;
    .dialog-header {
      height: 60px;
      line-height: 60px;
      padding: 0 20px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      > span {
        font-size: 16px;
        color: #4e97d9;
        margin-right: 20px;
      }
      > i {
        font-size: 24px;
        color: #999;
        cursor: pointer;
        &:hover {
          color: #4e97d9;
        }
      }
    }
    .dialog-body {
      width: 100%;
      .add-person {
        padding: 0 20px;
        .tag-list {
          padding: 5px 0;
          display: flex;
          justify-content: space-between;
          .label {
            width: 60px;
          }
          .items {
            width: calc(100% - 70px);
            max-height: 80px;
            overflow: auto;
            @include scrollbar(6px);
          }
          .label,
          .items {
            user-select: none;
            .el-tag {
              margin: 2px;
            }
          }
        }
        .search-bar {
          height: 36px;
          line-height: 36px;
          padding: 10px 0;
          display: flex;
          justify-content: flex-start;
          .tab {
            height: 36px;
            line-height: 36px;
            list-style: none;
            padding: 0;
            margin: 0;
            width: 200px;
            box-sizing: border-box;
            li {
              width: 180px;
              height: 36px;
              float: left;
              cursor: pointer;
              border: 1px solid #bfcbd9;
              text-align: center;
              color: #4e97d9;
              box-sizing: border-box;
              border-radius: 5px;
              //   &:nth-of-type(1) {
              //     border-radius: 5px 0 0 5px;
              //   }
              //   &:nth-of-type(2) {
              //     border-radius: 0 5px 5px 0;
              //   }
              &.active {
                background: #4e97d9;
                color: #ffffff;
                border-color: #4e97d9;
              }
            }
          }
        }
        .main-wrap {
          display: flex;
          justify-content: flex-start;
          width: 760px;
          .tree-wrap {
            width: 180px;
            height: 400px;
            overflow: auto;
            user-select: none;
            .el-tree {
              min-width: fit-content;
            }
            &::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            &::-webkit-scrollbar-track {
              background-color: #e1e1e1;
              border-radius: 2em;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #4e97d9;
              border-radius: 2em;
            }
          }
          .table-wrap {
            position: relative;
            height: 340px;
            width: 100%;
            padding-bottom: 40px;
            .el-pagination {
              position: absolute;
              left: 50%;
              bottom: 4px;
              transform: translateX(-50%);
            }
          }
        }
      }
    }
    .dialog-footer {
      height: 60px;
      line-height: 36px;
      padding: 12px 20px;
      box-sizing: border-box;
      border-top: 1px solid #e4e7ed;
      display: flex;
      justify-content: center;
      button {
        padding: 10px 74px;
        margin-right: 5px;
      }
    }
  }
}
.selectNum {
  position: absolute;
  right: 20px;
  color: #4e97d9;
}
</style>
