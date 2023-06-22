const handleActionDispatch = function (event) {
  const { action, args } = event.data;
  this.$store.dispatch(action, args);
}

const mixin = {
  created: function () {
    const vm = this;

    new BroadcastChannel("sw-bridge-dispatch-action").onmessage = event => handleActionDispatch.apply(vm, [event]);
  },
}

export default mixin;