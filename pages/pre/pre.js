Page({
  data: {
    isAgreed: false
  },
  onLoad(){
    // const questions=wx.getStorageSync('questions');
    // if(questions){
    //   wx.redirectTo({
    //     url: '/pages/listen/listen'
    //   });
    // }
  },
  onAgreementChange(e) {
    this.setData({
      isAgreed: e.detail.value.length > 0
    });
  },

  startTest() {
    if (this.data.isAgreed) {
      wx.showToast({
        title: '测试即将开始',
        icon: 'success'
      });
      // 这里可以跳转到测试页面
      wx.redirectTo({
        url: '/pages/listen/listen'
      });
    } else {
      wx.showToast({
        title: '请先同意隐私协议',
        icon: 'none'
      });
    }
  }
});
