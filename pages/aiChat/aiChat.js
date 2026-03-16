const app = getApp();

Page({
  data: {
    inputText: '',
    messages: [],
    scrollIntoView: '',
    isRecording: false,
    recordingTime: 0,
    recordingTimer: null,
    innerAudioContext: null,
    isPlaying: false,
    userInfo: null,
    reportId: null, // 报告ID
    reportDate: null // 报告日期
  },

  onLoad(options) {
    const userInfo = wx.getStorageSync('user');
    this.setData({ userInfo });

    // 接收报告参数
    if (options.reportId) {
      this.setData({
        reportId: options.reportId,
        reportDate: options.reportDate ? decodeURIComponent(options.reportDate) : ''
      });
    }

    this.data.innerAudioContext = wx.createInnerAudioContext();
    this.data.innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });

    this.loadHistory();

    // 如果有报告ID，自动发送报告咨询消息
    if (options.reportId) {
      setTimeout(() => {
        this.autoSendReportMessage();
      }, 500);
    }
  },

  /**
   * 自动发送报告咨询消息
   */
  autoSendReportMessage() {
    const reportId = this.data.reportId;
    const reportType = reportId === 'overall' ? '总体' : '单次';

    const userMessage = {
      role: 'user',
      content: `我想咨询关于我的${reportType}听力报告（报告ID：${reportId}）`,
      id: Date.now(),
      isAutoSend: true
    };

    const newMessages = [...this.data.messages, userMessage];
    this.setData({
      messages: newMessages,
      scrollIntoView: 'msg-' + (newMessages.length - 1)
    });

    this.saveHistory();

    // 调用后端接口处理报告咨询
    this.getAIResponseForReport(reportId);
  },

  /**
   * 获取AI对报告的回复
   */
  getAIResponseForReport(reportId) {
    wx.showLoading({ title: '分析报告中...' });

    // 传递reportId给后端
    const requestData = {
      question: '咨询听力报告',
      userId: this.data.userInfo?.userId,
      reportId: reportId
    };

    // TODO: 替换为实际的后端API调用
    // 示例：sendToAI(requestData).then(...)

    setTimeout(() => {
      let response = '';
      if (reportId === 'overall') {
        response = '根据您的总体听力报告分析，您的听力整体表现良好。在过去的测试中，您的平均得分较为稳定，建议继续保持良好的用耳习惯，定期进行听力测试来监测听力变化。';
      } else {
        response = '根据您的这次听力测试结果，您的听力表现不错。如有任何疑问，欢迎随时向我咨询，我会根据您的报告为您提供专业的建议。';
      }

      const aiMessage = {
        role: 'assistant',
        content: response,
        id: Date.now() + 1
      };
      const newMessages = [...this.data.messages, aiMessage];

      this.setData({
        messages: newMessages,
        scrollIntoView: 'msg-' + (newMessages.length - 1)
      });

      this.saveHistory();
      wx.hideLoading();
    }, 1500);
  },

  onUnload() {
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.destroy();
    }
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
  },

  loadHistory() {
    const history = wx.getStorageSync('chatHistory') || [];
    if (history.length) {
      this.setData({ messages: history });
    }
  },

  saveHistory() {
    wx.setStorageSync('chatHistory', this.data.messages);
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    const userMessage = { role: 'user', content: text, id: Date.now() };
    const newMessages = [...this.data.messages, userMessage];
    this.setData({
      messages: newMessages,
      inputText: '',
      scrollIntoView: 'msg-' + (newMessages.length - 1)
    });

    this.saveHistory();
    this.getAIResponse(text);
  },

  sendQuickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputText: question });
    this.sendMessage();
  },

  getAIResponse(question) {
    wx.showLoading({ title: '思考中...' });

    // 传递reportId给后端（如果有）
    const requestData = {
      question: question,
      userId: this.data.userInfo?.userId
    };

    if (this.data.reportId) {
      requestData.reportId = this.data.reportId;
    }

    // TODO: 替换为实际的后端API调用
    // 示例：sendToAI(requestData).then(...)

    setTimeout(() => {
      const aiResponses = {
        '我的听力下降了吗？': '根据您的描述，建议您进行专业的听力测试。我们可以通过简单的测试来评估您的听力水平。',
        '如何保护听力？': '保护听力的方法包括：1. 避免长时间接触噪音；2. 使用耳塞保护耳朵；3. 保持耳道清洁；4. 定期进行听力检查。',
        '听力不好怎么办？': '如果发现听力下降，建议您：1. 及时就医检查；2. 避免噪音环境；3. 佩戴助听器（如需要）；4. 定期复查。',
        '听力测试有什么用？': '听力测试可以帮助您：1. 了解当前的听力水平；2. 早期发现听力问题；3. 监测听力变化；4. 为治疗提供依据。',
        '耳朵经常嗡嗡响正常吗？': '耳朵嗡嗡响（耳鸣）可能由多种原因引起，如噪音暴露、耳道感染、血压异常等。建议您咨询专业医生。',
        '如何预防老年耳聋？': '预防老年耳聋建议：1. 避免长期噪音环境；2. 戒烟限酒；3. 控制血压血糖；4. 保持良好的生活习惯；5. 定期检查听力。'
      };

      const response = aiResponses[question] || '您好！关于您的问题，建议您进行专业的听力测试，以便获得更准确的评估和指导。';

      const aiMessage = { role: 'assistant', content: response, id: Date.now() + 1 };
      const newMessages = [...this.data.messages, aiMessage];

      this.setData({
        messages: newMessages,
        scrollIntoView: 'msg-' + (newMessages.length - 1)
      });

      this.saveHistory();
      wx.hideLoading();
    }, 1500);
  },

  toggleVoiceInput() {
    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  startRecording() {
    const recorderManager = wx.getRecorderManager();

    recorderManager.onStop((res) => {
      this.handleRecordingResult(res.tempFilePath);
    });

    recorderManager.onError((err) => {
      console.error('录音失败', err);
      wx.showToast({ title: '录音失败', icon: 'none' });
      this.setData({ isRecording: false });
    });

    recorderManager.start({ format: 'mp3', duration: 60000 });
    this.setData({ isRecording: true, recordingTime: 0 });

    this.data.recordingTimer = setInterval(() => {
      const newTime = this.data.recordingTime + 1;
      this.setData({ recordingTime: newTime });
      if (newTime >= 60) {
        this.stopRecording();
      }
    }, 1000);
  },

  stopRecording() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();

    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.setData({ isRecording: false, recordingTime: 0 });
    }
  },

  handleRecordingResult(filePath) {
    wx.showLoading({ title: '识别中...' });

    setTimeout(() => {
      const recognizedText = '我的听力最近有些下降';
      this.setData({ inputText: recognizedText });
      wx.hideLoading();
    }, 1500);
  },

  playAudio(e) {
    const text = e.currentTarget.dataset.text;

    if (this.data.isPlaying) {
      this.data.innerAudioContext.stop();
      this.setData({ isPlaying: false });
      return;
    }

    wx.showToast({ title: '语音合成中...', icon: 'none' });

    setTimeout(() => {
      this.setData({ isPlaying: true });
      wx.showToast({ title: '播放中', icon: 'none' });

      setTimeout(() => {
        this.setData({ isPlaying: false });
      }, 3000);
    }, 1000);
  },

  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.removeStorageSync('chatHistory');
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '听力健康智能问答',
      path: '/pages/aiChat/aiChat'
    };
  }
});
