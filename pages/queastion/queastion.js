// pages/queastion/queastion.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions:[],
    currentIndex:0,
    currentQuestion:{},
    errorAnalysis: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const index = options.index - 1;
    const questions = wx.getStorageSync('questionsResult');

    // 添加空值检查
    if (!questions || !questions[index]) {
      console.log('暂无测试数据');
      this.setData({
        errorAnalysis: [
          { tag: '暂无数据', content: '暂无该题目的测试数据，请先完成测试。' }
        ]
      });
      return;
    }

    const currentQuestion = questions[index];
    console.log(index);
    questions[index].testTime = this.formatTime(questions[index].testTime);
    // 更新页面数据
    this.setData({
      questions: questions,
      currentIndex: index,
      currentQuestion: currentQuestion,
      // 写死的错因分析数据
      errorAnalysis: [
        { tag: '发音相似', content: '在音频中"花"和"瓜"的发音比较相似，容易混淆。' },
        { tag: '连读问题', content: '该句存在连读现象，可能是识别错误的原因。' },
        { tag: '环境噪音', content: '测试环境可能存在背景噪音，影响语音识别准确性。' },
        { tag: '语速过快', content: '您的朗读语速偏快，可能导致部分音节不够清晰。' },
        { tag: '发音不标准', content: '部分字词的发音存在轻微偏差，建议加强练习。' },
        { tag: '发音模糊', content: '某些辅音发音不够清晰，建议放慢语速。' }
      ]
    });
  },
  
// 播放用户音频
playUserAudio() {
  const audioPath = this.data.questions[this.data.currentIndex-1].testAudioPath;
  this.playAudio(audioPath);
},

// 播放测试音频
playTestAudio() {
  const audioPath = this.data.questions[this.data.currentIndex-1].audioPath;
  this.playAudio(audioPath);
},

// 播放音频
playAudio(audioPath) {
  const innerAudioContext = wx.createInnerAudioContext();
  innerAudioContext.src = audioPath;
  innerAudioContext.play();
  innerAudioContext.onPlay(() => {
    console.log("音频开始播放");
  });

  innerAudioContext.onError((err) => {
    console.error("音频播放失败", err);
  });
},

// 上一题
prevQuestion() {
  if (this.data.currentIndex > 0) {
    const index = this.data.currentIndex - 1;
    const currentQuestion = this.data.questions[index];
    currentQuestion.testTime = this.formatTime(currentQuestion.testTime);
    this.setData({
      currentIndex: index,
      currentQuestion:currentQuestion
    });

    console.log(this.data.currentIndex);
  }
},

// 下一题
nextQuestion() {
  if (this.data.currentIndex <= this.data.questions.length - 1) {
    const index = this.data.currentIndex-1 + 2;
    const currentQuestion = this.data.questions[index];
    currentQuestion.testTime = this.formatTime(currentQuestion.testTime);
    this.setData({
      currentIndex: index,
      currentQuestion:currentQuestion
    });
  }
},

formatTime(time) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 补足两位
  const day = String(date.getDate()).padStart(2, '0'); // 补足两位
  const hours = String(date.getHours()).padStart(2, '0'); // 补足两位
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 补足两位
  return `${year}-${month}-${day}  ${hours}:${minutes}`;
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
})