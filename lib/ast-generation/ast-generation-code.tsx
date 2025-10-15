// AST 生成相关代码提取 - TypeScript 版本
// 来自 pl.js (完整版 - 类型安全)

import React, { ReactNode, createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { removeJSXElement, operateOnJSXElement, updateJSXElementAttributes, UpdateClassNameParams, UpdateTextContentParams, updateJSXElementText, isEditableTextOnlyElement } from './ast-operations-code';


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

/**
 * SandboxCode Context 值类型
 */
export interface SandboxCodeContextValue {
    syncCode: (options?: SyncCodeOptions) => Promise<Record<string, string>>;
    ast: ASTFile[];
    code: CodeFile[];
    generateAst: () => void;
    refreshPreview: () => void;
    startLiveMode: () => void;
    history: string[];
    setHistory: (history: string[]) => void;
    currentClassName: string | null;
    setCurrentClassName: (className: string | null) => void;
    addPendingChange: (filePath: string, content: string) => void;
    pendingChanges: Record<string, string>;
    hasUnsavedChanges: boolean;
    hasInitialCode: boolean;
    setFiles: (files: Record<string, string>) => void;
    files: Record<string, string>;
    removeJSXElementToSandbox: (element: ElementPosition) => void;
    handleUpdateClassName: (params: UpdateClassNameParams) => void;
    handleUpdateTextContent: (params: UpdateTextContentParams) => void;
    isEditableTextContentOnlyElement: (element: ElementPosition) => boolean;
}

/**
 * SandboxCodeProvider Props
 */
export interface SandboxCodeProviderProps {
    children: ReactNode;
}

// ===== 2. 核心AST生成函数 =====

/**
 * 主要的AST生成函数
 * 将代码文件列表解析为AST
 * @param files - 代码文件列表，格式为 [[filePath, content], ...]
 * @returns AST对象数组，格式为 [{filePath, ast}, ...]
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
                // 使用 Babel parser 解析代码 - 增强配置以支持现代语法
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
                // 解析失败时跳过该文件
                console.warn(`Failed to parse ${filePath}:`, error);
            }
        }
    });
    
    return results;
}

// 生成器配置选项类型
export interface GeneratorConfigOptions {
    compact?: boolean;
    retainLines?: boolean;
    retainFunctionParens?: boolean;
    preserveComments?: boolean;
    minified?: boolean;
    quotesStyle?: 'single' | 'double' | 'backtick';
}

// 统一的生成器配置函数
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

// 生成代码
export function generateCodeFromAST(ast: ASTFile[]): string {
    return ast.map(({ ast: fileAst, filePath }) => 
        generate(fileAst, createGeneratorOptions(filePath)).code
    ).join('\n');
}



// ===== 3. AST 操作函数 =====

/**
 * 更新JSX元素的文本内容
 * @param element - JSX元素节点
 * @param text - 新的文本内容
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
 * @param element - JSX元素节点
 * @param attributes - 属性对象 {attributeName: value}
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
 * @param node - AST节点
 * @returns 字符串值或null
 */
function getStringLiteralValue(node: t.Expression | t.JSXExpressionContainer): string | null {
    return t.isStringLiteral(node) ? node.value : null;
}

/**
 * 获取JSX元素的className属性值
 * @param element - JSX元素节点
 * @returns className值或null
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

// ===== 4. AST 查询函数 =====

/**
 * 检查元素是否为可编辑的文本元素
 * @param element - 元素对象 {filePath, lineNumber}
 * @param astList - AST列表
 * @returns 是否为可编辑文本元素
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
 * @param element - 元素对象 {filePath, lineNumber}
 * @param astList - AST列表
 * @param attributeName - 属性名
 * @returns 是否包含指定属性
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
 * @param lineNumber - 行号
 * @param filePath - 文件路径
 * @param astList - AST列表
 * @returns JSX元素节点或null
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
 * @param element - 元素对象 {filePath, lineNumber}
 * @param astList - AST列表
 * @returns className或null
 */
export function getElementClassName(element: ElementPosition, astList: ASTFile[]): string | null {
    const jsxElement = getJSXElementByLine(element.lineNumber, element.filePath, astList);
    return jsxElement ? getJSXClassName(jsxElement) : null;
}

// ===== 5. SandboxCodeProvider 实现 =====

/**
 * 创建 SandboxCode Context
 */
const SandboxCodeContext = createContext<SandboxCodeContextValue | null>(null);

/**
 * SandboxCodeProvider 组件
 * 管理代码状态、AST生成、WebSocket连接等
 */
export function SandboxCodeProvider({ children }: SandboxCodeProviderProps): React.JSX.Element {
    // 状态定义
    const [hasInitialCode, setHasInitialCode] = useState<boolean>(false);
    const [currentClassName, setCurrentClassName] = useState<string | null>(null);
    const [ast, setAst] = useState<ASTFile[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [isServerEnabled, setIsServerEnabled] = useState<boolean>(false);
    
    // WebSocket引用
    const websocketRef = useRef<WebSocket | null>(null);
    
    // 模拟的代码存储状态 (实际项目中应该从store获取)
    const [files, setFiles] = useState<Record<string, string>>({});
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [uploads, setUploads] = useState<FileUpload[]>([]);
    
    // 使用 ref 来存储 pendingChanges 的最新值
    const pendingChangesRef = useRef<Record<string, string>>({});
    
    // 确保 ref 和状态同步
    useEffect(() => {
        pendingChangesRef.current = pendingChanges;
    }, [pendingChanges]);
    
    // 代码文件列表
    const code = useMemo<CodeFile[]>(() => Object.entries(files), [files]);
    
    // 模拟的外部依赖函数
    const refreshPreview = useCallback(() => {
        console.log('Refreshing preview...');
    }, []);
    
    const websocketUrl = 'ws://localhost:3000/_sandbox/code/ws'; // 实际项目中动态获取
    
    // AST生成函数
    const generateAst = useCallback(() => {
        if (code.length > 0) {
            setAst(generateAstFromFiles(code));
        }
    }, [code]);
    
    // 初始化时生成AST
    useEffect(() => {
        generateAst();
    }, [generateAst]);
    
    // 启动Live Mode
    const startLiveMode = useCallback(() => {
        setIsServerEnabled(true);
    }, []);
    
    // WebSocket连接管理
    useEffect(() => {
        if (!isServerEnabled || !websocketUrl) {
            return;
        }
        
        websocketRef.current = new WebSocket(websocketUrl);
        
        websocketRef.current.onmessage = (event: MessageEvent) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                
                if (message.type === 'init_code') {
                    // 重置状态
                    setFiles({});
                    setHasInitialCode(true);
                    
                    // 设置文件内容
                    message.data.forEach(([filePath, content]) => {
                        setFiles(prev => ({ ...prev, [filePath]: content }));
                    });
                } else if (message.type === 'file_update') {
                    // 更新文件内容
                    message.data.forEach(([filePath, content]) => {
                        setFiles(prev => {
                            if (prev[filePath] !== content) {
                                return { ...prev, [filePath]: content };
                            }
                            return prev;
                        });
                    });
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };
        
        websocketRef.current.onclose = (event: CloseEvent) => {
            if (!event.wasClean) {
                console.error('Code WebSocket closed prematurely:', event);
            }
        };
        
        websocketRef.current.onerror = (error: Event) => {
            console.error('Code WebSocket error:', error);
        };
        
        return () => {
            websocketRef.current?.close();
            websocketRef.current = null;
        };
    }, [isServerEnabled, websocketUrl]);
    
    // 代码同步函数
    const syncCode = async (): Promise<Record<string, string>> => {
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const changes = pendingChangesRef.current;
        return changes;
    };
    
    // 添加待处理更改
    const addPendingChange = useCallback((filePath: string, content: string) => {
        setPendingChanges(prev => {
            const newPending = { ...prev, [filePath]: content };
            pendingChangesRef.current = newPending;
            return newPending;
        });
    }, []);


    
    // 检查是否有未保存的更改
    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

    const removeJSXElementToSandbox = useCallback((element: ElementPosition) => {
        removeJSXElement(element, ast, (filePath: string, content: string) => {
            addPendingChange(filePath, content);
        });
    }, [ast, addPendingChange]);

    const handleUpdateClassName = useCallback((params: UpdateClassNameParams) => {
        const { element, classObj, preview } = params;
         operateOnJSXElement(
            element,
            ast,
            (node) => {
                // 构建新的className
                const newClasses = classObj[0].value;
                
                updateJSXElementAttributes(node, { className: newClasses });
            },
            (filePath: any, content: string) => {
                addPendingChange(filePath, content);
            }
        );
    }, [ast, addPendingChange]);

    const handleUpdateTextContent = useCallback((params: UpdateTextContentParams) => {
        operateOnJSXElement(
            params.element,
            ast,
            (node) => {
                updateJSXElementText(node, params.textContent);
            },
            (filePath: any, content: string) => {
                addPendingChange(filePath, content);
            }
        );
    }, [ast, addPendingChange]);

    const isEditableTextContentOnlyElement = (element: ElementPosition): boolean => {
        // 如果 AST 为空，返回 false 并输出调试信息
        if (!ast || ast.length === 0) {
            console.warn('AST is empty when checking isEditableTextContentOnlyElement for:', element);
            return false;
        }
        
        // 检查 AST 中是否包含目标文件
        const hasTargetFile = ast.some(astFile => astFile.filePath === element.filePath);
        if (!hasTargetFile) {
            console.warn(`File ${element.filePath} not found in AST when checking isEditableTextContentOnlyElement`);
            return false;
        }
        
        return isEditableTextOnlyElement(element, ast);
    };
    
    // Context值
    const contextValue: SandboxCodeContextValue = {
        syncCode,
        ast,
        code,
        generateAst,
        refreshPreview,
        startLiveMode,
        history,
        setHistory,
        currentClassName,
        setCurrentClassName,
        addPendingChange,
        pendingChanges,
        hasUnsavedChanges,
        hasInitialCode,
        setFiles,
        files,
        removeJSXElementToSandbox,
        handleUpdateClassName,
        handleUpdateTextContent,
        isEditableTextContentOnlyElement
    };
    
    return (
        <SandboxCodeContext.Provider value={contextValue}>
            {children}
        </SandboxCodeContext.Provider>
    );
}

// ===== 6. useSandboxCode Hook =====

/**
 * useSandboxCode Hook
 * 提供SandboxCode相关的状态和方法
 */
export function useSandboxCode(): SandboxCodeContextValue {
    const context = useContext(SandboxCodeContext);
    if (!context) {
        throw new Error('useSandboxCode must be used within a SandboxCodeProvider');
    }
    return context;
}

// ===== 7. 导出的函数映射 =====

/**
 * AST生成和操作函数集合
 */
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

// ===== 9. 默认导出 =====

export default {
    SandboxCodeProvider,
    useSandboxCode,
    astGeneration,
}; 

// ===== 10. 配置示例和使用指南 =====

/**
 * 根据项目配置创建自定义生成器选项的示例
 * 
 * 基于你的TypeScript配置，推荐的配置选项：
 * - jsx: "react-jsx" -> 保持JSX语法
 * - target: "ES2020" -> 保持现代JavaScript特性
 * - module: "ESNext" -> 保持ES模块语法
 */

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