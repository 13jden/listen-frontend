App({
  onLaunch: function () {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    wx.cloud.init({
      env: '', // 这里填写你的云环境ID
    });
    // 可以在这里添加其他初始化逻辑
  },

  onShow: function (options) {
    // 当小程序从后台进入前台时会触发
  },

  onHide: function () {
    // 当小程序进入后台时会触发
  },

  onError: function (msg) {
    // 当小程序发生错误时会触发
    console.error(msg); // 可选：打印错误信息
  }
});
