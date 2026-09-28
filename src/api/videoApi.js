import client, { extractData, extractError } from './client';

export const getAllVideos = async (params = {}) => {
  try {
    const res = await client.get('/videos', { params });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getVideoById = async (videoId) => {
  try {
    const res = await client.get(`/videos/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const publishVideo = async (formData) => {
  try {
    const res = await client.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const deleteVideo = async (videoId) => {
  try {
    const res = await client.delete(`/videos/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
