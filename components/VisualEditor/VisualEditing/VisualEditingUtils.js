// 视觉编辑相关的工具函数
import { useCallback, useContext } from 'react';

/**
 * 消息类型枚举
 */
export const MessageTypes = {
    ELEMENT_CLICKED: "ELEMENT_CLICKED",
    TOGGLE_SELECTOR: "TOGGLE_SELECTOR", 
    UPDATE_SELECTED_ELEMENTS: "UPDATE_SELECTED_ELEMENTS",
    SELECTOR_STATE_RESPONSE: "SELECTOR_STATE_RESPONSE",
    TOGGLE_PICK_AND_EDIT_REQUESTED: "TOGGLE_PICK_AND_EDIT_REQUESTED",
    REQUEST_PICKER_STATE: "REQUEST_PICKER_STATE",
    SELECTOR_SCRIPT_LOADED: "SELECTOR_SCRIPT_LOADED",
    GET_SELECTOR_STATE: "GET_SELECTOR_STATE",
    REQUEST_SELECTED_ELEMENTS: "REQUEST_SELECTED_ELEMENTS",
    SET_ELEMENT_CONTENT: "SET_ELEMENT_CONTENT",
    SET_ELEMENT_ATTRS: "SET_ELEMENT_ATTRS",
    SET_STYLESHEET: "SET_STYLESHEET",
    EDIT_TEXT_REQUESTED: "EDIT_TEXT_REQUESTED",
    ELEMENT_DOUBLE_CLICKED: "ELEMENT_DOUBLE_CLICKED",
    ELEMENT_TEXT_UPDATED: "ELEMENT_TEXT_UPDATED",
    COMPONENT_TREE: "COMPONENT_TREE",
    REQUEST_COMPONENT_TREE: "REQUEST_COMPONENT_TREE",
    HOVER_ELEMENT_REQUESTED: "HOVER_ELEMENT_REQUESTED",
    UNHOVER_ELEMENT_REQUESTED: "UNHOVER_ELEMENT_REQUESTED",
    KEYBIND: "KEYBIND",
    DUPLICATE_ELEMENT_REQUESTED: "DUPLICATE_ELEMENT_REQUESTED",
    GET_PARENT_ELEMENT: "GET_PARENT_ELEMENT",
    PARENT_ELEMENT: "PARENT_ELEMENT"
};

/**
 * 发送消息到iframe的Hook
 */
export function useIframeMessaging() {
    // 使用 Context 或直接传入 activeMode
    const sendMessage = useCallback((message, activeMode = 'desktop') => {
        const iframeId = getIframeId(activeMode);
        const iframes = document.querySelectorAll(`iframe#preview`);
        iframes.forEach(iframe => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage(message, "*");
            }
        });
    }, []);
    
    return sendMessage;
}

/**
 * 计算元素浮动面板位置
 */
export function calculateFloatingPosition({ elementBounds, iframe, elementWidth, elementHeight, elementSpacing }) {
    const topPosition = elementBounds.y + elementBounds.height + elementSpacing;
    
    // 检查是否有足够空间在下方显示
    if (topPosition + elementHeight + 16 <= iframe.offsetHeight) {
        return topPosition;
    }
    
    // 尝试在上方显示
    const bottomPosition = elementBounds.y - elementHeight - elementSpacing;
    if (bottomPosition >= 16) {
        return bottomPosition;
    }
    
    // 默认显示在元素旁边
    return elementBounds.y + 8;
}

/**
 * 计算水平居中位置
 */
export function calculateCenterPosition({ elementBounds, iframe, elementWidth }) {
    const centerX = elementBounds.x + elementBounds.width / 2 - elementWidth / 2;
    
    // 确保不超出边界
    if (centerX + elementWidth > iframe.offsetWidth - 16) {
        return iframe.offsetWidth - elementWidth - 16;
    }
    
    if (centerX < 16) {
        return 16;
    }
    
    return centerX;
}

/**
 * iframe坐标转换为页面坐标
 */
export function iframeToPageCoordinates({ iframeRect, x, y }) {
    return {
        x: iframeRect.x + x,
        y: iframeRect.y + y
    };
}

// 常量定义
export const FLOATING_INPUT_HEIGHT = 100;
export const FLOATING_INPUT_WIDTH = 400;
export const FLOATING_INPUT_SPACING = 8;
export const VISUAL_EDITS_PANEL_HEIGHT = 600;
export const VISUAL_EDITS_PANEL_WIDTH = 380;
export const VISUAL_EDITS_PANEL_SPACING = 16;

function getIframeElement(visibleMode) {
    const iframeId = getIframeId(visibleMode);
    return document.querySelector(`iframe#${iframeId}`);
}

function getIframeId(mode) {
    // 根据模式返回对应的iframe ID
    return `preview-${mode}`;
} 