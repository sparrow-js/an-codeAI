import React, { useState, useCallback, useEffect, useMemo, useRef, use } from 'react';
import { Type, Image, Square, Link, Box, HelpCircle, Edit3, LocateFixed, X, Trash2, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseColor, rgbaToHex } from '@/lib/colorUtils';
import { Button } from '@/components/shadui/button';
import { Input } from '@/components/shadui/input';
import { Textarea } from '@/components/shadui/textarea';
import { Label } from '@/components/shadui/label';
import { Card, CardContent } from '@/components/shadui/card';
import { ColorPicker } from '@/components/shadui/color-picker';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/shadui/select';
import { MessageTypes, useIframeMessaging } from '@/components/VisualEditor/VisualEditing/VisualEditingUtils';
import { useVisualEditing } from '@/components/VisualEditor/hooks/useVisualEditing';
import { astStore } from '@/lib/stores';
import { workbenchStore } from '@/lib/stores/workbench';
import { diffFiles } from '@/utils/diff';
import { Message } from 'ai';
import { useStore } from '@nanostores/react';
import { filesToArtifacts } from '@/lib/fileUtils';

/**
 * 元素类型图标映射
 */
const ELEMENT_TYPE_ICONS = {
    text: Type,
    img: Image, 
    button: Square,
    link: Link,
    div: Box
};

/**
 * 字体大小显示名称映射
 */
const FONT_SIZE_NAMES = {
    xs: "XS",
    base: "Body", 
    sm: "Small",
    md: "Medium",
    lg: "Large",
    xl: "XL",
    "2xl": "2XL",
    "3xl": "3XL",
    "4xl": "4XL",
    "5xl": "5XL",
    "6xl": "6XL",
    "7xl": "7XL",
    "8xl": "8XL",
    "9xl": "9XL"
};

/**
 * 边框圆角显示名称映射
 */
const BORDER_RADIUS_NAMES = {
    none: "None",
    DEFAULT: "Default",
    sm: "Small", 
    md: "Medium",
    lg: "Large",
    xl: "XL",
    "2xl": "2XL",
    "3xl": "3XL",
    full: "Full"
};

/**
 * 解析颜色值
 */
function parseColorValue(colorData: any) {
    if (!colorData) return undefined;
    
    let name, hex;
    let opacity = 1;
    
    if (colorData.modifier) {
        const modifier = colorData.modifier;
        if (modifier.startsWith('[') && modifier.endsWith(']')) {
            opacity = parseFloat(modifier.replace(/[\[\]]/g, ''));
        } else {
            opacity = parseInt(modifier) / 100;
        }
    }
    
    if (colorData.valueDef.raw === 'inherit') return undefined;
    if (colorData.valueDef.raw === 'transparent') opacity = 0;
    
    if (colorData.valueDef.raw.startsWith('#')) {
        hex = colorData.valueDef.raw;
    } else {
        name = colorData.valueDef.raw;
        hex = colorData.value;
    }
    
    const parsedColor = parseColor(hex);
    if (!parsedColor) {
        return { name, hex: undefined };
    }
    
    const finalHex = rgbaToHex(parsedColor.r, parsedColor.g, parsedColor.b, opacity);
    
    return {
        name: name || finalHex,
        hex: finalHex,
        hexWithoutAlpha: rgbaToHex(parsedColor.r, parsedColor.g, parsedColor.b, 1)
    };
}

/**
 * 编辑器组区域组件
 */
