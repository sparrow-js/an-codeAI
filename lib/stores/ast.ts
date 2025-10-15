import { atom, map, computed, type MapStore, type WritableAtom } from 'nanostores';
import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { 
  removeJSXElement, 
  operateOnJSXElement, 
  updateJSXElementAttributes, 
  updateJSXElementText, 
  isEditableTextOnlyElement,
  type UpdateClassNameParams,
  type UpdateTextContentParams
} from '@/lib/ast-generation/ast-operations-code';

// ===== 1. 类型定义 =====

/**
 * 代码文件元组类型
 * [文件路径, 文件内容]
 */
export type CodeFile = [string, string];

/**
 * AST文件对象
 */
export interface ASTFile {
  filePath: string;
  ast: t.File;
}

/**
 * 元素位置信息
 */
export interface ElementPosition {
  filePath: string;
  lineNumber: number;
}

/**
 * JSX属性对象
 */
export interface JSXAttributes {
  [key: string]: string;
}

/**
 * WebSocket消息类型
 */
export interface WebSocketMessage {
  type: 'init_code' | 'file_update';
  data: CodeFile[];
}

/**
 * 代码同步选项
 */
export interface SyncCodeOptions {
  commitMessage?: string;
}

/**
 * 文件上传信息
 */
export interface FileUpload {
  dir_name: string;
  file_name: string;
  id: string;
  type: string;
}

/**
 * 上传响应
 */
export interface UploadResponse {
  download_url: string;
  file_id: string;
}

/**
 * 代码更改
 */
export interface CodeChange {
  path: string;
  content: string;
}

/**
 * 编辑代码请求
 */
export interface EditCodeRequest {
  changes: CodeChange[];
  uploads: UploadResponse[];
  commit_message: string | null;
}

// ===== 2. 生成器配置选项 =====

export interface GeneratorConfigOptions {
  compact?: boolean;
  retainLines?: boolean;
  retainFunctionParens?: boolean;
  preserveComments?: boolean;
  minified?: boolean;
  quotesStyle?: 'single' | 'double' | 'backtick';
}

// ===== 3. 核心AST生成函数 =====

/**
 * 主要的AST生成函数
 * 将代码文件列表解析为AST
 */
export function generateAstFromFiles(files: CodeFile[]): ASTFile[] {
  const results: ASTFile[] = [];
  
  files.forEach(([filePath, content]) => {
    // 只处理 TypeScript/JavaScript/JSX 文件
    const isSupportedFile = filePath.endsWith('.tsx') || 
                           filePath.endsWith('.ts') || 
                           filePath.endsWith('.jsx') || 
                           filePath.endsWith('.js');
    
    if (isSupportedFile) {
      try {
        const parserOptions: ParserOptions = {
          sourceFilename: filePath,
          sourceType: 'module',
          plugins: [
            'jsx',
            'typescript',
            'decorators-legacy',
            'classProperties',
            'objectRestSpread',
            'functionBind',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'dynamicImport',
            'nullishCoalescingOperator',
            'optionalChaining',
            'logicalAssignment',
            'numericSeparator',
            'optionalCatchBinding',
            'throwExpressions',
            'topLevelAwait',
            'importMeta',
            'privateIn',
            'classStaticBlock'
          ],
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          allowUndeclaredExports: true,
          attachComment: true,
          strictMode: false,
          ranges: true,
          tokens: true
        };
        
        const ast = parse(content, parserOptions);
        
        results.push({
          filePath,
          ast
        });
      } catch (error) {
        console.warn(`Failed to parse ${filePath}:`, error);
      }
    }
  });
  
  return results;
}

/**
 * 统一的生成器配置函数
 */
export function createGeneratorOptions(filePath: string, options: GeneratorConfigOptions = {}) {
  const {
    compact = false,
    retainLines = true,
    retainFunctionParens = true,
    preserveComments = true,
    minified = false,
    quotesStyle = 'single'
  } = options;

  return {
    compact,
    retainLines,
    retainFunctionParens,
    shouldPrintComment: preserveComments ? () => true : undefined,
    sourceFileName: filePath,
    minified,
    jsescOption: {
      minimal: true,
      quotes: quotesStyle
    }
  };
}

