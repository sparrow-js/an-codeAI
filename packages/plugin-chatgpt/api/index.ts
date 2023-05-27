
import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000',
});

/* GET /chatgpt/connect */
export async function chatgptConnect(options?: { [key: string]: any }) {
    return request('/chatgpt/connect', {
      method: 'GET',
      params: options,
    });
}

export async function chatgptGenerate(options: any) {
  return request('/chatgpt/generate', {
    method: 'POST',
    data: options,
  });
}
