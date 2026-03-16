import { getTestDetail } from '../../api/test';

Page({
  data: {
    test: [],
    questions: [],
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    accuracyRate: 0,
    scoreLevel: {
      type: 'good',
      title: '表现良好',
      desc: '您的听力状况总体不错，请继续保持！',
      levelName: '良好'
    },
    healthAdvices: []
  },

  onLoad(options) {
    this.calculateScoreLevel();
    this.setHealthAdvices();

    const testId = options.testId;
    if (testId == null) {
      const test = wx.getStorageSync('MyTest');
      const user = wx.getStorageSync('user');
      const score = Math.round(test.avgScore);

      this.getDetail(test.id);
      this.setData({ score: score });

      user.score = score;
      user.recentTestDate = this.formatDate(test.endTime);
      wx.setStorageSync('user', user);

      const pages = getCurrentPages();
      const indexPage = pages.find((page) => page.route === 'pages/index/index');
      const homePage = pages.find((page) => page.route === 'pages/home/home');

      if (indexPage) {
        indexPage.setData({ user: user });
      }
      if (homePage) {
        homePage.setData({ date: user.recentTestDate });
      }
    } else {
      const score = wx.getStorageSync('score');
      this.setData({ score: Math.round(score) });
      this.getDetail(testId);
    }
  },

  onShow() {
    this.calculateScoreLevel();
  },

  calculateScoreLevel() {
    const score = this.data.score;
    let level = {};

    if (score >= 90) {
      level = {
        type: 'excellent',
        title: '听力优秀',
        desc: '您的听力状况非常棒！继续保持良好的生活习惯。',
        levelName: '优秀'
      };
    } else if (score >= 75) {
      level = {
        type: 'good',
        title: '表现良好',
        desc: '您的听力状况总体不错，请继续保持！',
        levelName: '良好'
      };
    } else if (score >= 60) {
      level = {
        type: 'medium',
        title: '听力一般',
        desc: '建议您关注听力健康，必要时进行专业检查。',
        levelName: '一般'
      };
    } else {
      level = {
        type: 'poor',
        title: '需要关注',
        desc: '建议您尽快进行专业听力检查，及早干预。',
        levelName: '较差'
      };
    }

    this.setData({ scoreLevel: level });
  },

  setHealthAdvices() {
    const score = this.data.score;
    let advices = [];

    if (score >= 90) {
      advices = [
        '继续保持良好的生活习惯',
        '定期进行听力检查，关注听力变化',
        '避免长时间接触噪音环境',
        '保持充足的睡眠和营养'
      ];
    } else if (score >= 75) {
      advices = [
        '建议每半年进行一次听力检查',
        '避免长时间使用耳机，音量不超过60%',
        '保持耳道清洁，但不要过度清理',
        '出现不适及时就医'
      ];
    } else if (score >= 60) {
      advices = [
        '建议进行更全面的听力检查',
        '减少在噪音环境中的时间',
        '考虑使用耳塞保护听力',
        '咨询专业医生，了解干预方案'
      ];
    } else {
      advices = [
        '建议尽快进行专业听力检查',
        '避免接触噪音，保护现有听力',
        '咨询医生，了解治疗方案',
        '定期监测听力变化'
      ];
    }

    this.setData({ healthAdvices: advices });
  },

  getDetail(testId) {
    getTestDetail(testId).then(res => {
      if (res.code == 1) {
        const questions = res.data || [];
        const correctCount = questions.filter(q => q.score >= 10).length;
        const wrongCount = questions.filter(q => q.score < 10).length;
        const accuracyRate = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

        this.setData({
          questions: questions,
          correctCount: correctCount,
          wrongCount: wrongCount,
          accuracyRate: accuracyRate
        });

        this.calculateScoreLevel();
        this.setHealthAdvices();
      }
    }).catch(err => {
      console.error('获取数据失败', err);
    });
  },

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  },

  navigateToQuestion(event) {
    const index = event.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/queastion/queastion?index=${index}`
    });
  },

  goToMyReport() {
    const testId = this.data.test?.id || '';
    wx.navigateTo({
      url: `/pages/myReport/myReport?testId=${testId}`
    });
  },

  goToAIChat() {
    const testId = this.data.test?.id || '';
    const reportDate = this.formatDate(new Date());
    wx.navigateTo({
      url: `/pages/aiChat/aiChat?reportId=${testId}&reportDate=${encodeURIComponent(reportDate)}`
    });
  },

  shareResult() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  retryTest() {
    wx.redirectTo({
      url: '/pages/listen/listen'
    });
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  onShareAppMessage() {
    return {
      title: `我的听力测试得分：${this.data.score}分`,
      path: '/pages/result/result',
      imageUrl: '/image/share-result.png'
    };
  },

  onShareTimeline() {
    return {
      title: `我的听力测试得分：${this.data.score}分`,
      query: 'testId=' + (this.data.test?.id || '')
    };
  }
});
