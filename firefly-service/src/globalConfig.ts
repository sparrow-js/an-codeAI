import lowdb from './utils/lowdb';
import { ISetting } from './types';

export default class GlobalConfig {
  static _instance: GlobalConfig;
  _apikey: string | null = null;
  _systemMessage: string;
  _proxyUrl: string;
  codeMapToProjectDir = {
    page: 'src/pages',
    store: 'src/stores',
    api: 'src/api',
    router: 'src/routes',
  };

  static getInstance() {
    if (!this._instance) {
      this._instance = new GlobalConfig();
    }
    return this._instance;
  }

  get apikey() {
    if (this._apikey === null) {
      const data = this.getSetting();
      this.updateSetting(data);
    }
    return this._apikey;
  }

  get systemMessage() {
    if (this._systemMessage === null) {
      const data = this.getSetting();
      this.updateSetting(data);
    }
    return this._systemMessage;
  }

  get proxyUrl() {
    if (this._proxyUrl === null) {
      const data = this.getSetting();
      this.updateSetting(data);
    }
    return this._proxyUrl;
  }

  getSetting() {
    return lowdb.get('setting').value();
  }

  updateSetting(data: ISetting) {
    const { apiKey, systemMessage, proxyUrl } = data;
    this._apikey = apiKey;
    this._systemMessage = systemMessage;
    this._proxyUrl = proxyUrl;
  }
}
