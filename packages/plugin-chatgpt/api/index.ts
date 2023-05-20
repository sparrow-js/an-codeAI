
import axios from 'axios';

/* GET /chatgpt/connect */
export async function chatgptConnect(options?: { [key: string]: any }) {
    return axios('/chatgpt/connect', {
      method: 'GET',
      ...(options || {}),
    });
}

export async function chatgptGenerate(options: any) {
  return axios('/chatgpt/generate', {
    method: 'GET',
    ...(options || {}),
  });
}
