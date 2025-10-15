// AST 操作相关代码提取 - TypeScript 版本
// 来自 pl.js 中与 AST 操作、编辑、查询相关的功能

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { parse, ParserOptions } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { createGeneratorOptions, GeneratorConfigOptions } from '@/lib/stores/ast';

// ===== 类型定义 =====

/**
 * 元素位置信息
 */
export interface ElementPosition {
    filePath: string;
    lineNumber: number;
}

/**
 * AST文件对象
 */
export interface ASTFile {
    filePath: string;
    ast: t.File;
}

/**
 * 代码文件元组
 */
export type CodeFile = [string, string];

/**
 * JSX元素操作回调函数类型
 */
export type JSXElementCallback = (node: t.JSXElement, path: any) => void;

/**
 * 类名操作对象
 */
export interface ClassObject {
    property: string;
    value: string;
    variants?: Array<{
        kind: string;
        type: string;
        value: string;
    }>;
}

/**
 * 更新文本内容参数
 */
export interface UpdateTextContentParams {
    element: ElementPosition;
    textContent: string;
}

/**
 * 更新类名参数
 */
export interface UpdateClassNameParams {
    element: ElementPosition;
    classObj: ClassObject[];
    preview?: boolean;
}

/**
 * 高级更新类名参数
 */
export interface UpdateClassNameAdvancedParams {
    element: ElementPosition;
    className: string;
    reset?: boolean;
}

// ===== 1. 核心 AST 操作函数 =====

/**
 * 通用的 JSX 元素操作函数
 * 根据元素位置查找并操作对应的 JSX 元素
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @param callback - 对找到的JSX元素执行的回调函数
 * @param addPendingChange - 添加待处理更改的函数
 * @returns 是否成功找到并操作了元素
 */
export function operateOnJSXElement(
    element: ElementPosition,
    astList: ASTFile[],
    callback: JSXElementCallback,
    addPendingChange: (filePath: string, content: string) => void
): boolean {
    const astFile = astList.find(file => file.filePath === element.filePath);
    if (!astFile) {
        console.error("Node not found", { element });
        return false;
    }

    let elementFound = false;

    traverse(astFile.ast, {
        JSXElement(path) {
            const node = path.node;
            if (node.loc?.start.line === element.lineNumber) {
                callback(node, path);
                elementFound = true;
                path.stop();
            }
        }
    });

    if (!elementFound) {
        return false;
    }

    // 生成更新后的代码 - 使用统一的配置
    const generatedCode = generate(astFile.ast, createGeneratorOptions(astFile.filePath), undefined).code;
    
    // For now, we'll use a placeholder - replace this with actual code generation
    // const generatedCode = '/* Generated code will be here - configure @babel/generator */';

    addPendingChange(astFile.filePath, generatedCode);
    return true;
}





// ===== 2. JSX 元素操作函数 =====

/**
 * 更新JSX元素的文本内容
 * @param element - JSX元素节点
 * @param text - 新的文本内容
 */
export function updateJSXElementText(element: t.JSXElement, text: string): void {
    const textChild = element.children.find((child): child is t.JSXText => 
        t.isJSXText(child)
    );
    
    if (textChild) {
        textChild.value = text;
    } else {
        element.children.unshift(t.jsxText(text));
    }
}

/**
 * 更新JSX元素的属性
 * @param element - JSX元素节点
 * @param attributes - 属性对象 {attributeName: value}
 */