/**
 * 生成代码
 */
export function generateCodeFromAST(ast: ASTFile[]): string {
  return ast.map(({ ast: fileAst, filePath }) => 
    generate(fileAst, createGeneratorOptions(filePath)).code
  ).join('\n');
}

// ===== 4. AST 操作函数 =====

/**
 * 更新JSX元素的文本内容
 */
export function updateJSXText(element: t.JSXElement, text: string): void {
  const textNode = element.children.find((child): child is t.JSXText => 
    t.isJSXText(child)
  );
  
  if (textNode) {
    textNode.value = text;
  } else {
    element.children.unshift(t.jsxText(text));
  }
}

/**
 * 更新JSX元素的属性
 */
export function updateJSXAttributes(element: t.JSXElement, attributes: JSXAttributes): void {
  Object.keys(attributes).forEach(attributeName => {
    // 先移除已存在的同名属性
    element.openingElement.attributes = element.openingElement.attributes.filter(attr => {
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        return attr.name.name !== attributeName;
      }
      return true;
    });
    
    // 添加新属性
    element.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier(attributeName), 
        t.stringLiteral(attributes[attributeName])
      )
    );
  });
}

/**
 * 获取字符串字面量的值
 */
function getStringLiteralValue(node: t.Expression | t.JSXExpressionContainer): string | null {
  return t.isStringLiteral(node) ? node.value : null;
}

/**
 * 获取JSX元素的className属性值
 */
export function getJSXClassName(element: t.JSXElement): string | null {
  const classNameAttr = element.openingElement.attributes.find(attr => 
    t.isJSXAttribute(attr) && 
    t.isJSXIdentifier(attr.name) && 
    attr.name.name === 'className'
  ) as t.JSXAttribute | undefined;
  
  if (!classNameAttr || !classNameAttr.value) {
    return '';
  }
  
  return getStringLiteralValue(classNameAttr.value as t.Expression);
}

// ===== 5. AST 查询函数 =====

/**
 * 检查元素是否为可编辑的文本元素
 */
export function isEditableTextElement(element: ElementPosition, astList: ASTFile[]): boolean {
  const astFile = astList.find(file => file.filePath === element.filePath);
  if (!astFile) {
    return false;
  }
  
  let isEditable = false;
  
  const visitor = {
    JSXElement(path: any) {
      const node = path.node;
      if (node.loc?.start.line === element.lineNumber && t.isJSXElement(node)) {
        const children = node.children;
        isEditable = children.length === 1 && t.isJSXText(children[0]);
        path.stop();
      }
    }
  };
  
  traverse(astFile.ast, visitor);
  return isEditable;
}

/**
 * 检查元素是否包含指定属性
 */
export function hasJSXAttribute(
  element: ElementPosition, 
  astList: ASTFile[], 
  attributeName: string
): boolean {
  const astFile = astList.find(file => file.filePath === element.filePath);
  if (!astFile) {
    return false;
  }
  
  let hasAttribute = false;
  
  const visitor = {
    JSXElement(path: any) {
      const node = path.node;
      if (node.loc?.start.line === element.lineNumber && t.isJSXElement(node)) {
        hasAttribute = node.openingElement.attributes.some(attr => {
          return t.isJSXAttribute(attr) && 
                 t.isStringLiteral(attr.value) && 
                 t.isJSXIdentifier(attr.name) &&
                 attr.name.name === attributeName;
        });
        path.stop();
      }
    }
  };
  
  traverse(astFile.ast, visitor);
  return hasAttribute;
}

/**
 * 根据行号和文件路径获取JSX元素
 */
export function getJSXElementByLine(
  lineNumber: number, 
  filePath: string, 
  astList: ASTFile[]
): t.JSXElement | null {
  const astFile = astList.find(file => file.filePath === filePath);
  if (!astFile) {
    return null;
  }
  
  let foundElement: t.JSXElement | null = null;
  
  const visitor = {
    JSXElement(path: any) {
      const node = path.node;
      if (node.loc?.start.line === lineNumber) {
        foundElement = node;
        path.stop();
      }
    }
  };
  
  traverse(astFile.ast, visitor);
  return foundElement;
}

