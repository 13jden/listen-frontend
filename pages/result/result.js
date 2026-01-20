import { getTestDetail } from '../../api/test';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    test: [],
    questions: [],
    score:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const testId = options.testId;
    if (testId == null) {
      const test = wx.getStorageSync('MyTest');
      const user = wx.getStorageSync('user');
      user.score = test.avgScore;
      user.recentTestDate =  this.formatDate(test.endTime);
      const score = test.avgScore;
      this.getDetail(test.id);
      this.setData({
        score: score
      });
      wx.setStorageSync('user', user);
      // 查找 index 页面实例
    const pages = getCurrentPages();
    pages.forEach(page => console.log(page.route));
    const indexPage = pages.find((page) => page.route === 'pages/index/index');
    const homePage = pages.find((page) => page.route === 'pages/home/home');
    if (indexPage) {
      // 更新 index 页面的数据
      console.log("更新index");
      indexPage.setData({ user: user });
    }
    if(homePage){
      console.log("更新home");
      homePage.setData({ date: user.recentTestDate });
    }

    } else {
      const score = wx.getStorageSync('score');
      this.setData({
        score: score
      });
      console.log(this.data.score);
      // 如果 testId 不为空，则调用 getDetail 方法获取数据
      this.getDetail(testId);
    }
  },

  /**
   * 获取测试详情
   */
  getDetail(testId) {
    getTestDetail(testId).then(res => {
      console.log(res);
      if (res.code==1) {
        this.setData({
          test: wx.getStorageSync('MyTest'),
          questions: res.data
        });
        wx.setStorageSync('questionsResult', this.data.questions);
      } else {
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取数据失败', err);
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    });
  },
  formatDate(dateString) {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}年${month}月${day}日`;
  },
  navigateToQuestion(event) {
    // 获取点击的 item.index
    const index = event.currentTarget.dataset.index;
    console.log(index);
    // 跳转到 question 页面，并传递 index 参数
    wx.navigateTo({
      url: `/pages/queastion/queastion?index=${index}`
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
});