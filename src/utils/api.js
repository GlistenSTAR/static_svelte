// @ts-nocheck
import axios from 'axios';

import { env } from '$env/dynamic/public';

export const API_URL = env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const axiosAPI = axios.create({ baseURL: `${API_URL}` });

const apiRequest = async (
  /** @type {string} */ method,
  /** @type {any} */ url,
  /** @type {undefined} */ request
) => {
  try {
    const token = localStorage.getItem('access_token');
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axiosAPI({ method, url, headers, data: request });

    return response.data;
  } catch (error) {
    if (error.status == 401 || error.status == 403) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return;
    }

    return error.response;
  }
};

const get = (/** @type {any} */ url) => apiRequest('get', url);

const post = (/** @type {any} */ url, /** @type {undefined} */ request) =>
  apiRequest('post', url, request);

const put = (/** @type {any} */ url, /** @type {undefined} */ request) =>
  apiRequest('put', url, request);

const deleteRequest = (/** @type {any} */ url) => apiRequest('delete', url);

const MarketAPI = {
  get,
  post,
  put,
  delete: deleteRequest,
};

export default MarketAPI;
