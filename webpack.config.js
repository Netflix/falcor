module.exports = {
  resolve: {
    alias: {
      // Workaround https://github.com/Reactive-Extensions/RxJS/issues/832, until it's fixed
      rx$: require.resolve("rx/dist/rx")
    }
  }
};
