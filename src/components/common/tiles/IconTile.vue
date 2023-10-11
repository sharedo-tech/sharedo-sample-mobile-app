<template>
  <component :is="to ? 'router-link' : 'div'" :to="to" class="icon-tile" @click.native="$emit('click')">
    <v-icon class="tile-icon">{{ icon }}</v-icon>
    <div class="icon-label">
      <span class="label-text">{{ label }}</span>
    </div>
  </component>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    to: {
      type: [Object, String],
      required: false,
      default: null
    }
  }
}
</script>
<style scoped lang="scss">
@import "@/css/variables";

.icon-tile {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 150px;
  border: 1px solid $color-grey-light;
  border-radius: 4px;
  margin: 0 4px 4px 4px;
  cursor: pointer;
  text-decoration: none;

  & > .tile-icon {
    font-size: 4rem;
    color: $color-primary;
  }

  & > .icon-label {
    margin-top: 10px;

    & > .label-text {
      font-size: 1.2rem;
      font-weight: bold;
      color: $color-grey-dark;
    }
  }
}
</style>