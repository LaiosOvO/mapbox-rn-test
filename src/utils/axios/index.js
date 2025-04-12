import axios from 'axios';

const BASE_URL = "http://8.130.186.54:9898/"

// const BASE_URL = "http://192.168.1.119:9898/"

// 创建axios实例
console.log('BASE_URL ',BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL || '',
  timeout: 18000,
});

instance.interceptors.request.use((config) => {
  console.log('Request URL:', config.url); // 打印完整 URL
  console.log('Request Method:', config.method);
  return config;
});

// 添加请求拦截器
instance.interceptors.request.use(
//   function (config) {
//     const userToken = store.getState().userStore.userToken;
//     if (userToken) {
//       config.headers.Authorization = 'Bearer ' + userToken; // 让每个请求携带自定义token
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   },
);

//添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    if (response.data.code === 200) {
      return response.data;
    } else {
      console.log(response.data);
      return Promise.resolve(response.data);
    }
  },

  function (error) {
    console.log(error);
    return Promise.reject(error);
  },
);

export default instance;
