// 统一导出所有stores
export { ASTStore } from './ast';
export { WorkbenchStore } from './workbench';
export { WorkspaceStore, workspaceStore } from './workspace';
export { EditorStore } from './editor';
export { FilesStore } from './files';
export { PreviewsStore } from './previews';
export { useSettingsStore } from './settings';
export { themeStore } from './theme';
export { UserStore } from './user';
export { TerminalStore } from './terminal';
export { logStore } from './logs';
export { profileStore } from './profile';
export { chatStore } from './chat';
export { HistoryStore } from './historys';
export { tabConfigurationStore } from './tabConfigurationStore';

// 类型导出
export type { 
  CodeFile, 
  ASTFile, 
  ElementPosition, 
  JSXAttributes,
  WebSocketMessage,
  SyncCodeOptions,
  FileUpload,
  UploadResponse,
  CodeChange,
  EditCodeRequest,
  GeneratorConfigOptions
} from './ast';

// 工具函数导出
export { 
  astGeneration,
  generateAstFromFiles,
  generateCodeFromAST,
  createGeneratorOptions,
  updateJSXText,
  updateJSXAttributes,
  getJSXClassName,
  hasJSXAttribute,
  isEditableTextElement,
  getJSXElementByLine,
  getElementClassName,
  PRESERVE_SOURCE_FORMAT_CONFIG,
  COMPACT_FORMAT_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG
} from './ast';

// 全局AST store实例
import { ASTStore } from './ast';
export const astStore = new ASTStore(); 