export function updateJSXElementAttributes(
    element: t.JSXElement, 
    attributes: Record<string, string>
): void {
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
export function getJSXElementClassName(element: t.JSXElement): string | null {
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

// ===== 3. AST 查询函数 =====

/**
 * 检查元素是否为可编辑的文本元素
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @returns 是否为可编辑文本元素
 */
export function isEditableTextElement(element: ElementPosition, astList: ASTFile[]): boolean {
    const astFile = astList.find(file => file.filePath === element.filePath);
    if (!astFile) {
        return false;
    }
    
    let isEditable = false;
    
    traverse(astFile.ast, {
        JSXElement(path) {
            const node = path.node;
            if (node.loc?.start.line === element.lineNumber && t.isJSXElement(node)) {
                const children = node.children;
                isEditable = children.length === 1 && t.isJSXText(children[0]);
                path.stop();
            }
        }
    });
    
    return isEditable;
}

/**
 * 检查元素是否包含指定属性
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @param attributeName - 属性名
 * @returns 是否包含指定属性
 */
export function hasJSXElementAttribute(
    element: ElementPosition, 
    astList: ASTFile[], 
    attributeName: string
): boolean {
    const astFile = astList.find(file => file.filePath === element.filePath);
    if (!astFile) {
        return false;
    }
    
    let hasAttribute = false;
    
    traverse(astFile.ast, {
        JSXElement(path) {
            const node = path.node;
            if (node.loc?.start.line === element.lineNumber && t.isJSXElement(node)) {
                hasAttribute = node.openingElement.attributes.some(attr => {
                    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                        return attr.name.name === attributeName && t.isStringLiteral(attr.value);
                    }
                    return false;
                });
                path.stop();
            }
        }
    });
    
    return hasAttribute;
}

/**
 * 根据行号和文件路径获取JSX元素
 * @param lineNumber - 行号
 * @param filePath - 文件路径
 * @param astList - AST列表
 * @returns JSX元素节点或null
 */
export function getJSXElementByLineAndFile(
    lineNumber: number, 
    filePath: string, 
    astList: ASTFile[]
): t.JSXElement | null {
    const astFile = astList.find(file => file.filePath === filePath);
    if (!astFile) {
        return null;
    }
    
    let foundElement: t.JSXElement | null = null;
    
    traverse(astFile.ast, {
        JSXElement(path) {
            const node = path.node;
            if (node.loc?.start.line === lineNumber) {
                foundElement = node;
                path.stop();
            }
        }
    });
    
    return foundElement;
}

/**
 * 根据行号和文件路径获取JSX元素的源码字符串
 * @param lineNumber - 行号
 * @param filePath - 文件路径
 * @param astList - AST列表
 * @returns JSX元素的源码字符串或null
 */
export function getJSXElementCodeByLineAndFile(
    lineNumber: number,
    filePath: string,
    astList: ASTFile[]
): string | null {
    const element = getJSXElementByLineAndFile(lineNumber, filePath, astList);
    if (!element) return null;
    // @ts-ignore
    if (typeof generate === "function") {
        // If generate is available in scope
        return generate(element).code;
    }
    return null;
}



/**
 * 获取元素的className
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @returns className或null
 */
export function getElementClassName(element: ElementPosition, astList: ASTFile[]): string | null {
    const jsxElement = getJSXElementByLineAndFile(element.lineNumber, element.filePath, astList);
    return jsxElement ? getJSXElementClassName(jsxElement) : null;
}

// ===== 4. 高级 AST 操作函数 =====

/**
 * 删除JSX元素
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @param addPendingChange - 添加待处理更改的函数
 * @returns 是否成功删除
 */
export function removeJSXElement(
    element: ElementPosition,
    astList: ASTFile[],
    addPendingChange: (filePath: string, content: string) => void
): boolean {
    return operateOnJSXElement(
        element,
        astList,
        (node, path) => {
            path.remove();
        },
        addPendingChange
    );
}

/**
 * 复制JSX元素
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @param addPendingChange - 添加待处理更改的函数
 * @returns 是否成功复制
 */
export function duplicateJSXElement(
    element: ElementPosition,
    astList: ASTFile[],
    addPendingChange: (filePath: string, content: string) => void
): boolean {
    return operateOnJSXElement(
        element,
        astList,
        (node, path) => {
            const clonedNode = t.cloneNode(node, true);
            if (path.isJSXElement() && path.parentPath) {
                if (t.isJSXElement(path.parent) || t.isJSXFragment(path.parent)) {
                    const parent = path.parent;
                    const index = parent.children.indexOf(node);
                    if (index !== -1) {
                        parent.children.splice(index + 1, 0, clonedNode);
                    }
                }
            }
        },
        addPendingChange
    );
}

/**
 * 检查元素是否为纯文本可编辑元素
 * 只有当元素下面全是文本节点时才可以编辑
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @returns 是否为纯文本可编辑元素
 */
export function isEditableTextOnlyElement(element: ElementPosition, astList: ASTFile[]): boolean {
    const astFile = astList.find(file => file.filePath === element.filePath);
    if (!astFile) {
        return false;
    }
    
    let isEditable = false;
    
    traverse(astFile.ast, {
        JSXElement(path) {
            const node = path.node;
            if (node.loc?.start.line === element.lineNumber && t.isJSXElement(node)) {
                const children = node.children;
                
                // 检查是否有子节点
                if (children.length === 0) {
                    isEditable = false;
                } else {
                    // 检查所有子节点是否都是文本节点
                    isEditable = children.every(child => 
                        t.isJSXText(child) && child.value.trim().length > 0
                    );
                }
                path.stop();
            }
        }
    });
    
    return isEditable;
}

// ===== 5. Hook: 使用AST操作 =====

/**
 * 使用AST操作的Hook
 * 提供各种AST操作方法
 */
export function useASTOperations() {
    // 这里应该从context获取，暂时模拟
    const astList: ASTFile[] = [];
    const addPendingChange = useCallback((filePath: string, content: string) => {
        console.log('Adding pending change:', filePath);
    }, []);

    const handleTextChange = useCallback((element: ElementPosition, newText: string) => {
        operateOnJSXElement(
            element,
            astList,
            (node) => {
                updateJSXElementText(node, newText);
            },
            addPendingChange
        );
    }, [astList, addPendingChange]);

    const handleRemoveNode = useCallback((element: ElementPosition) => {
        removeJSXElement(element, astList, addPendingChange);
    }, [astList, addPendingChange]);

    const handleDuplicateNode = useCallback((element: ElementPosition) => {
        duplicateJSXElement(element, astList, addPendingChange);
    }, [astList, addPendingChange]);

    const handleImageChange = useCallback((
        element: ElementPosition, 
        imageUrl: string, 
        downloadUrl?: string
    ) => {
        operateOnJSXElement(
            element,
            astList,
            (node) => {
                updateJSXElementAttributes(node, { src: imageUrl });
            },
            addPendingChange
        );
    }, [astList, addPendingChange]);

    const initializeClassName = useCallback((element: ElementPosition, astList: ASTFile[]) => {
        // 初始化className的逻辑
        const className = getElementClassName(element, astList);
        console.log('Initialize className:', className);
    }, []);

    const handleUpdateClassName = useCallback((params: UpdateClassNameParams) => {
        const { element, classObj, preview } = params;
        
        operateOnJSXElement(
            element,
            astList,
            (node) => {
                // 构建新的className
                const newClasses = classObj.map(obj => {
                    if (obj.variants && obj.variants.length > 0) {
                        const variants = obj.variants.map(v => v.value).join(':');
                        return `${variants}:${obj.value}`;
                    }
                    return obj.value;
                }).join(' ');
                
                updateJSXElementAttributes(node, { className: newClasses });
            },
            preview ? () => {} : addPendingChange // 预览模式不添加待处理更改
        );
    }, [astList, addPendingChange]);

    const handleUpdateClassNameAdvanced = useCallback((params: UpdateClassNameAdvancedParams) => {
        const { element, className, reset } = params;
        
        operateOnJSXElement(
            element,
            astList,
            (node) => {
                if (reset) {
                    // 重置所有样式相关属性
                    node.openingElement.attributes = node.openingElement.attributes.filter(attr => {
                        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                            return !['className', 'style'].includes(attr.name.name);
                        }
                        return true;
                    });
                }
                
                if (className) {
                    updateJSXElementAttributes(node, { className });
                }
            },
            addPendingChange
        );
    }, [astList, addPendingChange]);

    const undoLastOperation = useCallback(() => {
        console.log('Undo last operation - implementation needed');
        // 这里需要实现撤销功能
    }, []);

    return {
        handleTextChange,
        handleRemoveNode,
        handleDuplicateNode,
        handleImageChange,
        initializeClassName,
        handleUpdateClassName,
        handleUpdateClassNameAdvanced,
        undoLastOperation
    };
}

