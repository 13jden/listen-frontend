import user, { login, register, autoLogin } from '../../api/user'; // 用户相关接口
import { getHospitalList } from '../../api/hospital'; // 医院列表接口

Page({
  data: {
    user:[],
    showRegisterForm: false, // 是否显示注册表单
    hospitalList: [], // 医院列表
    hospitalId: '', // 选择的医院 ID
    number: '', // 手机号
    name: '', // 姓名
    medicalId: '', // 医疗 ID
    age: '', // 年龄
    openid: '', // 用户的 openid
    isRegistered: false, // 是否已注册
    selectedHospitalName: '请选择医院' // 当前选中的医院名称
  },

  onLoad() {
    
    const token = this.getTokenFromCookies();
    if (token) {
      // 如果有 token，尝试自动登录
      this.autoLogin(token);
    } 
    this.setData({user:wx.getStorageSync('user')});
    console.log(this.data.user);
    if(this.data.user && Object.keys(this.data.user).length > 0){
      console.log("自动登录");
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
    // 获取医院列表
    this.fetchHospitalList();
  },

  /**
   * 获取医院列表
   */
  fetchHospitalList() {
    getHospitalList()
      .then(res => {
        if (res.code === 1) {
          this.setData({
            hospitalList: res.data // 保存医院列表
          });
        } else {
          console.error('获取医院列表失败:', res.message);
        }
      })
      .catch(err => {
        console.error('请求医院列表失败:', err);
      });
  },

  /**
   * 从 cookies 中获取 token
   */
  getTokenFromCookies() {
    const cookies = wx.getStorageSync('cookies') || [];
    const tokenCookie = cookies.find(cookie => cookie.name === 'token');
    return tokenCookie ? tokenCookie.value : null;
  },

  /**
   * 自动登录
   */
  autoLogin(token) {
    autoLogin()
      .then(res => {
        console.log('自动登录成功:', res);
        this.setData({
          isRegistered: true
        });
        wx.setStorageSync('user', res.data);
        wx.switchTab({
          url: '/pages/index/index',
        })
      })
      .catch(err => {
        console.error('自动登录失败:', err);
      });
  },

  /**
   * 微信登录
   */
  wxLogin() {
    wx.login({
      success: res => {
        if (res.code) {
          // 调用登录接口
          login(res.code)
            .then(res => {
              console.log('登录成功:', res);
              this.setData({
                isRegistered: true,
                openid: res.openid // 保存 openid
              });
              wx.setStorageSync('user', res.data);
              wx.switchTab({
                url: '/pages/index/index',
              })
            })
            .catch(err => {
              console.error('登录失败:', err);
              if (err.statusCode === 401) {
                // 如果账号未注册，从 message 中提取 openid
                const openid = this.extractOpenIdFromMessage(err.message);
                if (openid) {
                  this.setData({
                    openid: openid,
                    showRegisterForm: true // 显示注册表单
                  });
                } else {
                  console.error('无法提取 openid:', err.message);
                }
              }
            });
        } else {
          console.error('获取 code 失败:', res.errMsg);
        }
      }
    });
  },

  /**
   * 从 message 中提取 openid
   */
  extractOpenIdFromMessage(message) {
    const prefix = "账号不存在：";
    if (message.startsWith(prefix)) {
      return message.slice(prefix.length);
    }
    return null;
  },

  /**
   * 提交注册表单
   */
  onSubmitRegisterForm(e) {
    const { openid, hospitalId, name, number, medicalId, age } = this.data;
    // 调用注册接口
    register(openid, name, hospitalId, number, medicalId, age)
      .then(res => {
        console.log('注册成功:', res);
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        });
        // 更新数据状态
        this.setData({
          isRegistered: true,
          showRegisterForm: false
        });
        wx.setStorageSync('user', res.data);
        // 注册成功后跳转到首页
        wx.switchTab({
          url: '/pages/index/index',
        })
      })
      .catch(err => {
        console.error('注册失败:', err);
        wx.showToast({
          title: '注册失败',
          icon: 'none'
        });
      });
  },
  

  /**
   * 关闭注册表单
   */
  closeRegisterForm() {
    this.setData({ showRegisterForm: false });
  },

  /**
   * 选择医院
   */
  onHospitalChange(e) {
    const index = e.detail.value; // 获取选择的医院索引
    const selectedHospital = this.data.hospitalList[index]; // 获取选中的医院对象
    this.setData({
      hospitalId: selectedHospital.id, // 保存医院 ID
      selectedHospitalName: selectedHospital.name // 保存医院名称
    });
  }, 

  /**
   * 输入手机号
   */
  onPhoneInput(e) {
    this.setData({
      number: e.detail.value
    });
  },

  /**
   * 输入姓名
   */
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  /**
   * 输入年龄
   */
  onAgeInput(e) {
    this.setData({
      age: e.detail.value
    });
  },



  /**
   * 输入医疗 ID
   */
  onMedicalIdInput(e) {
    this.setData({
      medicalId: e.detail.value
    });
  }
});