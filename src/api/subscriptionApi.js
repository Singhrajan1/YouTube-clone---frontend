import client, { extractData, extractError } from './client';

export const toggleSubscription = async (channelId) => {
  try {
    const res = await client.post(`/subscriptions/toggle/${channelId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

export const getSubscribedChannels = async () => {
  try {
    const res = await client.get('/subscriptions/subscribed-channels');
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};

// Returns a number (count) for non-owners, or an array of subscriber objects for the channel owner
export const getChannelSubscribers = async (channelId) => {
  try {
    const res = await client.get(`/subscriptions/subscribers/${channelId}`);
    return { data: extractData(res), error: null };
  } catch (err) {
    return { data: null, error: extractError(err) };
  }
};
