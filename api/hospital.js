import request from './index';

// const BASE_URL = 'http://112.124.60.182:8082/hospital';
const BASE_URL = 'http://localhost:8082/user';
// const BASE_URL = 'https://aidatech.cn/wx/hospital';

export const getHospitalList = () => {
  return request(`${BASE_URL}/list`, 'GET');
};

export default {
  getHospitalList
};