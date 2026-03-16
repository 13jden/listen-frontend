import request from './index'; // 引入请求封装

// const BASE_URL = 'http://115.190.53.97:8081';
// const BASE_URL = 'https://aidatech.cn/wx';
const BASE_URL = 'http://localhost:8081';

// 封装 getTest 请求
export const getTest = (userId, num, isContinue, time) => {
  return request(`${BASE_URL}/usertest/getTest`, 'GET',{ userId, num, isContinue, time });
};

export const getMyTest = (userId) => {
  return request(`${BASE_URL}/usertest/getMyTest`, 'GET',{ userId});
};

export const getTestDetail = (testId) => {
  return request(`${BASE_URL}/testdetail/getDetail`, 'GET',{ testId});
};

// 封装 uploadAll 请求
export const uploadAll = (testId) => {
  return request(`${BASE_URL}/usertest/uploadAll`,'GET', {testId});
};

export const PreAudioUpload = (testAudio) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/testdetail/getPreScore`, // 上传接口地址
      filePath: testAudio, // 文件路径
      name: 'testAudio', // 上传文件的参数名

      header: {
        'Content-Type': 'multipart/form-data', // 设置文件上传请求头
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (res.statusCode === 200) {
          resolve(data); // 返回成功响应数据
        } else {
          reject({
            statusCode: res.statusCode,
            message: data.message || '请求失败',
          });
        }
      },
      fail: (err) => {
        reject({
          statusCode: -1,
          message: '上传失败，请检查网络连接',
        });
      },
    });
  });
};

// 封装 OneUserAudioUpload 请求
export const OneUserAudioUpload = (testAudio, testDetailId) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${BASE_URL}/testdetail/OneUserAudio`, // 上传接口地址
      filePath: testAudio, // 文件路径
      name: 'testAudio', // 上传文件的参数名
      formData: {
        testDetailId: testDetailId, // 传递参数
      },
      header: {
        'Content-Type': 'multipart/form-data', // 设置文件上传请求头
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (res.statusCode === 200) {
          resolve(data); // 返回成功响应数据
        } else {
          reject({
            statusCode: res.statusCode,
            message: data.message || '请求失败',
          });
        }
      },
      fail: (err) => {
        reject({
          statusCode: -1,
          message: '上传失败，请检查网络连接',
        });
      },
    });
  });
};

// 生成总体报告
export const generateOverallReport = (userId) => {
  return request(`${BASE_URL}/report/generateOverall`, 'GET', { userId });
};

// 获取总体报告
export const getOverallReport = (userId) => {
  return request(`${BASE_URL}/report/getOverall`, 'GET', { userId });
};