/**
 * 获取元素的className
 */
export function getElementClassName(element: ElementPosition, astList: ASTFile[]): string | null {
  const jsxElement = getJSXElementByLine(element.lineNumber, element.filePath, astList);
  return jsxElement ? getJSXClassName(jsxElement) : null;
}

// ===== 6. AST Store 类 =====

export class ASTStore {
  // 私有属性
  #websocketRef: WebSocket | null = null;
  #pendingChangesRef: Record<string, string> = {};

  // 公共状态
  hasInitialCode: WritableAtom<boolean> = atom(false);
  currentClassName: WritableAtom<string | null> = atom(null);
  ast: WritableAtom<ASTFile[]> = atom([]);
  history: WritableAtom<string[]> = atom([]);
  isServerEnabled: WritableAtom<boolean> = atom(false);
  files: MapStore<Record<string, string>> = map({});
  pendingChanges: MapStore<Record<string, string>> = map({});
  uploads: WritableAtom<FileUpload[]> = atom([]);

  // 计算属性
  code = computed([this.files], (files) => Object.entries(files) as CodeFile[]);
  hasUnsavedChanges = computed([this.pendingChanges], (pendingChanges) => 
    Object.keys(pendingChanges).length > 0
  );

  constructor() {
    // 监听 code 变化自动生成 AST
    this.code.subscribe((code) => {
      if (code.length > 0) {
        this.generateAst();
      }
    });

    // 监听 pendingChanges 变化同步到 ref
    this.pendingChanges.subscribe((changes) => {
      this.#pendingChangesRef = changes;
    });
  }

  // ===== 核心方法 =====

  /**
   * 生成AST
   */
  generateAst(): void {
    const code = this.code.get();
    if (code.length > 0) {
      this.ast.set(generateAstFromFiles(code));
    }
  }

  /**
   * 启动Live Mode
   */
  startLiveMode(): void {
    this.isServerEnabled.set(true);
    this.#initWebSocket();
  }

  /**
   * 刷新预览
   */
  refreshPreview(): void {
    console.log('Refreshing preview...');
  }

  /**
   * 代码同步
   */
  async syncCode(options: SyncCodeOptions = {}): Promise<Record<string, string>> {
    await new Promise(resolve => setTimeout(resolve, 0));
    return this.#pendingChangesRef;
  }

  /**
   * 添加待处理更改
   */
  addPendingChange(filePath: string, content: string): void {
    const currentPending = this.pendingChanges.get();
    const newPending = { ...currentPending, [filePath]: content };
    this.pendingChanges.set(newPending);
  }

  /**
   * 设置文件内容
   */
  setFiles(files: Record<string, string>): void {
    this.files.set(files);
  }

  /**
   * 设置历史记录
   */
  setHistory(history: string[]): void {
    this.history.set(history);
  }

  /**
   * 设置当前类名
   */
  setCurrentClassName(className: string | null): void {
    this.currentClassName.set(className);
  }

  // ===== JSX 操作方法 =====

  /**
   * 删除JSX元素
   */
  removeJSXElementToSandbox(element: ElementPosition): void {
    const ast = this.ast.get();
    removeJSXElement(element, ast, (filePath: string, content: string) => {
      this.addPendingChange(filePath, content);
    });
  }

  /**
   * 更新类名
   */
  handleUpdateClassName(params: UpdateClassNameParams): void {
    const { element, classObj } = params;
    const ast = this.ast.get();
    
    operateOnJSXElement(
      element,
      ast,
      (node) => {
        const newClasses = classObj[0].value;
        updateJSXElementAttributes(node, { className: newClasses });
      },
      (filePath: string, content: string) => {
        this.addPendingChange(filePath, content);
      }
    );
  }

  /**
   * 更新文本内容
   */
  handleUpdateTextContent(params: UpdateTextContentParams): void {
    const ast = this.ast.get();
    
    operateOnJSXElement(
      params.element,
      ast,
      (node) => {
        updateJSXElementText(node, params.textContent);
      },
      (filePath: string, content: string) => {
        this.addPendingChange(filePath, content);
      }
    );
  }

