import request from './index'; // 引入封装的请求方法

// const BASE_URL = 'http://112.124.60.182:8082/user';
// const BASE_URL = 'https://aidatech.cn/wx/user';
const BASE_URL = 'http://localhost:8082/user';

/**
 * 用户注册
 * @param {string} openId 用户的 openId
 * @param {string} name 用户姓名
 * @param {number} hospitalId 医院 ID
 * @param {string} number 电话号码
 * @param {string} medicalId 医疗 ID
 * @returns {Promise} 返回注册结果
 */
export const register = (openId, name, hospitalId, number, medicalId) => {
  return request(`${BASE_URL}/register`, 'POST', {
    openId,
    name,
    hospitalId,
    number,
    medicalId
  });
};

/**
 * 用户登录
 * @param {string} code 微信登录凭证 code
 * @returns {Promise} 返回登录结果
 */
export const login = (code) => {
  return request(`${BASE_URL}/login`, 'GET', { code });
};

/**
 * 自动登录
 * @returns {Promise} 返回自动登录结果
 */
export const autoLogin = () => {
  return request(`${BASE_URL}/autologin`, 'GET');
};

export default {
  register,
  login,
  autoLogin
};