"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { VisualEditor } from '@/components/VisualEditor/VisualEditor/VisualEditor';
import { VisualEditorProvider, useVisualEditing } from '@/components/VisualEditor/hooks/useVisualEditing';
import { Chat } from '@/components/chat/Chat.client';

/**
 * 消息类型定义
 */
interface IframeMessage {
    type: string;
    payload?: any;
    rect?: DOMRect;
    isMultiSelect?: boolean;
    request?: any;
    messages?: any[];
    error?: any;
    url?: string;
}

/**
 * 元素数据接口
 */
interface ElementData {
    id: string;
    filePath: string;
    fileName: string;
    lineNumber: number;
    col: number;
    elementType: string;
    content: string;
    className: string;
    textContent: string;
    attrs: Record<string, any>;
    children?: ElementData[];
}

/**
 * 编辑器状态接口
 */
interface EditorState {
    iframeLoaded: boolean;
    selectorActive: boolean;
    selectedElements: ElementData[];
    hoveredElement: ElementData | null;
    lastMessage: string;
    messageHistory: IframeMessage[];
    componentTree: any;
    scrollPosition: { scrollY: number; scrollHeight: number; clientHeight: number };
    networkRequests: any[];
    consoleMessages: any[];
    errors: any[];
}

/**
 * 内部组件，需要在VisualEditorProvider内部使用useVisualEditing
 */
