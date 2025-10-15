export function extractAllFilePathsAndContents(text: string) {
    // 全局正则表达式，匹配所有 boltAction 元素
    const regex = /<boltAction type="file" filePath="([^"]+)">([\s\S]*?)<\/boltAction>/g;
    
    const matches = [];
    let match: RegExpExecArray | null;
    
    // 使用循环获取所有匹配项
    match = regex.exec(text);
    while (match !== null) {
      matches.push({
        path: match[1],
        content: match[2].trim()
      });
      match = regex.exec(text);
    }
    
    return matches;
  }


  export function extractNpmInstall(text: string) {
    // 匹配 boltAction type="shell" 中的 npm install 命令
    const regex = /<boltAction type="shell">npm install\s+([^<]+)<\/boltAction>/;
    
    const match = text.match(regex);
    
    if (match && match[1]) {
      // 返回完整的 npm install 命令字符串
      return `npm install ${match[1].trim()}`.replace(' --yes', '');
    }
    
    return "";
  }
