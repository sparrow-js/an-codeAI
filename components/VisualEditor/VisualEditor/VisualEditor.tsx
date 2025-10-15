import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVisualEditing, VisualEditorProvider } from '../hooks/useVisualEditing';
import { ElementEditor } from '../ElementEditor/ElementEditor';
import { cn } from "@/lib/utils"

/**
 * 视觉编辑器组件的属性类型
 */
interface VisualEditorProps {
    className?: string;
    children?: React.ReactNode;
    onElementSelect?: (element: any) => void;
    onModeChange?: (isActive: boolean) => void;
    disabled?: boolean;
    showToolbar?: boolean;
    showStatusBar?: boolean;
    panelPosition?: 'right' | 'left' | 'bottom';
}

/**
 * 可编辑包装组件的属性类型
 */
interface EditableWrapperProps {
    children: React.ReactNode;
    elementType?: string;
    elementId?: string;
    elementData?: any;
    className?: string;
    onHover?: () => void;
    onUnhover?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
}

/**
 * 工具栏组件
 */
const Toolbar: React.FC<{
    isPickAndEditActive: boolean;
    onToggle: () => void;
    selectedElement: any;
    onPanelToggle: () => void;
    isPanelOpen: boolean;
    canEdit: boolean;
    disabled?: boolean;
}> = ({ 
    isPickAndEditActive, 
    onToggle, 
    selectedElement, 
    onPanelToggle, 
    isPanelOpen, 
    canEdit,
    disabled = false
}) => {
    return (
        <div className="visual-editor-toolbar flex items-center justify-between p-4 bg-white border-b shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggle}
                    disabled={disabled || !canEdit}
                    className={cn(
                        "px-4 py-2 rounded-md font-medium transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2",
                        isPickAndEditActive
                            ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                            : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
                        (disabled || !canEdit) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isPickAndEditActive ? (
                        <>
                            <span className="mr-2">🛑</span>
                            退出编辑模式
                        </>
                    ) : (
                        <>
                            <span className="mr-2">✏️</span>
                            进入编辑模式
                        </>
                    )}
                </button>

                {selectedElement && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-700 font-medium">
                            已选中: {selectedElement.elementType || 'Unknown'}
                        </span>
                        {selectedElement.textContent && (
                            <span className="text-xs text-blue-600 max-w-32 truncate">
                                "{selectedElement.textContent}"
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onPanelToggle}
                    disabled={!selectedElement}
                    className={cn(
                        "px-3 py-2 text-sm rounded-md transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                        selectedElement
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
                >
                    <span className="mr-1">🎛️</span>
                    {isPanelOpen ? '隐藏编辑面板' : '显示编辑面板'}
                </button>
            </div>
        </div>
    );
};

/**
 * 状态栏组件
 */
const StatusBar: React.FC<{
    isPickAndEditActive: boolean;
    selectedElementsCount: number;
    canEdit: boolean;
    mode?: string;
}> = ({ isPickAndEditActive, selectedElementsCount, canEdit, mode = 'desktop' }) => {
    return (
        <div className="visual-editor-status flex items-center justify-between px-4 py-2 bg-gray-50 border-t text-sm">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        isPickAndEditActive ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className={cn(
                        "font-medium",
                        isPickAndEditActive ? "text-green-600" : "text-gray-500"
                    )}>
                        {isPickAndEditActive ? "编辑模式" : "预览模式"}
                    </span>
                </div>

                <div className="text-gray-600">
                    已选中: <span className="font-medium">{selectedElementsCount}</span> 个元素
                </div>

                <div className="text-gray-500">
                    视图: <span className="font-medium capitalize">{mode}</span>
                </div>
            </div>

            <div className={cn(
                "flex items-center gap-1 text-xs",
                canEdit ? "text-green-600" : "text-orange-600"
            )}>
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    canEdit ? "bg-green-500" : "bg-orange-500"
                )} />
                {canEdit ? "可编辑" : "只读模式"}
            </div>
        </div>
    );
};

/**
 * 可编辑包装组件
 */
export const EditableWrapper: React.FC<EditableWrapperProps> = ({ 
    children, 
    elementType = 'div',
    elementId,
    elementData,
    className,
    onHover,
    onUnhover,
    onClick,
    disabled = false
}) => {
    const { hoverElement, unhoverElement, isPickAndEditActive } = useVisualEditing();
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = useCallback(() => {
        if (disabled || !isPickAndEditActive) return;
        
        setIsHovered(true);
        onHover?.();
        
        if (elementId && elementData) {
            hoverElement({ data: { elementId, elementType, ...elementData } });
        }
    }, [disabled, isPickAndEditActive, onHover, elementId, elementData, elementType, hoverElement]);

    const handleMouseLeave = useCallback(() => {
        if (disabled || !isPickAndEditActive) return;
        
        setIsHovered(false);
        onUnhover?.();
        
        if (elementId && elementData) {
            unhoverElement({ data: { elementId, elementType, ...elementData } });
        }
    }, [disabled, isPickAndEditActive, onUnhover, elementId, elementData, elementType, unhoverElement]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (disabled || !isPickAndEditActive) return;
        
        e.stopPropagation();
        onClick?.(e);
        
        // 这里可以触发元素选择逻辑
        console.log('Element clicked:', { elementType, elementId, elementData });
    }, [disabled, isPickAndEditActive, onClick, elementType, elementId, elementData]);

    return (
        <div
            className={cn(
                "editable-wrapper relative",
                isPickAndEditActive && !disabled && "cursor-pointer",
                isHovered && isPickAndEditActive && !disabled && [
                    "outline outline-2 outline-blue-400 outline-offset-1",
                    "before:absolute before:inset-0 before:bg-blue-400/10 before:pointer-events-none"
                ],
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            data-element-type={elementType}
            data-element-id={elementId}
            data-editable={!disabled && isPickAndEditActive}
        >
            {children}
            
            {/* 编辑模式下的悬浮提示 */}
            {isHovered && isPickAndEditActive && !disabled && (
                <div className="absolute -top-6 left-0 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg pointer-events-none z-50">
                    {elementType} {elementId && `#${elementId}`}
                </div>
            )}
        </div>
    );
};

/**
 * 内部视觉编辑器组件
 */
const VisualEditorInner: React.FC<VisualEditorProps> = ({
    className,
    children,
    onElementSelect,
    onModeChange,
    disabled = false,
    showToolbar = true,
    showStatusBar = true,
    panelPosition = 'right'
}) => {
    const {
        isPickAndEditActive,
        togglePickAndEdit,
        selectedElements,
        canEdit
    } = useVisualEditing();

    const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedElement = selectedElements[0] || null;

    // 当有选中元素时自动打开编辑面板
    useEffect(() => {
        if (selectedElement && !disabled) {
            setIsEditorPanelOpen(true);
        }
    }, [selectedElement, disabled]);

    // 通知父组件模式变化
    useEffect(() => {
        onModeChange?.(isPickAndEditActive);
    }, [isPickAndEditActive, onModeChange]);

    // 通知父组件元素选择
    useEffect(() => {
        if (selectedElement) {
            onElementSelect?.(selectedElement);
        }
    }, [selectedElement, onElementSelect]);

    const handleTogglePickAndEdit = useCallback(() => {
        if (!disabled) {
            togglePickAndEdit();
        }
    }, [disabled, togglePickAndEdit]);

    const handlePanelToggle = useCallback(() => {
        setIsEditorPanelOpen(prev => !prev);
    }, []);

    const handlePanelClose = useCallback(() => {
        setIsEditorPanelOpen(false);
    }, []);

    const layoutClasses = cn(
        "visual-editor-container flex flex-col h-full",
        disabled && "opacity-75 pointer-events-none",
        className
    );

    const contentClasses = cn(
        "visual-editor-content flex flex-1 overflow-hidden",
        {
            'flex-row': panelPosition === 'right' || panelPosition === 'left',
            'flex-col': panelPosition === 'bottom'
        }
    );

    return (
        <div ref={containerRef} className={layoutClasses}>
            {/* 工具栏 */}
            {/* 主要内容区域 */}
            <div className={contentClasses}>
                {/* 预览区域 */}
                <div className="preview-area flex-1 relative overflow-auto">
         
                    {/* 内容区域 */}
                    <div className="preview-content p-4 min-h-full">
                        {children}
                    </div>
                    {/* 覆盖层 - 在禁用状态下显示 */}
                </div>

                {/* 右侧编辑面板 */}
                {/* 底部编辑面板 */}
            </div>
            {/* 状态栏 */}
        </div>
    );
};

/**
 * 主视觉编辑器组件 - 包含 Provider
 */
export const VisualEditor: React.FC<VisualEditorProps> = (props) => {
    return (
        <VisualEditorProvider>
            <VisualEditorInner {...props} />
        </VisualEditorProvider>
    );
};

export default VisualEditor; 