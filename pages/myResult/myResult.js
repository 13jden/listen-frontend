import { getMyTest } from '../../api/test';
import user from '../../api/user';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    testList: [], // 测试列表
    user: null, // 用户信息
    times:0,
    avgScore:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('user');
    this.setData({ user: userInfo });

    // 判断用户是否登录
    if (!userInfo || !userInfo.userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
      });
      wx.redirectTo({
        url: '/pages/login/login', // 跳转到登录页
      });
      return;
    }
    // 获取测试列表
    this.fetchMyTest(userInfo.userId);
  },

  /**
   * 获取我的测试列表
   */
  fetchMyTest(userId) {
    wx.showLoading({
      title: '加载中...',
    });

    getMyTest(userId)
      .then((res) => {
        console.log('获取成功:', res);
        const formattedTestList = res.data.map((item) => {
          const endTime = item.endTime ? new Date(item.endTime) : null;
          const testTime = item.testTime ? new Date(item.testTime) : null;
          const timeDiff = endTime && testTime ? Math.floor((endTime - testTime) / (1000 * 60)) : 0;
          console.log('时间差（分钟）:', timeDiff);
          const formattedStartTime = testTime ? this.formatTime(testTime) : null;
          return {
            ...item,
            time: timeDiff,
            formattedStartTime: formattedStartTime,
          };
        });
        const validItems = formattedTestList.filter(item => item.endTime); // 过滤出 endTime 不为空的项
        const totalScore = validItems.reduce((sum, item) => sum + item.avgScore, 0); // 累加 avgScore
        const avgScore = validItems.length > 0 ? (totalScore / validItems.length).toFixed(1) : 0;
        this.setData({
          avgScore: avgScore
        });
        this.setData({ testList: formattedTestList });
        const times = this.data.testList.length;
        this.setData({
            times
        });
        console.log("次数："+times);
        this.data.user.testTimes = times;
        wx.setStorageSync('user', this.data.user);
      })
      .catch((err) => {
        console.error('获取失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none',
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 格式化时间
   * @param {string} time - 原始时间字符串
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 补足两位
    const day = String(date.getDate()).padStart(2, '0'); // 补足两位
    const hours = String(date.getHours()).padStart(2, '0'); // 补足两位
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 补足两位
    return `${year}年${month}月${day}日${hours}:${minutes}`;
  },

  /**
   * 处理测试项点击事件
   * @param {Event} event - 点击事件对象
   */
  handleTestClick(event) {
    const testId = event.currentTarget.dataset.id; // 获取点击项的 id
    const selectedTest = this.data.testList.find(item => item.id === testId); // 找到对应的测试项
    
    if (!selectedTest) {
      wx.showToast({
        title: '测试项未找到',
        icon: 'none',
      });
      return;
    }

    // 判断 item.time 是否为空
    if (selectedTest.endTime) {
      // 如果 item.time 不为空，跳转到 result 页面
      wx.setStorageSync('score', selectedTest.avgScore);
      wx.navigateTo({
        url: `/pages/result/result?testId=${testId}`,
      });
    } else {
      // 如果 item.time 为空，弹出提示框
      wx.showModal({
        title: '提示',
        content: '是否继续测试？',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: `/pages/listen/listen?`,
            });
          } else if (res.cancel) {
            // 用户点击“取消”，不执行任何操作
            console.log('用户取消继续测试');
          }
        },
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    const userId = this.data.user?.userId;
    if (userId) {
      this.fetchMyTest(userId);
    }
    wx.stopPullDownRefresh(); // 停止下拉刷新动画
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉加载更多逻辑（如果有分页）
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的测试列表',
      path: '/pages/test/test', // 分享路径
    };
  },
});