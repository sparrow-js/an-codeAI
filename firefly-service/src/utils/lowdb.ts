import Lowdb = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
import path = require('path');

const db = new Lowdb(new FileSync('lowdb.json'));

db.defaults({
  setting: {
    systemMessage: '',
    apiKey: '',
    proxyUrl: '',
  },
}).write();

export default db;
