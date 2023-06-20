export default class GlobalConfig {
  static _instance: GlobalConfig;
  appkey = '';

  static getInstance() {
    if (!this._instance) {
      this._instance = new GlobalConfig();
    }
    return this._instance;
  }

  setAppkey(appKey: string) {
    this.appkey = appKey;
  }
}
