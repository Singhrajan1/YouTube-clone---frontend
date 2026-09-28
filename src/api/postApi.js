import client, { extractData, extractError } from './client';

export const createPost = async (formData) => {
  try {
    const res = await client.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getAllPosts = async () => {
  try {
    const res = await client.get('/posts/all');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getUserPosts = async (userId) => {
  try {
    const res = await client.get(`/posts/user/${userId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const updatePost = async (postId, formData) => {
  try {
    const res = await client.patch(`/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await client.delete(`/posts/${postId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
