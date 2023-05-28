
import axios from 'axios';


const request = axios.create({
  baseURL: 'http://localhost:3000',
});


request.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  return Promise.reject(error);
});

/* GET /chatgpt/connect */
export async function chatgptConnect(options?: { [key: string]: any }) {
    return request('/chatgpt/connect', {
      method: 'GET',
      params: options,
    });
}

export async function chatgptGetAppKey() {
  return request('/chatgpt/getAppKey', {
    method: 'GET',
  });
}

export async function chatgptGenerate(options?: { [key: string]: any }) {
  return request('/chatgpt/generate', {
    method: 'POST',
    data: options,
  });
}