  /**
   * 检查是否为可编辑的文本元素
   */
  isEditableTextContentOnlyElement(element: ElementPosition): boolean {
    const ast = this.ast.get();
    
    if (!ast || ast.length === 0) {
      console.warn('AST is empty when checking isEditableTextContentOnlyElement for:', element);
      return false;
    }
    
    const hasTargetFile = ast.some(astFile => astFile.filePath === element.filePath);
    if (!hasTargetFile) {
      console.warn(`File ${element.filePath} not found in AST when checking isEditableTextContentOnlyElement`);
      return false;
    }
    
    return isEditableTextOnlyElement(element, ast);
  }

  // ===== 私有方法 =====

  /**
   * 初始化WebSocket连接
   */
  #initWebSocket(): void {
    if (!this.isServerEnabled.get()) {
      return;
    }

    const websocketUrl = 'ws://localhost:3000/_sandbox/code/ws';
    this.#websocketRef = new WebSocket(websocketUrl);
    
    this.#websocketRef.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'init_code') {
          this.files.set({});
          this.hasInitialCode.set(true);
          
          const newFiles: Record<string, string> = {};
          message.data.forEach(([filePath, content]) => {
            newFiles[filePath] = content;
          });
          this.files.set(newFiles);
          
        } else if (message.type === 'file_update') {
          const currentFiles = this.files.get();
          const updatedFiles = { ...currentFiles };
          
          message.data.forEach(([filePath, content]) => {
            if (updatedFiles[filePath] !== content) {
              updatedFiles[filePath] = content;
            }
          });
          
          this.files.set(updatedFiles);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    this.#websocketRef.onclose = (event: CloseEvent) => {
      if (!event.wasClean) {
        console.error('Code WebSocket closed prematurely:', event);
      }
    };
    
    this.#websocketRef.onerror = (error: Event) => {
      console.error('Code WebSocket error:', error);
    };
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.hasInitialCode.set(false);
    this.currentClassName.set(null);
    this.ast.set([]);
    this.history.set([]);
    this.isServerEnabled.set(false);
    this.files.set({});
    this.pendingChanges.set({});
    this.uploads.set([]);
    
    if (this.#websocketRef) {
      this.#websocketRef.close();
      this.#websocketRef = null;
    }
  }
}

// ===== 7. 配置常量 =====

// 示例1: 保持源代码格式的配置（推荐）
export const PRESERVE_SOURCE_FORMAT_CONFIG: GeneratorConfigOptions = {
  compact: false,
  retainLines: true,
  retainFunctionParens: true,
  preserveComments: true,
  minified: false,
  quotesStyle: 'single'
};

// 示例2: 紧凑格式的配置
export const COMPACT_FORMAT_CONFIG: GeneratorConfigOptions = {
  compact: true,
  retainLines: false,
  retainFunctionParens: false,
  preserveComments: false,
  minified: true,
  quotesStyle: 'double'
};

// 示例3: 开发环境配置
export const DEVELOPMENT_CONFIG: GeneratorConfigOptions = {
  compact: false,
  retainLines: true,
  retainFunctionParens: true,
  preserveComments: true,
  minified: false,
  quotesStyle: 'single'
};

// 示例4: 生产环境配置
export const PRODUCTION_CONFIG: GeneratorConfigOptions = {
  compact: true,
  retainLines: false,
  retainFunctionParens: false,
  preserveComments: false,
  minified: true,
  quotesStyle: 'double'
};

// ===== 8. 导出的函数映射 =====

export const astGeneration = {
  // 核心AST生成函数
  generateAstFromFiles,
  generateCodeFromAST,
  createGeneratorOptions,
  
  // AST操作函数
  updateJSXText,
  updateJSXAttributes,
  getJSXClassName,
  
  // AST查询函数
  hasJSXAttribute,
  
  // 辅助函数
  isEditableTextElement,
  getJSXElementByLine,
  getElementClassName
} as const; 
