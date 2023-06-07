import * as fsExtra from 'fs-extra';
import * as pathInstance from 'path';

export default class FsHandler {
  static _instance: FsHandler;

  static getInstance() {
    if (!this._instance) {
      this._instance = new FsHandler();
    }
    return this._instance;
  }
  parseFile(path: string) {
    const fileStr = fsExtra.readFileSync(pathInstance.join(path), 'utf8');
    return fileStr;
  }
  writeFile(path: string, content: string) {
    fsExtra.writeFileSync(path, content, 'utf8');
  }

  extractFileName(codeContent: string) {
    const exportName = codeContent.match(/export\s+default\s+(\w+)/)[1];
    console.log(exportName); // ApprovalForm
    return exportName;
  }

  createFile(path: string, content?: string) {
    fsExtra.ensureFileSync(path);
    if (content) this.writeFile(path, content);
  }
}
