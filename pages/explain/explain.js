import { getTest, uploadAll,PreAudioUpload } from '../../api/test';

Page({
  data: {
    questions: [], // 存储所有题目和用户答案
    currentIndex: 0, // 当前题目的索引
    audioContext: null, // 音频播放上下文
    recordingResult: "", // 录音识别结果
    isRecording: false, // 是否正在录音
    tempFilePath: "", // 录音文件的临时路径
    score: 0, 
    currentStep: 1,
    isPlaying: false,
    user:[],
    isRecordingValid: false, // 录音是否有效
    recordStartTime: 0,
    audioIng:false
  },

  onLoad: function () { 
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

  },

// 播放音频
playAudio: function () {
  const { audioContext,  isPlaying } = this.data;
  const currentQuestion = "http://112.124.60.182/audio/X2DEQ88lgR.wav";
  console.log("点击播放/暂停按钮");
  
  if (!isPlaying) {
    // 如果当前没有播放，则开始播放
    audioContext.src = currentQuestion;
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
  goListen(){
    console.log("dianji");
    wx.redirectTo({
      url: '/pages/listen/listen',
    });
  },
  listen(){
    wx.navigateTo({
      url: '/pages/pre/pre',
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
    PreAudioUpload(tempFilePath)
      .then((result) => {
        wx.hideLoading();
        console.log(result.data);
        const score = result.data;
        this.setData({ score,currentStep:3 });
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
    if (this.data.currentIndex > 0) {
      this.setData({ currentIndex: this.data.currentIndex - 1 });
      this.updateProgress();
    }
  },

  // 下一题
  nextQuestion: function () {
    if (this.data.currentIndex < 32) {
      this.setData({ currentIndex: this.data.currentIndex + 1 });
      this.updateProgress();
    }
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

