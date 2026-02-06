import axios from 'axios';

export const fetchUserPosts = async (userId, { page = 1, size = 20 } = {}) => {
  const response = await axios.get(`/dykj/api/boards/users/${encodeURIComponent(userId)}/posts`, {
    params: { page, size },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data?.list || [];
};

export const fetchUserReplies = async (userId, { page = 1, size = 20 } = {}) => {
  const response = await axios.get(`/dykj/api/boards/users/${encodeURIComponent(userId)}/replies`, {
    params: { page, size },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data?.list || [];
};

export const fetchPopularBoards = async ({ boardType, range, limit = 10 } = {}) => {
  const response = await axios.get('/dykj/api/boards/popular', {
    params: { boardType, range, limit },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data?.list || [];
};
