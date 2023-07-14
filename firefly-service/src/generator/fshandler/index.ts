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

  readFileSync(path: string) {
    const fileStr = fsExtra.readFileSync(pathInstance.join(path), 'utf8');
    return fileStr;
  }

  writeFile(path: string, content: string, isFormat?: boolean) {
    // const options = prettier.resolveConfig.sync(); // 使用默认配置
    const formatCode = isFormat ? prettier.format(content) : content;
    fsExtra.writeFileSync(path, formatCode, 'utf8');
  }

  extractFileName(codeContent: string) {
    const exportName = codeContent.match(/export\s+default\s+(\w+)/)[1];
    console.log(exportName); // ApprovalForm
    return exportName;
  }

  createFile(path: string, content?: string) {
    fsExtra.ensureFileSync(path);
    const code = this.parseMackdownCode(content)[0];
    if (code) this.writeFile(path, code);
  }

  parseMackdownCode(markdown: string): Array<string> {
    const regex = /```[\w]*\n([\s\S]*?)\n```/g;
    let match = regex.exec(markdown);
    const codeList = [];
    while (match !== null) {
      const code = match[1];
      match = regex.exec(markdown);
      console.log(code);
      codeList.push(code);
    }
    return codeList;
  }

  codeCategorizeParse(markdown: string): Array<{ type: string; code: string }> {
    const codeList = this.parseMackdownCode(markdown);
    return codeList.reduce((prev, code) => {
      const regex = /(api|mock|store|page|block|component).ts/g;
      const regexOther = /\/\/\s*(\S+).ts/g;
      let match = regex.exec(code);
      if (!match) {
        match = regexOther.exec(code);
      }
      const categorize = match[1];
      if (categorize) {
        prev.push({
          categorize,
          code,
        });
      }
      return prev;
    }, []);
  }

  codeMapToFile() {

  }
}
