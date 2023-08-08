<template>
  <div class="selector-container">
    <v-select label="Time code" v-model="selection" v-bind:items="codes" item-text="name" item-value="id" single-line
      :error="error" />
    <segment-selector v-if="recurse" :value="value" :codes="subCodes" :error="error"
      @input="(value) => $emit('input', value)" />
  </div>
</template>
<script>
export default {
  name: "SegmentSelector",
  props: {
    value: {
      type: String,
    },
    codes: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: function () {
    return {
      localSelection: "",
    };
  },
  computed: {
    selection: {
      get: function () {
        return this.localSelection;
      },
      set: function (value) {
        this.localSelection = value;

        const selected = this.codes.find((code) => code.id === value);

        if (
          !selected ||
          (selected.children && selected.children.length > 0)
        ) {
          this.$emit("input", null);
        } else {
          this.$emit("input", selected.id);
        }
      },
    },
    subCodes: function () {
      const selected = this.codes.find(
        (code) => code.id === this.localSelection
      );
      if (selected && selected.children) {
        return selected.children;
      }

      return [];
    },
    recurse: function () {
      const selected = this.codes.find(
        (code) => code.id === this.selection
      );

      return (
        selected && selected.children && selected.children.length > 0
      );
    },
  },
  mounted: function () {
    const vm = this;

    const walkSubTree = (timeCode, selectedId, currentPath = []) => {
      if (timeCode.id === selectedId) {
        return [...currentPath, timeCode.id];
      }

      if (timeCode.children && timeCode.children.length > 0) {
        for (let i = 0; i < timeCode.children.length; i++) {
          const path = walkSubTree(timeCode.children[i], selectedId, [
            ...currentPath,
            timeCode.id,
          ]);

          if (path.length > 0) {
            return path;
          }
        }
      }

      return [];
    };

    if (vm.value) {
      vm.codes.forEach((timeCode) => {
        const path = walkSubTree(timeCode, vm.value);

        if (path.length > 0) {
          const code = vm.codes.find(c => path.includes(c.id));

          if (code) {
            this.localSelection = code.id;
          }
        }
      });
    }
  },
};
</script>
<style lang="scss" scoped>
.selector-container {
  width: 100%;
}
</style>