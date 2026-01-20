Page({
  data: {
    hospital: "北京协和医院", // 医院名称
    medicalRecordNumber: "202310123456", // 病历号
    name: "张三", // 姓名
    phone: "138****5678", // 手机号（隐藏中间四位）
    date: "",
    times: 0,
    score: 0,
    hidden: true,
    animationData: {}
  },

  
  onLoad() {
    // 首次加载时执行的逻辑
    const userInfo = wx.getStorageSync('user');
    if (userInfo) {
      this.setData({
        hospital: userInfo.hospital,
        medicalRecordNumber: userInfo.medicalId,
        name: userInfo.name,
        phone: this.formatPhoneNumber(userInfo.number), // 格式化手机号
      });
    }
  },

  onShow() {
    // 每次页面显示时执行的逻辑
    const userInfo = wx.getStorageSync('user');
    if (userInfo) {
      this.setData({
        score: userInfo.score,
        times: userInfo.testTimes,
        date: userInfo.recentTestDate,
      });
    }
  },
  toggleExpand() {
    let that = this;
    let isExpanded = this.data.isExpanded;
    
    // 创建动画
    let animation = wx.createAnimation({
      duration: 300, // 动画时长（ms）
      timingFunction: "ease-in-out", // 缓动函数
    });

    if (isExpanded) {
      animation.height(0).opacity(0).step(); // 先折叠
    } else {
      animation.height("auto").opacity(1).step(); // 展开
    }

    this.setData({
      isExpanded: !isExpanded,
      animationData: animation.export(),
    });
  },
  myTest() {
    const userInfo = wx.getStorageSync('user');
    if (userInfo) {
      this.setData({
        score: userInfo.score,
        times: userInfo.testTimes,
        date: userInfo.recentTestDate,
      });
    }
    wx.navigateTo({
      url: '/pages/myResult/myResult',
    });
  },

  // 格式化手机号（隐藏中间四位）
  formatPhoneNumber(phone) {
    if (phone && phone.length === 11) {
      return phone.substring(0, 3) + '****' + phone.substring(7);
    }
    return phone;
  },
});