import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
});
/**
 *
 * @param options
 * @returns
 * 同步uid映射到服务端
 */
export async function syncNodeIdMap(options?: { [uid: string]: string }) {
    return request('/edit/syncNodeIdMap', {
      method: 'POST',
      data: options,
    });
}