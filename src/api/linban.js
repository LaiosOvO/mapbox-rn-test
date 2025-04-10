import request from '../utils/axios';

// 获取林班列表
export const getLinbanList = (params) => {
  return request.get('/app-api/user/linban/page', {params});
};

// 获取林班详情
export const getLinbanDetail = (id) => {
  return request.get('/app-api/user/linban/get?id='+id , {params: { id }});
};

// 更新用户位置和存活状态
export const updateUserAlive = (data) => {
  return request.put('/app-api/linban/user/update-user-alive', data);
};

// 获取分组用户在线情况
export const getAliveByJobGroup = () => {
  return request.get('/app-api/linban/user/alive-by-job-group');
};

// 获取用户详情
export const getUserDetail = (id) => {
  return request.get('/app-api/linban/user/get?id='+id, { params: { id } });
};

// 获取同组用户列表
export const getGroupUsers = (jobGroupId) => {
  return request.get('/app-api/linban/user/list', { params: { jobGroupId } });
};

// 获取用户轨迹
export const getUserTrack = (userId, startTime, endTime) => {
  return request.get('/app-api/linban/user-track/time-range', {
    params: {
      userId
    }
  });
};

// 更新用户位置
export const updateUserLocation = (data) => {
  return request.put('/app-api/linban/user/update-user-alive', data);
}; 