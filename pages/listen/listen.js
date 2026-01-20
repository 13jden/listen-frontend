import { getTest, uploadAll, OneUserAudioUpload } from '../../api/test';

Page({
  data: {
    questions: [], // 存储所有题目和用户答案
    currentIndex: 0, // 当前题目的索引
    audioContext: null, // 音频播放上下文
    recordingResult: "", // 录音识别结果
    isRecording: false, // 是否正在录音
    tempFilePath: "", // 录音文件的临时路径
    testId: "", // 当前的测试 ID
    continueTest: true, // 是否继续上次的测试
    score: 0, // 累计分数
    num:4,
    isPlaying: false,
    user:[],
    currentStep: 1,
    isRecordingValid: false, // 录音是否有效
    recordStartTime: 0
  },

  onLoad: function () {
  // 获取user信息
  this.setData({user:wx.getStorageSync('user')});
  this.setData({questions:wx.getStorageSync('questions')});
  console.log(this.data.user);
  wx.showModal({
    title: '提示',
    content: '您将会听到33个音频，请仔细听并复述你听到的内容。',
    showCancel: false,
    success: () => {
      this.loadTestData(1);  // 第一次加载时，time=1
    }
  });
  
  
    const audioContext = wx.createInnerAudioContext();
    this.setData({
      audioContext: audioContext,
    });


  // 打印调试信息，确保audioContext初始化
  console.log('audioContext initialized: ', audioContext);
    // 初始化录音管理器
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onStart(() => {
      console.log("开始录音...");
    });
    // 监听录音结束事件
    this.recorderManager.onStop((res) => {
      console.log("停止录音...", res.tempFilePath);
      this.setData({ tempFilePath: res.tempFilePath }, () => {
        // 只有录音有效时才上传
        if (this.data.isRecordingValid) {
          this.uploadRecording();
        } else {
          console.log("录音无效，不上传");
        }
      });
    });
    this.recorderManager.onError((res) => {
      console.log("录音失败:", res);
      wx.showToast({
        title: '录音失败',
        icon: 'none',
      });
      // 请求录音权限
wx.authorize({
  scope: 'scope.record',
  success() {
    // 用户已经同意授权，可以开始录音
    wx.startRecord({
      success(res) {
        // 录音成功
        const tempFilePath = res.tempFilePath;
        console.log('录音文件路径:', tempFilePath);
      },
      fail(res) {
        console.error('录音失败:', res.errMsg);
      }
    });
  },
  fail() {
    // 用户拒绝了授权，提示用户去设置中开启
    wx.showModal({
      title: '提示',
      content: '请开启录音权限',
      success(res) {
        if (res.confirm) {
          wx.openSetting({
            success(settingRes) {
              console.log('用户打开了设置页面');
            }
          });
        }
      }
    });
  }
});
    });

    // 跳转到第一个未回答的题目\
  if(this.data.questions){
    this.jumpToFirstUnanswered();
  }
  this.updateProgress();
  },
  updateProgress() {
    // 计算进度（百分比）
    const progress = Math.round(((this.data.currentIndex+1) / this.data.num) * 100);
    this.drawProgressCircle(progress);
  },

  drawProgressCircle(percent) {
    const ctx = wx.createCanvasContext('progressCircle', this);
    const radius = 50; // 圆的半径
    const centerX = 110, centerY = 55; // 圆心坐标
    // const radius = 80; // 圆的半径
    // const centerX = 110, centerY = 85; // 圆心坐标
    const startAngle = -Math.PI / 2; // 从12点方向开始
    const endAngle = startAngle + (percent / 100) * 2 * Math.PI; // 计算角度

    // 绘制背景圆
    ctx.setLineWidth(6); // 背景圆更粗一点
    ctx.setStrokeStyle('#e0e0e0'); // 灰色背景
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // 绘制进度圆
    ctx.setStrokeStyle('#19cfc2'); // 绿色进度条
    ctx.setLineWidth(5); // 进度线更粗
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();

    // 渲染
    ctx.draw();
  },

  // 加载题目数据
  loadTestData: function (time) {
    const { user, continueTest,num } = this.data;
    
    getTest(user.userId, num, continueTest, time) // 调用 getTest 接口
      .then(response => {
        const { data } = response;
        if (data.endTime === null && continueTest) {
          wx.showModal({
            title: '提示',
            content: '你有未完成的测试，是否继续？',
            success: (res) => {
              if (res.confirm) {
                this.setData({ continueTest: true});
                this.loadTestData(2);
              } else {
                this.setData({ continueTest: false });
                this.loadTestData(2) ;
              }
            }
          });
        } else {
          this.setData({ testId: data[0].testId });
          this.loadQuestions(data);
          console.log("准备跳转");
          this.jumpToFirstUnanswered();
          this.updateProgress();
        }
      })
      .catch(error => {
        console.log(error);
        wx.showToast({
          title: '获取题目失败',
          icon: 'none',
        });
      });
  },

  // 加载题目到 data
  loadQuestions: function (data) {
    const questions = data.map((item, index) => ({
      audioUrl: item.audioPath,
      index: item.index,
      score: item.score,
      id:item.id,
      testAudioPath: item.testAudioPath, // 初始为空
    }));
    console.log(data);
    console.log(questions);
    this.setData({ questions });
    wx.setStorageSync('questions', questions); // 存储在 session 中
    this.audioContext=wx.createInnerAudioContext({useWebAudioImplement: true});
  },

// 播放音频
playAudio: function () {
  const { audioContext, questions, currentIndex, isPlaying } = this.data;
  const currentQuestion = questions[currentIndex];
  console.log("点击播放/暂停按钮");

  if (!isPlaying) {
    // 如果当前没有播放，则开始播放
    audioContext.src = currentQuestion.audioUrl;
    audioContext.play();
    this.setData({ isPlaying: true }); // 设置播放状态为 true
  } else {
    // 如果当前正在播放，则暂停
    audioContext.pause();
    this.setData({ isPlaying: false }); // 设置播放状态为 false
  }

  // 监听音频播放事件
  audioContext.onPlay(() => {
    console.log("音频开始播放");
    this.setData({ isPlaying: true }); // 更新播放状态
  });

  // 监听音频暂停事件
  audioContext.onPause(() => {
    console.log("音频暂停");
    this.setData({ isPlaying: false }); // 更新播放状态
  });

  // 监听音频结束事件
  audioContext.onEnded(() => {
    console.log("音频播放结束");
    this.setData({ isPlaying: false }); // 更新播放状态
    if(this.data.currentStep===1){
      this.setData({
        currentStep:2
      })
    }
  });

  // 监听音频播放错误事件
  audioContext.onError((err) => {
    console.error("音频播放失败", err);
    this.setData({ isPlaying: false }); // 更新播放状态
  });
},

  // 上传录音
  uploadRecording: function () {
    const { tempFilePath, questions,currentIndex } = this.data;
    if (!tempFilePath) {
      wx.showToast({
        title: '录音文件不存在',
        icon: 'none',
      });
      return;
    }

    wx.showLoading({
      title: '上传中...',
    });
    console.log(tempFilePath);
    OneUserAudioUpload(tempFilePath, questions[currentIndex].id) // 调用 OneUserAudioUpload
      .then((result) => {
        wx.hideLoading();
        console.log(result.data);
        const updatedQuestions = this.data.questions;
        updatedQuestions[currentIndex].score = result.data.score; // 更新分数
        updatedQuestions[currentIndex].testAudioPath = result.data.testAudioPath;
        // 更新session
        wx.setStorageSync('questions', updatedQuestions); 
        console.log(this.data.questions[currentIndex].score);
        console.log(this.data.questions[currentIndex].testAudioPath);
        this.setData({ questions: updatedQuestions });
        this.setData({
          currentStep:3
        })
        wx.showToast({
          title: '上传成功',
          icon: 'success',
        });
      })
      .catch((error) => {
        wx.hideLoading();
        wx.showToast({
          title: error.message || '上传失败',
          icon: 'none',
        });
      });
  },

  // 上一题
  prevQuestion: function () {
    const { questions , currentIndex } = this.data;
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
      this.updateProgress();
      if(questions[currentIndex-1].testAudioPath){
        console.log(3);
        this.setData({
          currentStep:3
        })
      }
      else{
        console.log(1);
        this.setData({
          currentStep:1
        })
      }
        
    }
  },

  // 下一题
  nextQuestion: function () {
    const { questions , currentIndex } = this.data;
    if (this.data.currentIndex < 32) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
      this.updateProgress();
      if(questions[currentIndex+1].testAudioPath){
        this.setData({
          currentStep:3
        })
      }
      else{
        this.setData({
          currentStep:1
        })
      }
    }
  },

  // 提交答案
  submitAnswers: function () {
    const { questions, num } = this.data;
    const answeredCount = questions.filter(q => q.testAudioPath && q.testAudioPath.trim() !== '').length;
  
    let content = `你已经回答了${answeredCount}题，确认提交吗？`;
    if (answeredCount < num) {
      content = `你还有未回答的题目，确定提交吗？`;
    }
  
    wx.showModal({
      title: '确认提交',
      content: content,
      success: (res) => {
        if (res.confirm) {
          this.uploadAll(); // 提交所有数据
        }
      }
    });
  },
  
