import * as fsExtra from 'fs-extra';
import * as pathInstance from 'path';
import * as prettier from 'prettier';
import parserTs from 'prettier/parser-typescript';

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
  writeFile(path: string, content: string, isFormat?: boolean) {
    const formatCode = isFormat
      ? prettier.format(content, {
          semi: true,
          parser: 'typescript',
        })
      : content;
    fsExtra.writeFileSync(path, formatCode, 'utf8');
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
