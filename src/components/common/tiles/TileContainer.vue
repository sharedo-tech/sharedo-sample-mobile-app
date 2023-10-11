<template>
  <div class="tile-container">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.tile-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
</style>