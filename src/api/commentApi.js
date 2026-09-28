import client, { extractData, extractError } from './client';

// Comments for videos
export const createVideoComment = async (videoId, content) => {
  try {
    const res = await client.post(`/comments/video/${videoId}`, { content });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getVideoComments = async (videoId, params = {}) => {
  try {
    const res = await client.get(`/comments/video/${videoId}`, { params });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

// Comments for posts
export const createPostComment = async (postId, content) => {
  try {
    const res = await client.post(`/comments/post/${postId}`, { content });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getPostComments = async (postId, params = {}) => {
  try {
    const res = await client.get(`/comments/post/${postId}`, { params });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

// Update / Delete (applies to both video & post comments)
export const updateComment = async (commentId, content) => {
  try {
    const res = await client.patch(`/comments/${commentId}`, { content });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const deleteComment = async (commentId) => {
  try {
    const res = await client.delete(`/comments/${commentId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
