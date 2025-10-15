import type { WebContainer } from '@webcontainer/api';
import { path } from '@/utils/path';
import { atom, map, type MapStore } from 'nanostores';
import type { ActionAlert, BoltAction } from '@/types/actions';
import { createScopedLogger } from '@/utils/logger';
import { unreachable } from '@/utils/unreachable';
import type { ActionCallbackData } from './message-parser';
import type { BoltShell } from '@/utils/shell';
import { workbenchStore } from '@/lib/stores/workbench';
import type { SupabaseAction } from '@/types/actions';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = BoltAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = BoltAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

class ActionCommandError extends Error {
  readonly _output: string;
  readonly _header: string;

  constructor(message: string, output: string) {
    // Create a formatted message that includes both the error message and output
    const formattedMessage = `Failed To Execute Shell Command: ${message}\n\nOutput:\n${output}`;
    super(formattedMessage);

    // Set the output separately so it can be accessed programmatically
    this._header = message;
    this._output = output;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ActionCommandError.prototype);

    // Set the name of the error for better debugging
    this.name = 'ActionCommandError';
  }

  // Optional: Add a method to get just the terminal output
  get output() {
    return this._output;
  }
  get header() {
    return this._header;
  }
}

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();
  #shellTerminal: () => BoltShell;
  runnerId = atom<string>(`${Date.now()}`);
  actions: ActionsMap = map({});
  onAlert?: (alert: ActionAlert) => void;
  #fileCache = new Map<string, string>(); // 文件内容缓存

  constructor(
    webcontainerPromise: Promise<WebContainer>,
    getShellTerminal: () => BoltShell,
    onAlert?: (alert: ActionAlert) => void,
  ) {
    this.#webcontainer = webcontainerPromise;
    this.#shellTerminal = getShellTerminal;
    this.onAlert = onAlert;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData, isStreaming: boolean = false) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];
    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return; // No return value here
    }

    if (isStreaming && action.type !== 'file') {
      return; // No return value here
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: !isStreaming });

    // 使用 requestAnimationFrame 来延迟执行，避免阻塞主线程
    if (!isStreaming) {
      this.#currentExecutionPromise = this.#currentExecutionPromise
        .then(() => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              this.#executeAction(actionId, isStreaming)
                .then(resolve)
                .catch((error) => {
                  console.error('Action failed:', error);
                  resolve();
                });
            }, 0);
          });
        });
    } else {
      this.#currentExecutionPromise = this.#currentExecutionPromise
        .then(() => {
          return this.#executeAction(actionId, isStreaming);
        })
        .catch((error) => {
          console.error('Action failed:', error);
        });
    }

    await this.#currentExecutionPromise;

    return;
  }

  async handleSupabaseAction(action: SupabaseAction) {
    const { operation, content, filePath } = action;
    logger.debug('[Supabase Action]:', { operation, filePath, content });

    switch (operation) {
      case 'migration':
        if (!filePath) {
          throw new Error('Migration requires a filePath');
        }

        // Show alert for migration action
        // this.onSupabaseAlert?.({
        //   type: 'info',
        //   title: 'Supabase Migration',
        //   description: `Create migration file: ${filePath}`,
        //   content,
        //   source: 'supabase',
        // });

        console.log('**********8', filePath, content);
        
        // 直接创建文件并更新编辑器（不使用 #runFileAction 避免异步延迟）
        // 去掉 filePath 前面的斜杠（如果有的话）避免路径中出现双斜杠
        const normalizedFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const fullPath = `/home/project/${normalizedFilePath}`;
        
        // 1. 写入文件到 files store
        workbenchStore.files.setKey(fullPath, { 
          type: 'file', 
          content, 
          isBinary: false 
        });
        
        logger.debug(`File written ${fullPath}`);
        
        // 2. 更新编辑器文档
        workbenchStore.setDocuments(workbenchStore.files.get());
        
        // 3. 选中并打开文件
        workbenchStore.setSelectedFile(fullPath);
        
        return { success: true };

      case 'query': {
        // Always show the alert and let the SupabaseAlert component handle connection state
        // this.onSupabaseAlert?.({
        //   type: 'info',
        //   title: 'Supabase Query',
        //   description: 'Execute database query',
        //   content,
        //   source: 'supabase',
        // });

        // The actual execution will be triggered from SupabaseChatAlert
        return { pending: true };
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async #executeAction(actionId: string, isStreaming: boolean = false) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          console.log('**********8', action);
          await this.#runFileAction(action);
          break;
        }
        case 'supabase': {
          try {
            await this.handleSupabaseAction(action as SupabaseAction);
          } catch (error: any) {
            // Update action status
            this.#updateAction(actionId, {
              status: 'failed',
              error: error instanceof Error ? error.message : 'Supabase action failed',
            });

            // Return early without re-throwing
            return;
          }
          break;
        }
        case 'start': {
          // making the start app non blocking

          this.#runStartAction(action)
            .then(() => this.#updateAction(actionId, { status: 'complete' }))
            .catch((err: Error) => {
              if (action.abortSignal.aborted) {
                return;
              }

              this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
              logger.error(`[${action.type}]:Action failed\n\n`, err);

              if (!(err instanceof ActionCommandError)) {
                return;
              }

              this.onAlert?.({
                type: 'error',
                title: 'Dev Server Failed',
                description: err.header,
                content: err.output,
              });
            });

          /*
           * adding a delay to avoid any race condition between 2 start actions
           * i am up for a better approach
           */
          await new Promise((resolve) => setTimeout(resolve, 2000));

          return;
        }
      }

      this.#updateAction(actionId, {
        status: isStreaming ? 'running' : action.abortSignal.aborted ? 'aborted' : 'complete',
      });
    } catch (error) {
      if (action.abortSignal.aborted) {
        return;
      }

      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });
      logger.error(`[${action.type}]:Action failed\n\n`, error);

      if (!(error instanceof ActionCommandError)) {
        return;
      }

      this.onAlert?.({
        type: 'error',
        title: 'Dev Server Failed',
        description: error.header,
        content: error.output,
      });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (workbenchStore.startStreaming.get() === true) {
      if (action.content.includes('npm install')) {
        workbenchStore.installDependencies.set(action.content);
      }
    }

    // if (action.type !== 'shell') {
    //   unreachable('Expected shell action');
    // }

    // const shell = this.#shellTerminal();
    // await shell.ready();

    // if (!shell || !shell.terminal || !shell.process) {
    //   unreachable('Shell terminal not found');
    // }

    // const resp = await shell.executeCommand(this.runnerId.get(), action.content, () => {
    //   logger.debug(`[${action.type}]:Aborting Action\n\n`, action);
    //   action.abort();
    // });
    // logger.debug(`${action.type} Shell Response: [exit code:${resp?.exitCode}]`);

    // if (resp?.exitCode != 0) {
    //   throw new ActionCommandError(`Failed To Execute Shell Command`, resp?.output || 'No Output Available');
    // }
  }

  async #runStartAction(action: ActionState) {
    if (action.type !== 'start') {
      unreachable('Expected shell action');
    }

    if (!this.#shellTerminal) {
      unreachable('Shell terminal not found');
    }

    const shell = this.#shellTerminal();
    await shell.ready();

    if (!shell || !shell.terminal || !shell.process) {
      unreachable('Shell terminal not found');
    }

    const resp = await shell.executeCommand(this.runnerId.get(), action.content, () => {
      logger.debug(`[${action.type}]:Aborting Action\n\n`, action);
      action.abort();
    });
    logger.debug(`${action.type} Shell Response: [exit code:${resp?.exitCode}]`);

    if (resp?.exitCode != 0) {
      throw new ActionCommandError('Failed To Start Application', resp?.output || 'No Output Available');
    }

    return resp;
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    // 检查缓存中是否有相同内容的文件，避免重复处理
    const cacheKey = `${action.filePath}:${action.content.length}:${action.content.substring(0, 100)}`;
    if (this.#fileCache.has(cacheKey)) {
      return;
    }
    
    // 更新缓存
    this.#fileCache.set(cacheKey, action.content);

    try {
      // 使用 requestAnimationFrame 延迟文件写入，避免阻塞主线程
      if (typeof window !== 'undefined') {
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            workbenchStore.files.setKey(`/home/project/${action.filePath}`, { 
              type: 'file', 
              content: action.content, 
              isBinary: false 
            });
            // workbenchStore.setGeneratedFile(`/home/project/${action.filePath}`);
            resolve();
          }, 0);
        });
      } else {
        workbenchStore.files.setKey(`/home/project/${action.filePath}`, { 
          type: 'file', 
          content: action.content, 
          isBinary: false 
        });
      }
      
      logger.debug(`File written /home/project/${action.filePath}`);
    } catch (error) {
      logger.error('Failed to write file\n\n', error);
    }
  }
  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
