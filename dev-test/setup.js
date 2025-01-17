process.on('unhandledRejection', (err) => {
  // Using global fail() from Jest
  globalThis.fail?.(err);
});