function VisualEditorWrapInner() {
    const [editorState, setEditorState] = useState<EditorState>({
        iframeLoaded: false,
        selectorActive: false,
        selectedElements: [],
        hoveredElement: null,
        lastMessage: '',
        messageHistory: [],
        componentTree: null,
        scrollPosition: { scrollY: 0, scrollHeight: 0, clientHeight: 0 },
        networkRequests: [],
        consoleMessages: [],
        errors: []
    });

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [debugMode, setDebugMode] = useState(false);
    
    // 使用VisualEditing hook
    const { setSelectedElements: setVisualEditingSelectedElements } = useVisualEditing();

    // 更新状态的辅助函数
    const updateState = useCallback((updates: Partial<EditorState>) => {
        setEditorState(prev => ({ ...prev, ...updates }));
    }, []);

    // 向iframe发送消息
    const sendMessageToIframe = useCallback((message: any) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, 'http://localhost:8080');
            console.log('发送消息到iframe:', message);
        }
    }, []);

    // 切换选择器模式
    const toggleSelectorMode = useCallback(() => {
        const newActive = !editorState.selectorActive;
        sendMessageToIframe({
            type: 'TOGGLE_SELECTOR',
            payload: newActive
        });
        updateState({ 
            selectorActive: newActive,
            lastMessage: `选择器模式: ${newActive ? '开启' : '关闭'}`
        });
    }, [editorState.selectorActive, sendMessageToIframe, updateState]);

    // 请求组件树
    const requestComponentTree = useCallback(() => {
        sendMessageToIframe({ type: 'REQUEST_COMPONENT_TREE' });
    }, [sendMessageToIframe]);

    // 请求选择器状态
    const requestSelectorState = useCallback(() => {
        sendMessageToIframe({ type: 'GET_SELECTOR_STATE' });
    }, [sendMessageToIframe]);

    // 清空选中元素
    const clearSelection = useCallback(() => {
        sendMessageToIframe({
            type: 'UPDATE_SELECTED_ELEMENTS',
            payload: []
        });
        updateState({ selectedElements: [] });
    }, [sendMessageToIframe, updateState]);

    // 悬停元素
    const hoverElement = useCallback((element: ElementData) => {
        sendMessageToIframe({
            type: 'HOVER_ELEMENT_REQUESTED',
            payload: { id: { path: element.filePath, line: element.lineNumber } }
        });
    }, [sendMessageToIframe]);

    // 取消悬停
    const unhoverElement = useCallback((element: ElementData) => {
        sendMessageToIframe({
            type: 'UNHOVER_ELEMENT_REQUESTED',
            payload: { id: { path: element.filePath, line: element.lineNumber } }
        });
    }, [sendMessageToIframe]);

    // 处理来自iframe的消息
    const handleMessage = useCallback((event: MessageEvent<IframeMessage>) => {
        if (event.origin !== 'http://localhost:8080') return;

        const message = event.data;
        console.log('收到iframe消息:', message);

        // 记录消息历史
        setEditorState(prev => ({
            ...prev,
            messageHistory: [...prev.messageHistory.slice(-19), message],
            lastMessage: `${message.type}: ${new Date().toLocaleTimeString()}`
        }));

        switch (message.type) {
            case 'IFRAME_LOADED':
            case 'SELECTOR_SCRIPT_LOADED':
                updateState({ iframeLoaded: true });
                // 请求初始状态
                setTimeout(() => {
                    requestSelectorState();
                    requestComponentTree();
                }, 100);
                break;

            case 'ELEMENT_CLICKED':
                if (message.payload) {
                    const element = message.payload as ElementData;
                    const newSelectedElements = message.isMultiSelect 
                        ? [...editorState.selectedElements, element]
                        : [element];
                    
                    updateState({
                        selectedElements: newSelectedElements
                    });
                    
                    // 同步到 VisualEditorProvider
                    setVisualEditingSelectedElements(newSelectedElements);
                }
                break;

            case 'ELEMENT_DOUBLE_CLICKED':
                if (message.payload) {
                    console.log('元素双击:', message.payload);
                    // 可以在这里实现快速编辑功能
                }
                break;

            case 'SELECTOR_STATE_RESPONSE':
                updateState({ selectorActive: message.payload?.isActive || false });
                break;

            case 'COMPONENT_TREE':
                updateState({ componentTree: message.payload?.tree });
                break;

            case 'SCROLL_POSITION':
                updateState({ scrollPosition: message.payload });
                break;

            case 'NETWORK_REQUEST':
                setEditorState(prev => ({
                    ...prev,
                    networkRequests: [...prev.networkRequests.slice(-49), message.request]
                }));
                break;

            case 'CONSOLE_OUTPUT':
                setEditorState(prev => ({
                    ...prev,
                    consoleMessages: [...prev.consoleMessages.slice(-99), ...(message.messages || [])]
                }));
                break;

            case 'RUNTIME_ERROR':
            case 'UNHANDLED_PROMISE_REJECTION':
                setEditorState(prev => ({
                    ...prev,
                    errors: [...prev.errors.slice(-19), message.error]
                }));
                break;

            case 'KEYBIND':
                console.log('快捷键:', message.payload);
                break;

            case 'URL_CHANGED':
                console.log('URL变化:', message.url);
                break;

            case 'SCROLLABLE':
                console.log('页面可滚动');
                break;

            default:
                console.log('未处理的消息类型:', message.type);
        }
    }, [editorState.selectedElements, updateState, requestSelectorState, requestComponentTree, setVisualEditingSelectedElements]);

    // VisualEditor回调函数
    const handleElementSelect = useCallback((element: any) => {
        // 同步到iframe
        if (element && element.filePath && element.lineNumber) {
            sendMessageToIframe({
                type: 'UPDATE_SELECTED_ELEMENTS',
                payload: [element]
            });
        }
    }, [sendMessageToIframe]);

    const handleModeChange = useCallback((isActive: boolean) => {
        console.log('VisualEditor模式变化:', isActive);
        // 同步到iframe
        if (isActive !== editorState.selectorActive) {
            sendMessageToIframe({
                type: 'TOGGLE_SELECTOR',
                payload: isActive
            });
            updateState({ selectorActive: isActive });
        }
    }, [editorState.selectorActive, sendMessageToIframe, updateState]);

    // iframe加载完成处理
    const handleIframeLoad = useCallback(() => {
        console.log('iframe DOM加载完成');
        // updateState({ 
        //     iframeLoaded: true,
        //     lastMessage: 'iframe DOM加载完成'
        // });
    }, [updateState]);

    // 设置事件监听器
    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    // 当前选中的元素
    const selectedElement = editorState.selectedElements[0] || null;

    return (
        <VisualEditor
            onElementSelect={handleElementSelect}
            onModeChange={handleModeChange}
            showToolbar={true}
            showStatusBar={true}
            panelPosition="right"
        >
            <Chat />
        </VisualEditor>
    );
}

/**
 * 视觉编辑器演示页面 - 编辑iframe中的landingpage内容
 */
export default function VisualEditorWrap() {
    return (
        <div>
            {/* VisualEditor 包装iframe内容 */}
            <VisualEditorProvider>
                <VisualEditorWrapInner />
            </VisualEditorProvider>
        </div>
    );
} 