// ===== 6. 辅助工具函数 =====

/**
 * 清理和标准化文本内容
 * @param text - 原始文本
 * @returns 清理后的文本
 */
export function cleanTextContent(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * 检查元素类型
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @returns 元素类型字符串
 */
export function getElementType(element: ElementPosition, astList: ASTFile[]): string | null {
    const jsxElement = getJSXElementByLineAndFile(element.lineNumber, element.filePath, astList);
    if (!jsxElement) return null;
    
    if (t.isJSXIdentifier(jsxElement.openingElement.name)) {
        return jsxElement.openingElement.name.name;
    }
    
    return null;
}

/**
 * 获取元素的所有属性
 * @param element - 元素位置信息
 * @param astList - AST列表
 * @returns 属性对象
 */
export function getElementAttributes(element: ElementPosition, astList: ASTFile[]): Record<string, string> | null {
    const jsxElement = getJSXElementByLineAndFile(element.lineNumber, element.filePath, astList);
    if (!jsxElement) return null;
    
    const attributes: Record<string, string> = {};
    
    jsxElement.openingElement.attributes.forEach(attr => {
        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.value) {
            const value = getStringLiteralValue(attr.value as t.Expression);
            if (value !== null) {
                attributes[attr.name.name] = value;
            }
        }
    });
    
    return attributes;
}

// ===== 7. 导出的操作函数映射 =====

/**
 * AST操作函数集合
 */
export const astOperations = {
    // 核心操作
    operateOnJSXElement,
    
    // JSX元素操作
    updateText: updateJSXElementText,
    updateAttributes: updateJSXElementAttributes,
    getClassName: getJSXElementClassName,
    
    // 查询函数
    isEditableText: isEditableTextElement,
    isEditableTextOnly: isEditableTextOnlyElement,
    hasAttribute: hasJSXElementAttribute,
    getElementByLine: getJSXElementByLineAndFile,
    getElementClassName,
    
    // 高级操作
    removeElement: removeJSXElement,
    duplicateElement: duplicateJSXElement,
    
    // 辅助函数
    cleanText: cleanTextContent,
    getElementType,
    getElementAttributes
} as const;

// ===== 8. 默认导出 =====

export default {
    astOperations,
    useASTOperations,
    // 常用操作的快捷方式
    operations: {
        text: {
            update: updateJSXElementText,
            clean: cleanTextContent,
            isEditable: isEditableTextElement,
            isEditableTextOnly: isEditableTextOnlyElement
        },
        attributes: {
            update: updateJSXElementAttributes,
            get: getElementAttributes,
            has: hasJSXElementAttribute
        },
        element: {
            remove: removeJSXElement,
            duplicate: duplicateJSXElement,
            getType: getElementType,
            getClassName: getElementClassName
        }
    }
}; 