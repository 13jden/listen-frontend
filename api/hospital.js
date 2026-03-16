import request from './index';

const BASE_URL = 'http://localhost:8081/hospital';
// const BASE_URL = 'http://115.190.53.97:8081/hospital';
// const BASE_URL = 'https://aidatech.cn/wx/hospital';

export const getHospitalList = () => {
  return request(`${BASE_URL}/list`, 'GET');
};

export default {
  getHospitalList
};