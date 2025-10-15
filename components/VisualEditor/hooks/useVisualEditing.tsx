import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { MessageTypes, useIframeMessaging } from '../VisualEditing/VisualEditingUtils';
import { workbenchStore } from '@/lib/stores/workbench';
import { astStore, getElementClassName } from '@/lib/stores';

// 创建 Context 用于状态管理
const VisualEditorContext = createContext<any>(null);

// 全局事件监听器状态
let isGlobalListenerRegistered = false;
let globalMessageHandler: ((event: any) => void) | null = null;

// 提供 Context 的 Provider 组件
export const VisualEditorProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState({
        isPickAndEditActive: false,
        selectedElements: [],
        visibleMode: 'desktop',
        searchQuery: '',
        isLocked: false,
        ast: {},
        history: []
    });
    
    // 消息处理器引用
    const messageHandlerRef = useRef<((event: any) => void) | null>(null);

    const updateState = useCallback((updates: any) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const value = {
        state,
        updateState,
        messageHandlerRef, // 将消息处理器引用暴露给子组件
        // 便捷的更新方法
        setIsPickAndEditActive: (active: boolean) => updateState({ isPickAndEditActive: active }),
        setSelectedElements: (elements: any) => updateState({ selectedElements: elements }),
        setSearchQuery: (query: string) => updateState({ searchQuery: query }),
        setVisibleMode: (mode: string) => updateState({ visibleMode: mode }),
        setLocked: (locked: boolean) => updateState({ isLocked: locked }),
        setHistory: (historyUpdater: any) => {
            if (typeof historyUpdater === 'function') {
                setState(prev => ({
                    ...prev,
                    history: historyUpdater(prev.history)
                }));
            } else {
                updateState({ history: historyUpdater });
            }
        },
        // 模拟其他功能
        showFloatingInput: (params: any) => {},
        showVisualEditsPanel: (params: any) => {}
    };

    // 在 Provider 层面注册全局事件监听器
    useEffect(() => {
        if (!isGlobalListenerRegistered) {
            globalMessageHandler = (event: any) => {
                if (messageHandlerRef.current) {
                    messageHandlerRef.current(event);
                }
            };
            
            window.addEventListener('message', globalMessageHandler);
            isGlobalListenerRegistered = true;
        }

        return () => {
            // 只在 Provider 卸载时清理
            if (isGlobalListenerRegistered && globalMessageHandler) {
                window.removeEventListener('message', globalMessageHandler);
                isGlobalListenerRegistered = false;
                globalMessageHandler = null;
            }
        };
    }, []);

    return (
        <VisualEditorContext.Provider value={value}>
            {children}
        </VisualEditorContext.Provider>
    );
};

// 使用 Context 的 Hook
const useVisualEditorContext = () => {
    const context = useContext(VisualEditorContext);
    if (!context) {
        // 如果没有 Provider，返回一个默认的空实现
        return {
            state: {
                isPickAndEditActive: false,
                selectedElements: [],
                visibleMode: 'desktop',
                searchQuery: '',
                isLocked: false,
                ast: {},
                history: []
            },
            messageHandlerRef: null,
            setIsPickAndEditActive: () => {},
            setSelectedElements: () => {},
            setSearchQuery: () => {},
            setVisibleMode: () => {},
            setLocked: () => {},
            setHistory: () => {},
            showFloatingInput: () => {},
            showVisualEditsPanel: () => {}
        };
    }
    return context;
};

// Mock analytics
const analytics = {
    capture: (event: any, data: any) => console.log('Analytics:', event, data)
};

/**
 * 视觉编辑主Hook
 * 处理元素选择、编辑状态管理等核心功能
 */