function EditorSection({ title, disabled = false, children }: { title: string, disabled?: boolean, children: React.ReactNode }) {
    return (
        <div className={cn("space-y-3", { "opacity-50 pointer-events-none": disabled })}>
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

/**
 * 编辑器字段组件
 */
function EditorField({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
                {title}
            </label>
            {children}
        </div>
    );
}

/**
 * 主元素编辑器组件
 */
export function ElementEditor({ 
    element, 
    disabled = false, 
    onClose, 
    onSave, 
    onDiscard,
    sendMessage: sendChatMessage,
    setMessages,
}: { 
    element: any, 
    disabled?: boolean, 
    onClose?: () => void, 
    onSave?: (updates: any) => void, 
    onDiscard?: () => void,
    sendMessage?: (event: React.UIEvent, messageInput?: string) => void,
    setMessages?: (messages: any) => void
}) {
    const elementType = getElementType(element);
    const updateTimeouts = useRef<any>({});
    const sendMessage = useIframeMessaging();
    const [currentElementInfo, setCurrentElementInfo] = useState<any>(null);
    
    // 使用 useStore 订阅状态变化
    const isFileSaving = useStore(workbenchStore.isFileSaving);
    
    // 防抖更新状态
    const [pendingUpdates, setPendingUpdates] = useState<any>({});
    
    // 组件内部缓存状态
    const [elementCache, setElementCache] = useState<Record<string, any>>({});
    
    // 存储每个元素的原始数据
    const [originalData, setOriginalData] = useState<Record<string, any>>({});
    
    const [isCurrentElementDataUpdate, setIsCurrentElementDataUpdate] = useState<boolean>(false);
    
    const getValue = (property: string, defaultValue: any) => {
        const value = pendingUpdates[property] ?? defaultValue;
        return value;
    };

    const getNumericValue = useCallback((property: string, defaultValue: any) => {
        const value = pendingUpdates[property] ?? defaultValue;
        if (typeof value === 'string' && value.includes('px')) {
            return value.replace('px', '');
        }
        return value;
    }, [pendingUpdates]);

    // 解析className为标准数据格式
    const parseElementClassName = (className: string) => {
        if (!className) return {};
        
        const classNames = className.split(' ').filter(Boolean);
        const parsedValues: Record<string, string> = {
            textColor: '',
            fontSize: '',
            fontWeight: '',
            textAlign: '',
            backgroundColor: '',
            borderRadius: '',
            marginX: '0px',
            marginY: '0px',
            paddingX: '0px',
            paddingY: '0px',
            objectFit: '',
            otherClasses: ''
        };
        const otherClasses: string[] = [];
        
        classNames.forEach((className: string) => {
            let parsed = false;
            
            // 解析字体大小
            if (className.startsWith('text-')) {
                const size = className.replace('text-', '');
                if (Object.keys(FONT_SIZE_NAMES).includes(size)) {
                    parsedValues.fontSize = size;
                    parsed = true;
                }
                // 解析文字对齐
                else if (['left', 'center', 'right', 'justify'].includes(size)) {
                    parsedValues.textAlign = size;
                    parsed = true;
                }
                // 解析文字颜色
                else if (size.startsWith('[') && size.endsWith(']')) {
                    parsedValues.textColor = size.slice(1, -1);
                    parsed = true;
                }
                else if (!['left', 'center', 'right', 'justify'].includes(size) && !Object.keys(FONT_SIZE_NAMES).includes(size)) {
                    parsedValues.textColor = size;
                    parsed = true;
                }
            }
            
            // 解析字体粗细
            else if (className.startsWith('font-')) {
                const weight = className.replace('font-', '');
                if (['normal', 'medium', 'semibold', 'bold'].includes(weight)) {
                    parsedValues.fontWeight = weight;
                    parsed = true;
                }
            }
            
            // 解析背景色
            else if (className.startsWith('bg-')) {
                const bgColor = className.replace('bg-', '');
                if (bgColor.startsWith('[') && bgColor.endsWith(']')) {
                    parsedValues.backgroundColor = bgColor.slice(1, -1);
                } else {
                    parsedValues.backgroundColor = bgColor;
                }
                parsed = true;
            }
            
            // 解析边框圆角
            else if (className.startsWith('rounded')) {
                const radius = className.replace('rounded', '');
                if (radius === '') {
                    parsedValues.borderRadius = 'DEFAULT';
                } else {
                    parsedValues.borderRadius = radius.replace('-', '');
                }
                parsed = true;
            }
            
            // 解析间距 - Margin
            else if (className.startsWith('mx-')) {
                const margin = className.replace('mx-', '');
                if (margin.startsWith('[') && margin.endsWith(']')) {
                    parsedValues.marginX = margin.slice(1, -1);
                } else {
                    parsedValues.marginX = margin + 'px';
                }
                parsed = true;
            } else if (className.startsWith('my-')) {
                const margin = className.replace('my-', '');
                if (margin.startsWith('[') && margin.endsWith(']')) {
                    parsedValues.marginY = margin.slice(1, -1);
                } else {
                    parsedValues.marginY = margin + 'px';
                }
                parsed = true;
            }
            
            // 解析间距 - Padding
            else if (className.startsWith('px-')) {
                const padding = className.replace('px-', '');
                if (padding.startsWith('[') && padding.endsWith(']')) {
                    parsedValues.paddingX = padding.slice(1, -1);
                } else {
                    parsedValues.paddingX = padding + 'px';
                }
                parsed = true;
            } else if (className.startsWith('py-')) {
                const padding = className.replace('py-', '');
                if (padding.startsWith('[') && padding.endsWith(']')) {
                    parsedValues.paddingY = padding.slice(1, -1);
                } else {
                    parsedValues.paddingY = padding + 'px';
                }
                parsed = true;
            }
            
            // 解析图片对象适配
            else if (className.startsWith('object-')) {
                parsedValues.objectFit = className.replace('object-', '');
                parsed = true;
            }
            
            // 如果没有被解析，则加入其他类名
            if (!parsed) {
                otherClasses.push(className);
            }
        });
        
        // 将其他未解析的类名保存
        if (otherClasses.length > 0) {
            parsedValues.otherClasses = otherClasses.join(' ');
        }
        
        return parsedValues;
    };

    // 比较两个数据对象是否相等
    const isDataEqual = useCallback((data1: any, data2: any) => {
        if (!data1 && !data2) return true;
        if (!data1 || !data2) return false;
        
        const keys1 = Object.keys(data1);
        const keys2 = Object.keys(data2);
        
        if (keys1.length !== keys2.length) return false;
        
        for (const key of keys1) {
            if (data1[key] !== data2[key]) {
                return false;
            }
        }
        
        return true;
    }, []);

    const {
        setSelectedElements,
        selectedElements,
        togglePickAndEdit
    } = useVisualEditing();

    // 使用 astStore 替代 useSandboxCode
    const files = useStore(astStore.files);
    const pendingChanges = useStore(astStore.pendingChanges);
        
    const debouncedUpdate = (property: string, value: any, element?: any) => {
        const now = Date.now();
        setIsCurrentElementDataUpdate(true);
        // 如果是更新全部类名，需要重新解析
        if (property === 'allClasses') {
            const classNames = value.split(' ').filter(Boolean);
            const parsedValues = parseElementClassName(value);
            // 将解析出的值和原始类名都保存
            parsedValues.allClasses = value;
            setPendingUpdates((prev: any) => ({ ...prev, ...parsedValues }));
        } else {
            // 当用户通过UI控件修改值时，清除allClasses以便重新生成
            setPendingUpdates((prev: any) => ({ ...prev, [property]: value, allClasses: '' }));
            if (property === 'textContent') {
                sendMessage({
                    type: MessageTypes.SET_ELEMENT_CONTENT,
                    payload: {
                        id: {
                            path: element.filePath,
                            line: element.lineNumber
                        },
                        content: value
                    }
                });
            }
        }
        
        if (updateTimeouts.current[property]) {
            cancelAnimationFrame(updateTimeouts.current[property].rafId);
        }

        if (element?.filePath && element?.lineNumber) {
            sendMessage({
                type: MessageTypes.SET_ELEMENT_ATTRS,
                payload: {
                    id: {
                        path: element.filePath,
                        line: element.lineNumber
                    },
                    attrs: {
                        class: generateCSSClasses()
                    }
                }
            });
        }
    }

    // 生成CSS类字符串
    // unocss-ignore-start
    const generateCSSClasses = useCallback(() => {
        // 如果用户直接编辑了全部类名，就直接返回
        const allClasses = getValue('allClasses', '');
        if (allClasses) {
            return allClasses;
        }
        
        const classes = [];
        
        // 文本颜色
        const textColor = getValue('textColor', '');
        if (textColor) {
            if (textColor.startsWith('#')) {
                classes.push('text-[' + textColor + ']');
            } else {
                classes.push('text-' + textColor);
            }
        }
        // 边距
        const marginX = getValue('marginX', '0px');
        const marginY = getValue('marginY', '0px');
        if (marginX && marginX !== '0px' && marginX !== '0') {
            const marginXValue = typeof marginX === 'string' ? marginX.replace('px', '') : marginX;
            classes.push('mx-[' + marginXValue + 'px]');
        }
        if (marginY && marginY !== '0px' && marginY !== '0') {
            const marginYValue = typeof marginY === 'string' ? marginY.replace('px', '') : marginY;
            classes.push('my-[' + marginYValue + 'px]');
        }
        
        // 内边距
        const paddingX = getValue('paddingX', '0px');
        const paddingY = getValue('paddingY', '0px');
        if (paddingX && paddingX !== '0px' && paddingX !== '0') {
            const paddingXValue = typeof paddingX === 'string' ? paddingX.replace('px', '') : paddingX;
            classes.push('px-[' + paddingXValue + 'px]');
        }
        if (paddingY && paddingY !== '0px' && paddingY !== '0') {
            const paddingYValue = typeof paddingY === 'string' ? paddingY.replace('px', '') : paddingY;
            classes.push('py-[' + paddingYValue + 'px]');
        }
        
        // 字体大小
        const fontSize = getValue('fontSize', '');
        if (fontSize) {
            if (fontSize === 'base') {
                classes.push('text-base');
            } else {
                classes.push('text-' + fontSize);
            }
        }
        
        // 字体粗细
        const fontWeight = getValue('fontWeight', '');
        if (fontWeight && fontWeight !== 'normal') classes.push('font-' + fontWeight);
        
        // 文本对齐
        const textAlign = getValue('textAlign', '');
        if (textAlign && textAlign !== 'left') classes.push('text-' + textAlign);
        
        // 背景色
        const backgroundColor = getValue('backgroundColor', '');
        if (backgroundColor && backgroundColor !== '#ffffff') {
            // 如果是十六进制颜色，转换为 bg-[#color] 格式
            if (backgroundColor.startsWith('#')) {
                classes.push('bg-[' + backgroundColor + ']');
            } else {
                classes.push('bg-' + backgroundColor);
            }
        }
        
        // 边框圆角
        const borderRadius = getValue('borderRadius', '');
        if (borderRadius) {
            if (borderRadius === 'DEFAULT') {
                classes.push('rounded');
            } else {
                classes.push('rounded-' + borderRadius);
            }
        }
        
        // 图片相关
        if (elementType === 'img') {
            const objectFit = getValue('objectFit', '');
            if (objectFit) classes.push('object-' + objectFit);
        }
        
        // 添加其他未被解析的类名
        const otherClasses = getValue('otherClasses', '');
        if (otherClasses) {
            classes.push(otherClasses);
        }
        
        return classes.join(' ');
    }, [getValue, elementType]);
    // unocss-ignore-end

        const handleSave = async () => {
        // if (onSave) {
        //     onSave(pendingUpdates);
        // }
        
        const cacheKey = currentElementInfo ? `${currentElementInfo.filePath}-${currentElementInfo.lineNumber}` : null;
        const originalElementData = cacheKey ? originalData[cacheKey] : null;
        
        console.log('=== 数据对比结果 ===');
        console.log('当前数据 pendingUpdates:', pendingUpdates);
        console.log('原始数据 originalData:', originalElementData);
        console.log('数据是否相等:', isDataEqual(pendingUpdates, originalElementData));
        console.log('缓存数据 elementCache:', elementCache);
        console.log('===================');

        // 遍历 elementCache 中的所有缓存数据并更新文件
        Object.entries(elementCache).forEach(([elementKey, cachedData]) => {
            if (!cachedData.isEdited) {
                return;
            }
            const [filePath, lineNumber] = elementKey.split('-');
            const { timestamp, ...elementData } = cachedData;
            
            console.log(`处理缓存元素: ${elementKey}`, elementData);
            
            // 构建元素对象
            const cachedElement = {
                filePath,
                lineNumber: parseInt(lineNumber),
                elementType: element?.elementType || 'div', // 使用当前元素类型或默认
                textContent: elementData.textContent || '',
                className: elementData.allClasses || ''
            };
            
            // 生成 CSS 类名
            const generateCSSClassesForElement = (data: any) => {
                const classes = [];
                
                // 文本颜色
                if (data.textColor) {
                    if (data.textColor.startsWith('#')) {
                        classes.push('text-[' + data.textColor + ']');
                    } else {
                        classes.push('text-' + data.textColor);
                    }
                }
                
                // 边距
                if (data.marginX && data.marginX !== '0px' && data.marginX !== '0') {
                    const marginXValue = typeof data.marginX === 'string' ? data.marginX.replace('px', '') : data.marginX;
                    classes.push('mx-[' + marginXValue + 'px]');
                }
                if (data.marginY && data.marginY !== '0px' && data.marginY !== '0') {
                    const marginYValue = typeof data.marginY === 'string' ? data.marginY.replace('px', '') : data.marginY;
                    classes.push('my-[' + marginYValue + 'px]');
                }
                
                // 内边距
                if (data.paddingX && data.paddingX !== '0px' && data.paddingX !== '0') {
                    const paddingXValue = typeof data.paddingX === 'string' ? data.paddingX.replace('px', '') : data.paddingX;
                    classes.push('px-[' + paddingXValue + 'px]');
                }
                if (data.paddingY && data.paddingY !== '0px' && data.paddingY !== '0') {
                    const paddingYValue = typeof data.paddingY === 'string' ? data.paddingY.replace('px', '') : data.paddingY;
                    classes.push('py-[' + paddingYValue + 'px]');
                }
                
                // 字体大小
                if (data.fontSize) {
                    if (data.fontSize === 'base') {
                        classes.push('text-base');
                    } else {
                        classes.push('text-' + data.fontSize);
                    }
                }
                
                // 字体粗细
                if (data.fontWeight && data.fontWeight !== 'normal') {
                    classes.push('font-' + data.fontWeight);
                }
                
                // 文本对齐
                if (data.textAlign && data.textAlign !== 'left') {
                    classes.push('text-' + data.textAlign);
                }
                
                // 背景色
                if (data.backgroundColor && data.backgroundColor !== '#ffffff') {
                    if (data.backgroundColor.startsWith('#')) {
                        classes.push('bg-[' + data.backgroundColor + ']');
                    } else {
                        classes.push('bg-' + data.backgroundColor);
                    }
                }
                
                // 边框圆角
                if (data.borderRadius) {
                    if (data.borderRadius === 'DEFAULT') {
                        classes.push('rounded');
                    } else {
                        classes.push('rounded-' + data.borderRadius);
                    }
                }
                
                // 图片相关
                if (data.objectFit) {
                    classes.push('object-' + data.objectFit);
                }
                
                // 添加其他未被解析的类名
                if (data.otherClasses) {
                    classes.push(data.otherClasses);
                }
                
                return classes.join(' ');
            };
            
            // 获取要更新的 CSS 类名
            const cssClasses = elementData.allClasses || generateCSSClassesForElement(elementData);
            
            // 更新元素的类名
            astStore.handleUpdateClassName({
                element: cachedElement,
                classObj: [{
                    property: 'className',
                    value: cssClasses
                }],
                preview: false
            });
            
            // 更新元素的文本内容
            if (elementData.textContent !== undefined && element.elementType !== 'div') {
                astStore.handleUpdateTextContent({
                    element: cachedElement,
                    textContent: elementData.textContent
                });
            }
        });

        const res = await astStore.syncCode({});



        const fileList = Object.entries(res).map(([filePath, content]) => ({
            path: filePath,
            content
        }));

        let diffContent = '';

        fileList.forEach(file => {
            const fileInfo = workbenchStore.files.get()[`${file.path}`];
            if (fileInfo && fileInfo.type === 'file') {
                const diff = diffFiles(file.path, fileInfo.content, file.content);
                diffContent += `
${file.path}

--- a/${file.path}
+++ b/${file.path}
${diff}
\n\n
                `
            }
            
        });

        const userUpdateArtifact = filesToArtifacts(fileList.reduce((acc: any, file: any) => {
            acc[`${file.path}`] = {
                content: file.content
            }
            return acc;
        }, {}), `${Date.now()}`);

        // User update some fo the files in the app, here's the diff:

        const user =   {
            id: `${new Date().getTime()}`,
            role: 'user',
            content: `
User update some fo the files in the app, here's the diff:

${diffContent}

\n\n${userUpdateArtifact}
            `,
            annotations: ['manually_edited'],
        }

        await workbenchStore.saveFileByFileList(fileList);

        // 更新消息状态
        let newMessages: any[] = [];
        setMessages && setMessages((prev: any) => {
            newMessages = [...prev, user as Message];
            return newMessages;
        });

        togglePickAndEdit();

        // 使用 setTimeout 确保在消息状态更新后调用 onSave
        setTimeout(() => {
            if (onSave) {
                onSave(pendingUpdates);
            }
        }, 0);

        // 清空所有缓存
        // setElementCache({});
        // setPendingUpdates({});
        
    };
    

    const handleDiscard = useCallback(() => {
        setPendingUpdates({});
        if (onDiscard) {
            onDiscard();
        }
    }, [onDiscard]);

    // 缓存当前元素的修改数据
    useEffect(() => {
        if (currentElementInfo && Object.keys(pendingUpdates).length > 0) {
            const cacheKey = `${currentElementInfo.filePath}-${currentElementInfo.lineNumber}`;

            setElementCache(prev => {
                const newCache = { ...prev };
                const cache = newCache[cacheKey];
                if (cache) {
                    newCache[cacheKey] = {
                        ...pendingUpdates,
                        isEdited: cache.isEdited,
                        timestamp: Date.now()
                    }
                }
                return newCache;
            });
        }
    }, [currentElementInfo, pendingUpdates, originalData, isDataEqual]);


    useEffect(() => {
        if (isCurrentElementDataUpdate) {
            setElementCache(prev => {
                const newCache = { ...prev };
                const cache = newCache[currentElementInfo?.filePath + '-' + currentElementInfo?.lineNumber];
                if (cache) {
                    cache.isEdited = true;
                }
                return newCache;
            });
        }
    }, [isCurrentElementDataUpdate]);

    // 处理元素切换的回调
    const handleElementChange = (newElement: any) => {
        if (!newElement?.filePath) return;
        
        const newCacheKey = `${newElement.filePath}-${newElement.lineNumber}`;
        const currentCacheKey = currentElementInfo ? `${currentElementInfo.filePath}-${currentElementInfo.lineNumber}` : null;
        // 只有当切换到不同元素时才处理缓存
        if (newCacheKey !== currentCacheKey) {
            setIsCurrentElementDataUpdate(false);
            // 更新当前元素信息
            setCurrentElementInfo({
                filePath: newElement.filePath,
                lineNumber: newElement.lineNumber,
            });
            
            // 尝试恢复缓存的修改数据
            setElementCache(currentCache => {
                const cachedData = currentCache[newCacheKey];
                if (cachedData) {
                    // 直接恢复缓存数据
                    const { timestamp, ...dataWithoutTimestamp } = cachedData;
                    dataWithoutTimestamp.textContent = newElement.textContent;
                    setPendingUpdates((prev: any) => ({ ...dataWithoutTimestamp }));
                    return currentCache;
                } else {
                    // 如果没有缓存数据，解析 element.className 作为初始值
                    const initialValues = parseElementClassName(newElement.className || '');
                    // 保存原始数据
                    setOriginalData(prev => ({
                        ...prev,
                        [newCacheKey]: initialValues
                    }));
                    
                    // 设置解析出的初始值
                    setPendingUpdates((prev: any) => ({ ...initialValues, textContent: newElement.textContent }));
                    return currentCache;
                }
            });

            if (!elementCache[newCacheKey]) {
                setElementCache(prev => ({
                    ...prev,
                    [newCacheKey]: {
                        ...pendingUpdates,
                        timestamp: Date.now()
                    }
                }));
            }
        } else {
            // 如果需要更新文本内容，应该基于当前的 pendingUpdates
            if (newElement.textContent !== getValue('textContent', '')) {
                setIsCurrentElementDataUpdate(true);
                setPendingUpdates((prev: any) => ({
                    ...prev,
                    textContent: newElement.textContent
                }));
            }
        }


    };

    useEffect(() => {
        if (element?.filePath) {
            handleElementChange(element);
        }
    }, [element]);

    
    // 如果没有传入element，显示空状态
    if (!element || element.hidden) {
        return (
            <div className="bg-[#2D2D2D] border border-[#4A4A4A] rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-[#3A3A3A] flex items-center justify-center">
                            <LocateFixed className="w-4 h-4 text-[#B0B0B0]" />
                        </div>
                        <h3 className="text-sm font-medium text-[#E0E0E0]">Edit</h3>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-[#B0B0B0] hover:text-[#E0E0E0] h-auto p-1"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Empty state message */}
                <div className="p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#3A3A3A] flex items-center justify-center">
                        <Box className="w-6 h-6 text-[#B0B0B0]" />
                    </div>
                    <h4 className="text-sm font-medium text-[#E0E0E0] mb-2">
                        No Element Selected
                    </h4>
                    <p className="text-sm text-[#8A8A8A]">
                        Please select an element to edit its properties
                    </p>
                </div>
                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 pb-2">
                    <Button
                        variant="ghost"
                        onClick={handleDiscard}
                        className="text-[#B0B0B0] h-[32px]"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-[#4A5568] hover:bg-[#2D3748] text-white h-[32px]"
                    >
                        {
                            isFileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'
                        }
                    </Button>
                </div>

            </div>
        );
    }
    
    return (
        <div className="bg-[#2D2D2D] border border-[#4A4A4A] rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                        {(() => {
                            const IconComponent = ELEMENT_TYPE_ICONS[elementType];
                            return IconComponent ? <IconComponent size={18} className="text-[#B0B0B0]" /> : <Box size={18} className="text-[#B0B0B0]" />;
                        })()}
                    </div>
                    <span className="text-sm font-medium bg-[#4A5568] px-2 py-1 rounded text-[#E0E0E0]">
                        {element?.elementType || 'p'}
                    </span>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#B0B0B0] h-auto p-1"
                        onClick={() => {
                            // Set element display to none using SET_ELEMENT_ATTRS
                            if (element?.filePath && element?.lineNumber) {
                                sendMessage({
                                    type: MessageTypes.SET_ELEMENT_ATTRS,
                                    payload: {
                                        id: {
                                            path: element.filePath,
                                            line: element.lineNumber
                                        },
                                        attrs: {
                                            style: "display: none"
                                        }
                                    }
                                });
                            }

                            element.hidden = true;
                            astStore.removeJSXElementToSandbox(element);
                            setSelectedElements([]);
                            // Close the editor

                        }}
                        title="Remove element"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-[#B0B0B0] h-auto p-1"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
               
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* 文本内容编辑 */}
                {element.isEditable && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                            <Label className="text-sm font-medium text-[#E0E0E0]">Content</Label>
                            <HelpCircle className="w-4 h-4 text-[#8A8A8A]" />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Experience the perfect blend of artisanal coffee, cozy"
                                disabled={disabled}
                                value={getValue('textContent', element?.textContent || '')}
                                onChange={(e) => debouncedUpdate('textContent', e.target.value, element)}
                                className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] placeholder-[#8A8A8A]"
                            />
                        </div>
                    </div>
                )}
                
                {/* 间距控制 - Margin */}
                <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Margin</Label>
                    <div className="flex-1">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={getNumericValue('marginX', '0')}
                                    disabled={disabled || elementType === 'img'}
                                    onChange={(e) => debouncedUpdate('marginX', `${e.target.value}px`, element)}
                                    className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] text-center placeholder-[#8A8A8A]"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#8A8A8A] pointer-events-none">
                                    ║
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={getNumericValue('marginY', '0')}
                                    disabled={disabled || elementType === 'img'}
                                    onChange={(e) => debouncedUpdate('marginY', `${e.target.value}px`, element)}
                                    className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] text-center placeholder-[#8A8A8A]"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#8A8A8A] pointer-events-none">
                                    ═
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 间距控制 - Padding */}
                <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Padding</Label>
                    <div className="flex-1">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={getNumericValue('paddingX', '0')}
                                    disabled={disabled || elementType === 'img'}
                                    onChange={(e) => debouncedUpdate('paddingX', `${e.target.value}px`, element)}
                                    className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] text-center placeholder-[#8A8A8A]"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#8A8A8A] pointer-events-none">
                                    ║
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={getNumericValue('paddingY', '0')}
                                    disabled={disabled || elementType === 'img'}
                                    onChange={(e) => debouncedUpdate('paddingY', `${e.target.value}px`, element)}
                                    className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] text-center placeholder-[#8A8A8A]"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[#8A8A8A] pointer-events-none">
                                    ═
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 文字样式控制 */}
                {(elementType === 'text' || elementType === 'button') && (
                    <>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Font size</Label>
                            <div className="flex-1">
                                <Select
                                    disabled={disabled}
                                    value={getValue('fontSize', 'base')}
                                    onValueChange={(value) => debouncedUpdate('fontSize', value, element)}
                                >
                                    <SelectTrigger className="w-full bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0]">
                                        <SelectValue placeholder="Body" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#3A3A3A] border-[#5A5A5A]">
                                        {Object.entries(FONT_SIZE_NAMES).map(([size, name]) => (
                                            <SelectItem key={size} value={size} className="text-[#E0E0E0] focus:bg-[#4A4A4A]">
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Font weight</Label>
                            <div className="flex-1">
                                <Select
                                    disabled={disabled}
                                    value={getValue('fontWeight', '')}
                                    onValueChange={(value) => debouncedUpdate('fontWeight', value, element)}
                                >
                                    <SelectTrigger className="w-full bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0]">
                                        <SelectValue placeholder="Select weight" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#3A3A3A] border-[#5A5A5A]">
                                        <SelectItem value="normal" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Normal</SelectItem>
                                        <SelectItem value="medium" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Medium</SelectItem>
                                        <SelectItem value="semibold" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Semibold</SelectItem>
                                        <SelectItem value="bold" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Bold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Color</Label>
                            <div className="flex-1">
                                <ColorPicker
                                    value={getValue('textColor', '')}
                                    onChange={(value) => debouncedUpdate('textColor', value, element)}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Alignment</Label>
                            <div className="flex-1">
                                <div className="flex gap-1">
                                    {[
                                        { value: 'left', icon: '≡' },
                                        { value: 'center', icon: '≡' },
                                        { value: 'right', icon: '≡' },
                                        { value: 'justify', icon: '≡' }
                                    ].map(({ value, icon }) => (
                                        <Button
                                            key={value}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] hover:bg-[#4A4A4A]"
                                            onClick={() => debouncedUpdate('textAlign', value, element)}
                                            disabled={disabled}
                                        >
                                            {icon}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {/* 背景和边框控制 */}
                {(elementType === 'div' || elementType === 'button') && (
                    <>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Background</Label>
                            <div className="flex-1">
                                <ColorPicker
                                    value={getValue('backgroundColor', '')}
                                    onChange={(value) => debouncedUpdate('backgroundColor', value, element)}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Border radius</Label>
                            <div className="flex-1">
                                <Select
                                    disabled={disabled}
                                    onValueChange={(value) => debouncedUpdate('borderRadius', value, element)}
                                >
                                    <SelectTrigger className="w-full bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0]">
                                        <SelectValue placeholder="Select border radius" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#3A3A3A] border-[#5A5A5A]">
                                        {Object.entries(BORDER_RADIUS_NAMES).map(([radius, name]) => (
                                            <SelectItem key={radius} value={radius} className="text-[#E0E0E0] focus:bg-[#4A4A4A]">
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}
                
                {/* 图片控制 */}
                {elementType === 'img' && (
                    <>
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Source</Label>
                            <div className="flex-1">
                                <Input
                                    type="url"
                                    placeholder="Image URL"
                                    disabled={disabled}
                                    onChange={(e) => debouncedUpdate('src', e.target.value, element)}
                                    className="bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0] placeholder-[#8A8A8A]"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium min-w-[80px] text-[#E0E0E0]">Resize</Label>
                            <div className="flex-1">
                                <Select
                                    disabled={disabled}
                                    onValueChange={(value) => debouncedUpdate('objectFit', value, element)}
                                >
                                    <SelectTrigger className="w-full bg-[#3A3A3A] border-[#5A5A5A] text-[#E0E0E0]">
                                        <SelectValue placeholder="Select resize mode" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#3A3A3A] border-[#5A5A5A]">
                                        <SelectItem value="contain" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Contain</SelectItem>
                                        <SelectItem value="cover" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Cover</SelectItem>
                                        <SelectItem value="fill" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Fill</SelectItem>
                                        <SelectItem value="none" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">None</SelectItem>
                                        <SelectItem value="scale-down" className="text-[#E0E0E0] focus:bg-[#4A4A4A]">Scale down</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}
                
                {/* Advanced 部分 */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-[#E0E0E0]">Advanced</Label>
                        <HelpCircle className="w-4 h-4 text-[#8A8A8A] cursor-help" />
                    </div>
                    
                    {/* 完整类名编辑 */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Textarea
                                className="min-h-[60px] text-xs text-[#E0E0E0] resize-none font-mono bg-[#3A3A3A] border-[#5A5A5A]"
                                value={generateCSSClasses()}
                                onChange={(e) => debouncedUpdate('allClasses', e.target.value, element)}
                                placeholder="text-base font-medium text-blue-500 px-4 py-2 bg-white rounded-lg..."
                                title="Edit all CSS classes here. Changes will be reflected in the UI controls above."
                            />
                            <div className="absolute bottom-2 right-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-auto p-1 text-[#B0B0B0] hover:text-[#E0E0E0]"
                                    onClick={() => {
                                        // 复制到剪贴板
                                        navigator.clipboard.writeText(generateCSSClasses());
                                    }}
                                    title="Copy CSS classes to clipboard"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-4 pb-2">
                <Button
                    variant="ghost"
                    onClick={handleDiscard}
                    className="text-[#B0B0B0] h-[32px]"
                >
                    Discard
                </Button>
                <Button
                    onClick={handleSave}
                    className="bg-[#4A5568] hover:bg-[#2D3748] text-white h-[32px]"
                >
                    {
                        isFileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'
                    }
                </Button>
            </div>
        </div>
    );
}

// 辅助函数
function getElementType(element: any) {
    if (!element) return 'div';
    
    const elementType = element?.elementType;
    if (['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(elementType)) {
        return 'text';
    }
    if (elementType === 'img') return 'img';
    if (elementType === 'button') return 'button';
    if (elementType === 'a') return 'link';
    return 'div';
}

// 这些函数现在从colorUtils模块导入 