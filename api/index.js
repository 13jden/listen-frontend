/**
 * 封装 wx.request 请求
 * @param {string} url 请求地址
 * @param {string} method 请求方法（GET/POST）
 * @param {object} data 请求参数
 * @param {object} headers 请求头
 * @returns {Promise} 返回 Promise 对象
 */
const request = (url, method = 'GET', data = {}, headers = {}) => {
  return new Promise((resolve, reject) => {
    // 显示加载中提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 发起请求
    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json', // 默认请求头
        ...headers // 合并自定义请求头
      },
      success: (res) => {
        // 隐藏加载中提示
        wx.hideLoading();

        // 状态码 200 表示请求成功
        if (res.statusCode === 200) {
          resolve(res.data); // 返回响应数据
        } else {
          // 其他状态码表示请求失败
          reject({
            statusCode: res.statusCode,
            message: res.data.message || '请求失败'
          });
        }
      },
      fail: (err) => {
        // 隐藏加载中提示
        wx.hideLoading();

        // 网络错误
        reject({
          statusCode: -1,
          message: '网络错误，请检查网络连接'
        });
      }
    });
  });
};

export default request;