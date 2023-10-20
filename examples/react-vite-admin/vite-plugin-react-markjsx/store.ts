interface Data {
    oldUidToOriginUid: any;
}


export default class Store {
    private static _instance: Store;
    _data: Data = {
        oldUidToOriginUid: {},
    };

    static getInstance(): Store {
       if (!this._instance) {
            this._instance = new Store();
       }
       return this._instance;
    }

    addUidMap(oldUid: string, originUid: string) {
        this._data.oldUidToOriginUid[oldUid] = originUid;
    }

    clearEmptyUidMap() {
        this._data.oldUidToOriginUid = {};
    }

    getOldUidToOriginUid() {
        return this._data.oldUidToOriginUid;
    }
}