<template>
  <div class="avatar">
    <div class="pic" :style="{'background-image': avatarPic ||''}">
      <i class="el-icon-close" :style="{'background-image': pic}" @click="close" v-show="closable"></i>
      <div class="picText">{{name.slice(1)}}</div>
    </div>
    <div class="name">{{name}}</div>
  </div>
</template>

<script>
export default {
  props: {
    closable: Boolean,
    name: String,
    pic: String,
    avatarPic: String
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  display: inline-block;
  position: relative;
  margin-right: 10px;
  .pic {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 0 auto 12px;
    background-color: #e7e7e7;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    .picText {
      text-align: center;
      line-height: 50px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .el-icon-close {
      position: absolute;
      top: -8px;
      right: -8px;
      padding: 3px;
      border-radius: 50%;
      background-color: rgba(188, 188, 188, 0.8);
      text-align: center;
      font-weight: bold;
      color: #fff;
      cursor: pointer;
      &:hover {
        background-color: rgba(188, 188, 188, 1);
      }
    }
  }
  .name {
    color: $color-333;
    width: 50px;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