// 跳转到第一个未回答的题目
jumpToFirstUnanswered: function () {
  const { questions } = this.data;
  // const firstUnansweredIndex = questions.findIndex(q => q.score === 0 || q.score === '0');
  const firstUnansweredIndex = questions.findIndex(q => !q.testAudioPath || q.testAudioPath.trim() === '');
  console.log("跳转："+firstUnansweredIndex);
  if (firstUnansweredIndex !== -1) {
    this.setData({ currentIndex: firstUnansweredIndex });
  } else {
    wx.showToast({
      title: '所有题目已回答',
      icon: 'none',
    });
    this.setData({ currentIndex:32 });
  }
},
  // 提交所有答案
  uploadAll: function () {
    const { testId, questions,user } = this.data;
    wx.showLoading({ title: '提交中...' });

    uploadAll(testId) // 调用 uploadAll 提交数据
      .then((response) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          icon: 'success',
        });
        //把返回信息存到session
        wx.setStorageSync('MyTest',response.data);
        wx.removeStorageSync('questions');
        wx.redirectTo({
          url: '/pages/result/result',
        })
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({
          title: '提交失败',
          icon: 'none',
        });
      });
  }, 
  // 录音按下事件
  startRecording: function () {
    if (!this.data.isRecording) {
      // 记录录音开始时间
      this.setData({
        isRecording: true,
        recordStartTime: Date.now(), // 获取当前时间戳
      });
      // 启动录音
      this.recorderManager.start({
        format: 'wav',
        sampleRate: 16000,
        numberOfChannels: 1,
      });

      // 设置一个定时器，检查录音时长是否不足一秒
      this.autoCancelTimer = setTimeout(() => {
        const currentTime = Date.now();
        if (currentTime - this.data.recordStartTime < 1000) {
          // 录音时长不足一秒，自动取消
          this.recorderManager.stop();
          this.setData({ isRecording: false });
          console.log("录音时长不足一秒，已自动取消");
        }
      }, 1000); // 1秒后检查
    }
  },

  // 录音松开事件
  stopRecording: function () {
    if (this.data.isRecording) {
      // 清除自动取消的定时器
      clearTimeout(this.autoCancelTimer);

      // 检查录音时长是否超过一秒
      const currentTime = Date.now();
      if (currentTime - this.data.recordStartTime >= 1000) {
        // 录音时长超过一秒，标记为有效录音
        this.setData({ isRecordingValid: true });
      } else {
        // 录音时长不足一秒，标记为无效录音
        this.setData({ isRecordingValid: false });
      }
      // 停止录音
      this.recorderManager.stop();
      this.setData({ isRecording: false });
    }
  },

  // 滑动取消录音
  cancelRecording: function (e) {
    const touchMoveX = e.changedTouches[0].clientX;
    if (touchMoveX < 100) { // 例如，滑动超过一定距离取消录音
      // 清除自动取消的定时器
      clearTimeout(this.autoCancelTimer);

      // 停止录音并标记为无效录音
      this.recorderManager.stop();
      this.setData({
        isRecording: false,
        isRecordingValid: false,
      });
      console.log("录音已取消");
    }
  },

  onUnload: function () {
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },
});

