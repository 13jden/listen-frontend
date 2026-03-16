import user from "../../api/user";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:[],
    times:3
  },

  listen(){
    wx.navigateTo({
      url: '/pages/pre/pre',
    });
  },

  myTest(){
    wx.navigateTo({
      url: '/pages/myResult/myResult',
    })
  },

  goToAIChat() {
    // 获取最新测试信息
    const user = wx.getStorageSync('user') || {};
    const test = wx.getStorageSync('MyTest') || {};

    let reportId = '';
    let reportDate = '';

    if (test && test.id) {
      reportId = test.id;
      reportDate = user.recentTestDate || '';
    }

    wx.navigateTo({
      url: `/pages/aiChat/aiChat?reportId=${reportId}&reportDate=${encodeURIComponent(reportDate)}`
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const user = wx.getStorageSync('user');
    // user.recentTestDate =  this.formatDate(user.recentTestDate);
    this.setData({ user: user });
    // wx.setStorageSync('user', user);
    console.log(this.data.user);
    
    if (!this.data.user) {
      wx.redirectTo({  // 关闭当前页面，跳转
        url: '/pages/login/login',
        success: () => {
          wx.showToast({
            title: '当前未登录，请先登录',
            icon: 'none'
          });
        },
      });
    }


  },
  
  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}年${month}月${day}日`;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})