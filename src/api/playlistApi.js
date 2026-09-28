import client, { extractData, extractError } from './client';

export const createPlaylist = async ({ name, description }) => {
  try {
    const res = await client.post('/playlists', { name, description });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getUserPlaylists = async (userId) => {
  try {
    const res = await client.get(`/playlists/user/${userId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getPlaylistById = async (playlistId) => {
  try {
    const res = await client.get(`/playlists/${playlistId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const updatePlaylist = async (playlistId, { name, description }) => {
  try {
    const res = await client.patch(`/playlists/${playlistId}`, { name, description });
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const res = await client.delete(`/playlists/${playlistId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  try {
    const res = await client.post(`/playlists/${playlistId}/videos/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  try {
    const res = await client.delete(`/playlists/${playlistId}/videos/${videoId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
