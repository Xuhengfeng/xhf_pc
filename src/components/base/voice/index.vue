<template>
  <div class="voice">
    <audio :src="voice" controls></audio>
  </div>
</template>
<script>
export default {
  props: ['voice']
}
</script>
<style lang="scss" scoped>
</style>
