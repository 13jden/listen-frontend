const app = getApp();

Page({
  data: {
    type: '', // 'overall' 表示总体报告
    reportId: null, // 报告ID
    latestTest: {
      date: '2026年3月15日',
      score: 85,
      level: '优良',
      levelClass: 'level-good',
      correctCount: 17,
      totalCount: 20,
      duration: '8分钟'
    },
    testCount: 6,
    avgScore: 85,
    trend: 'up',
    testHistory: [], // 测试历史数据
    problemAnalysis: [
      {
        questionIndex: 3,
        question: '以下哪种说法正确？',
        userAnswer: 'A',
        correctAnswer: 'B',
        reason: '这道题考查对高频声音的识别能力，您在4000Hz频段存在轻微困难。'
      },
      {
        questionIndex: 7,
        question: '关于耳鸣的说法？',
        userAnswer: 'C',
        correctAnswer: 'A',
        reason: '耳鸣可能是听力下降的早期信号，建议关注。'
      }
    ],
    healthAdvices: [
      '建议每半年进行一次听力检查，及时发现问题',
      '避免长时间使用耳机，音量不超过60%',
      '保持耳道清洁，但不要过度清理',
      '控制血压血糖，保持心血管健康',
      '出现耳鸣或听力下降及时就医'
    ]
  },

  onLoad(options) {
    this.setData({ type: options.type || '' });

    const testId = options.testId;
    if (testId) {
      this.setData({ reportId: testId });
      this.fetchReportData(testId);
    } else if (options.type === 'overall') {
      // 总体报告模式
      this.loadOverallReport();
    } else {
      this.loadLatestReport();
    }
  },

  onShow() {
    // 延迟一点绘制，确保页面渲染完成
    setTimeout(() => {
      this.drawTrendChart();
    }, 300);
  },

  loadOverallReport() {
    const userInfo = wx.getStorageSync('user');
    if (!userInfo || !userInfo.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 模拟测试历史数据
    const testHistory = [
      { testNum: 1, score: 75, date: '2026-01-15' },
      { testNum: 2, score: 78, date: '2026-02-01' },
      { testNum: 3, score: 82, date: '2026-02-15' },
      { testNum: 4, score: 80, date: '2026-03-01' },
      { testNum: 5, score: 85, date: '2026-03-10' },
      { testNum: 6, score: 88, date: '2026-03-15' }
    ];

    const totalScore = testHistory.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / testHistory.length);

    // 判断趋势
    const firstHalf = testHistory.slice(0, 3).reduce((sum, item) => sum + item.score, 0) / 3;
    const secondHalf = testHistory.slice(3).reduce((sum, item) => sum + item.score, 0) / 3;
    let trend = 'stable';
    if (secondHalf > firstHalf + 3) {
      trend = 'up';
    } else if (secondHalf < firstHalf - 3) {
      trend = 'down';
    }

    this.setData({
      testCount: testHistory.length,
      avgScore: avgScore,
      trend: trend,
      testHistory: testHistory
    }, () => {
      this.drawTrendChart();
    });
  },

  loadLatestReport() {
    const userInfo = wx.getStorageSync('user');
    if (!userInfo || !userInfo.userId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
  },

  fetchReportData(testId) {
    wx.showLoading({ title: '加载中...' });
    this.setData({ reportId: testId });
    setTimeout(() => {
      this.setData({
        latestTest: {
          date: '2026年3月15日',
          score: 85,
          level: '优良',
          levelClass: 'level-good',
          correctCount: 17,
          totalCount: 20,
          duration: '8分钟'
        },
        testCount: 6,
        trend: 'up'
      });
      this.drawTrendChart();
      wx.hideLoading();
    }, 500);
  },

  /**
   * 一键咨询 - 跳转到AI客服
   */
  goToConsult() {
    const reportId = this.data.reportId || 'overall';
    wx.navigateTo({
      url: `/pages/aiChat/aiChat?reportId=${reportId}&reportDate=${encodeURIComponent(this.data.latestTest.date)}`
    });
  },

  drawTrendChart() {
    const ctx = wx.createCanvasContext('trendCanvas', this);
    const systemInfo = wx.getSystemInfoSync();
    const canvasWidth = systemInfo.windowWidth - 48; // 24rpx * 2 = 48rpx = 24px
    const width = canvasWidth;
    const height = 200;
    const padding = 30;

    // 使用实际数据或模拟数据
    let scores = [75, 78, 82, 80, 85, 88];
    let labels = ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次'];

    if (this.data.testHistory && this.data.testHistory.length > 0) {
      scores = this.data.testHistory.map(item => item.score);
      labels = this.data.testHistory.map((item, index) => `第${index + 1}次`);
    }

    const maxScore = 100;
    const minScore = 60;

    // 绘制背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, width, height);

    // 绘制网格线
    ctx.setStrokeStyle('#f0f0f0');
    ctx.setLineWidth(1);
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    // 绘制Y轴标签
    ctx.setFontSize(10);
    ctx.setFillStyle('#999999');
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      const score = maxScore - (maxScore - minScore) * i / 4;
      ctx.fillText(score.toString(), 5, y + 4);
    }

    // 计算数据点位置
    const points = scores.map((score, index) => {
      const x = padding + (width - 2 * padding) * index / (Math.max(scores.length - 1, 1));
      const y = padding + (height - 2 * padding) * (maxScore - score) / (maxScore - minScore);
      return { x, y };
    });

    // 绘制渐变区域（先画，在线条下面）
    ctx.setFillStyle('rgba(26, 115, 232, 0.1)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // 绘制趋势线
    ctx.setStrokeStyle('#1A73E8');
    ctx.setLineWidth(2);
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 绘制数据点
    ctx.setFillStyle('#1A73E8');
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 绘制数据点白色中心
    ctx.setFillStyle('#ffffff');
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 绘制X轴标签
    ctx.setFontSize(9);
    ctx.setFillStyle('#666666');
    labels.forEach((label, index) => {
      const x = padding + (width - 2 * padding) * index / (Math.max(scores.length - 1, 1));
      ctx.fillText(label, x - 12, height - 5);
    });

    ctx.draw();
  },

  shareReport() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    return {
      title: '我的听力测试报告',
      path: '/pages/myReport/myReport',
      imageUrl: '/image/report-share.png'
    };
  },

  onShareTimeline() {
    return {
      title: '我的听力测试报告',
      query: 'testId=' + (this.data.latestTest.id || '')
    };
  }
});
