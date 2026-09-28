import client, { extractData, extractError } from './client';

// --- Toggle ---
export const toggleVideoLike = async (videoId) => {
  try {
    const res = await client.post(`/likes/toggle/video/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const toggleCommentLike = async (commentId) => {
  try {
    const res = await client.post(`/likes/toggle/comment/${commentId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const togglePostLike = async (postId) => {
  try {
    const res = await client.post(`/likes/toggle/post/${postId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

// --- Count ---
export const getVideoLikeCount = async (videoId) => {
  try {
    const res = await client.get(`/likes/count/video/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getCommentLikeCount = async (commentId) => {
  try {
    const res = await client.get(`/likes/count/comment/${commentId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getPostLikeCount = async (postId) => {
  try {
    const res = await client.get(`/likes/count/post/${postId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

// --- Status ---
export const getVideoLikeStatus = async (videoId) => {
  try {
    const res = await client.get(`/likes/status/video/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getCommentLikeStatus = async (commentId) => {
  try {
    const res = await client.get(`/likes/status/comment/${commentId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getPostLikeStatus = async (postId) => {
  try {
    const res = await client.get(`/likes/status/post/${postId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