export function useVisualEditing() {
    const {
        state,
        messageHandlerRef,
        setIsPickAndEditActive,
        setSelectedElements,
        setSearchQuery,
        setHistory,
        showFloatingInput,
        showVisualEditsPanel
    } = useVisualEditorContext();
    
    const {
        isPickAndEditActive,
        selectedElements,
        isLocked,
        ast,
        visibleMode
    } = state;
    
    const sendIframeMessage = useIframeMessaging();

    
    // 状态管理
    const isAdvancedEditorEnabled = true; // 简化为直接值

    /**
     * 切换选择器状态
     */
    const toggleSelector = useCallback((isActive: boolean, elements: any) => {
        sendIframeMessage({
            type: MessageTypes.TOGGLE_SELECTOR,
            payload: isActive
        });
        sendIframeMessage({
            type: MessageTypes.UPDATE_SELECTED_ELEMENTS,
            payload: elements
        });
    }, [sendIframeMessage]);

    /**
     * 同步选择器状态
     */
    const syncSelectorState = useCallback(() => {
        toggleSelector(isPickAndEditActive, selectedElements);
    }, [isPickAndEditActive, selectedElements, toggleSelector]);

    /**
     * 激活拾取编辑模式
     */
    const activatePickAndEdit = useCallback(() => {
        setIsPickAndEditActive(true);
        toggleSelector(true, selectedElements);
    }, [setIsPickAndEditActive, toggleSelector, selectedElements]);

    /**
     * 停用拾取编辑模式
     */
    const deactivatePickAndEdit = useCallback(() => {
        setIsPickAndEditActive(false);
        toggleSelector(false, selectedElements);
    }, [setIsPickAndEditActive, toggleSelector, selectedElements]);

    /**
     * 切换拾取编辑模式
     */
    const togglePickAndEdit = useCallback(() => {
        if (isPickAndEditActive) {
            deactivatePickAndEdit();
        } else {
            activatePickAndEdit();
        }
    }, [isPickAndEditActive, activatePickAndEdit, deactivatePickAndEdit]);

    /**
     * 悬停元素
     */
    const hoverElement = useCallback((elementData: any) => {
        if (!elementData.data) return;
        
        const { filePath, lineNumber } = elementData.data;
        if (filePath && lineNumber) {
            sendIframeMessage({
                type: MessageTypes.HOVER_ELEMENT_REQUESTED,
                payload: {
                    id: {
                        path: filePath,
                        line: lineNumber.toString()
                    }
                }
            });
        }
    }, [sendIframeMessage]);

    /**
     * 取消悬停元素
     */
    const unhoverElement = useCallback((elementData: any) => {
        if (!elementData.data) return;
        
        const { filePath, lineNumber } = elementData.data;
        if (filePath && lineNumber) {
            sendIframeMessage({
                type: MessageTypes.UNHOVER_ELEMENT_REQUESTED,
                payload: {
                    id: {
                        path: filePath,
                        line: lineNumber.toString()
                    }
                }
            });
        }
    }, [sendIframeMessage]);

    /**
     * 处理元素点击
     */
    const handleElementClick = useCallback((elementData: any) => {
        if (!elementData) {
            console.error('Failed to select element');
            return;
        }

        // 记录分析事件
        // analytics.capture('visual_edits:element_selected', {
        //     type: elementData.elementType
        // });

        try {
            // 解析元素数据
            const parseContent = (content: any) => {
                return content ? JSON.parse(decodeURIComponent(content.toString())) : null;
            };

            const processedElement = {
                ...elementData,
                content: parseContent(elementData.content),
                children: elementData.children?.map((child: any) => ({
                    ...child,
                    content: parseContent(child.content)
                }))
            };

            // 更新选中的元素
            setSelectedElements([processedElement]);
            sendIframeMessage({
                type: MessageTypes.UPDATE_SELECTED_ELEMENTS,
                payload: [processedElement]
            });

        } catch (error) {
            console.error('Error processing element data', error);
        }
    }, [setSelectedElements, sendIframeMessage]);

    /**
     * 检查是否可以编辑文本
     */
    const canEditText = useCallback(({ isLocked, elementType, payload, ast }: any) => {
        return !isLocked && 
               elementType !== "button" && 
               astStore.isEditableTextContentOnlyElement(payload);
    }, []);

    /**
     * 请求编辑文本
     */
    const requestTextEdit = useCallback(({ payload, sendIframeMessage }: any) => {
        sendIframeMessage({
            type: MessageTypes.EDIT_TEXT_REQUESTED,
            payload: {
                id: {
                    path: payload.filePath,
                    line: payload.lineNumber.toString()
                }
            }
        });
    }, []);

    // 设置消息处理器到全局 Provider
    useEffect(() => {
        if (messageHandlerRef) {
            messageHandlerRef.current = (event: any) => {
                const { data } = event;
                switch (data.type) {
                    case 'ELEMENT_CLICKED': {
                        const payload = data.payload;
                        const rect = data.rect;

                        // 显示编辑界面
                        if (rect) {
                            setSearchQuery('');
                            if (isAdvancedEditorEnabled) {
                                showVisualEditsPanel({
                                    elementBounds: rect,
                                    visibleMode,
                                    showVisualEditsPanel
                                });
                            } else {
                                showFloatingInput({
                                    elementBounds: rect,
                                    visibleMode,
                                    showFloatingInput
                                });
                            }
                        }

                        const file = workbenchStore.files.get()[`/home/project/${payload.filePath}`];
                        if (file && file.type === 'file') {
                            astStore.setFiles({
                                ...astStore.files.get(),
                                [payload.filePath]: file.content as string
                            });
                        }

                        // 检查是否可以编辑文本
                        const isEditable = canEditText({
                            isLocked,
                            elementType: payload.elementType,
                            payload,
                            ast
                        });
                        
                        if (isEditable) {
                            requestTextEdit({
                                payload,
                                sendIframeMessage
                            });
                        }
                        payload.isEditable = isEditable;
                        payload.className = getElementClassName(payload, astStore.ast.get());
                        handleElementClick(payload);
                        break;
                    }

                    case 'REQUEST_PICKER_STATE':
                    case 'REQUEST_SELECTED_ELEMENTS': {
                        sendIframeMessage({
                            type: MessageTypes.UPDATE_SELECTED_ELEMENTS,
                            payload: selectedElements
                        });
                        break;
                    }

                    case 'SELECTOR_SCRIPT_LOADED': {
                        syncSelectorState();
                        break;
                    }

                    case 'GET_SELECTOR_STATE': {
                        sendIframeMessage({
                            type: MessageTypes.SELECTOR_STATE_RESPONSE,
                            payload: {
                                isActive: isPickAndEditActive
                            }
                        });
                        break;
                    }

                    case 'ELEMENT_TEXT_UPDATED': {
                        // analytics.capture('visual_edits:element_text_updated', {});
                        
                        const updateData = data.payload;
                        const targetElement = selectedElements.find((element: any) => 
                            element.filePath === updateData.id.path && 
                            element.lineNumber.toString() === updateData.id.line
                        );

                        if (!targetElement) return;
                        const updatedElement = {
                            ...targetElement,
                            textContent: updateData.content
                        };

                        // 更新选中元素列表
                        const newSelectedElements = [
                            updatedElement,
                            ...selectedElements.filter((element: any) => 
                                element.filePath !== targetElement.filePath || 
                                element.lineNumber !== targetElement.lineNumber
                            )
                        ];

                        setSelectedElements(newSelectedElements);
                        
                        // 更新代码
                        updateElementText(updatedElement, (node: any) => 
                            setElementTextContent(node, updateData.content)
                        );

                        // 添加到历史记录
                        setHistory((history: any) => [...history, {
                            type: 'TEXT_CHANGE',
                            element: updatedElement,
                            oldText: targetElement.textContent || '',
                            newText: updateData.content
                        }]);
                        break;
                    }

                    case 'PARENT_ELEMENT': {
                        // analytics.capture('visual_edits:get_parent_element', {});
                        const parentElement = data.payload;
                        if (parentElement) {
                            handleElementClick(parentElement);
                        }
                        break;
                    }
                }
            };
        }
    }, [
        ast, activatePickAndEdit, deactivatePickAndEdit, handleElementClick,
        syncSelectorState, isLocked, isPickAndEditActive, selectedElements,
        sendIframeMessage, setHistory, setIsPickAndEditActive, setSelectedElements,
        showFloatingInput, visibleMode, messageHandlerRef
    ]);

    // 初始化选择器状态
    useEffect(() => {
        sendIframeMessage({
            type: MessageTypes.TOGGLE_SELECTOR,
            payload: isPickAndEditActive
        });
    }, [sendIframeMessage, isPickAndEditActive]);

    // 同步选中元素
    useEffect(() => {
        sendIframeMessage({
            type: MessageTypes.UPDATE_SELECTED_ELEMENTS,
            payload: selectedElements
        });
        syncSelectorState();
    }, [selectedElements, isPickAndEditActive, sendIframeMessage, syncSelectorState]);

    return {
        isPickAndEditActive,
        togglePickAndEdit,
        handleDeactivatePickAndEdit: deactivatePickAndEdit,
        selectedElements,
        setSelectedElements,
        hoverElement,
        unhoverElement,
        canEdit: !isLocked
    };
}

// 辅助函数
function isEditableTextElement(payload: any, ast: any) {
        // 检查元素是否可以编辑文本
        // 这里需要根据AST来判断
        return true; // 简化实现
}

function setElementTextContent(node: any, content: any) {
    // 设置元素文本内容
    // 这里需要操作AST节点
}

function updateElementText(element: any, updateFn: any) {
    // 更新元素文本
    // 这里需要调用代码更新逻辑
} 