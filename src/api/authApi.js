import client, { extractData, extractError } from './client';

export const registerUser = async (formData) => {
  try {
    const res = await client.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await client.post('/users/login', credentials);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const logoutUser = async () => {
  try {
    const res = await client.post('/users/logout');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const refreshToken = async () => {
  try {
    const res = await client.post('/users/refreshToken');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await client.get('/users/current-user');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const changePassword = async ({ oldPassword, newPassword }) => {
  try {
    const res = await client.post('/users/change-password', { oldPassword, newPassword });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const updateAccount = async ({ fullname, email }) => {
  try {
    const res = await client.patch('/users/update-account', { fullname, email });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const updateAvatar = async (formData) => {
  try {
    const res = await client.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const updateCoverImage = async (formData) => {
  try {
    const res = await client.patch('/users/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getUserChannelProfile = async (username) => {
  try {
    const res = await client.get(`/users/c/${username}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getWatchHistory = async () => {
  try {
    const res = await client.get('/users/history');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const addToWatchHistory = async (videoId) => {
  try {
    const res = await client.post(`/users/history/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
