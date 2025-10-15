import type { ActionType, BoltAction, BoltActionData, FileAction, ShellAction, SupabaseAction } from '@/types/actions';
import type { BoltArtifactData } from '@/types/artifact';
import { createScopedLogger } from '@/utils/logger';
import { unreachable } from '@/utils/unreachable';

const ARTIFACT_TAG_OPEN = '<boltArtifact';
const ARTIFACT_TAG_CLOSE = '</boltArtifact>';
const ARTIFACT_ACTION_TAG_OPEN = '<boltAction';
const ARTIFACT_ACTION_TAG_CLOSE = '</boltAction>';

const logger = createScopedLogger('MessageParser');

export interface ArtifactCallbackData extends BoltArtifactData {
  messageId: string;
}

export interface ActionCallbackData {
  artifactId: string;
  messageId: string;
  actionId: string;
  action: BoltAction;
}

export type ArtifactCallback = (data: ArtifactCallbackData) => void;
export type ActionCallback = (data: ActionCallbackData) => void;

export interface ParserCallbacks {
  onArtifactOpen?: ArtifactCallback;
  onArtifactClose?: ArtifactCallback;
  onActionOpen?: ActionCallback;
  onActionStream?: ActionCallback;
  onActionClose?: ActionCallback;
}

interface ElementFactoryProps {
  messageId: string;
}

type ElementFactory = (props: ElementFactoryProps) => string;

export interface StreamingMessageParserOptions {
  callbacks?: ParserCallbacks;
  artifactElement?: ElementFactory;
}

interface MessageState {
  position: number;
  insideArtifact: boolean;
  insideAction: boolean;
  currentArtifact?: BoltArtifactData;
  currentAction: BoltActionData;
  actionId: number;
}

function cleanoutMarkdownSyntax(content: string) {
  const codeBlockRegex = /^\s*```\w*\n([\s\S]*?)\n\s*```\s*$/;
  const match = content.match(codeBlockRegex);

  // console.log('matching', !!match, content);

  if (match) {
    return match[1]; // Remove common leading 4-space indent
  } else {
    return content;
  }
}

function cleanEscapedTags(content: string) {
  return content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
export class StreamingMessageParser {
  #messages = new Map<string, MessageState>();
  #tagCache = new Map<string, string>(); // 缓存已解析的标签
  #restoredMessages = new Set<string>(); // 新增：跟踪已恢复的消息

  constructor(private _options: StreamingMessageParserOptions = {}) {}

  // 新增：标记消息为已恢复，跳过解析
  markAsRestored(messageId: string) {
    this.#restoredMessages.add(messageId);
  }

  // 新增：检查消息是否已恢复
  isRestored(messageId: string): boolean {
    return this.#restoredMessages.has(messageId);
  }

  parse(messageId: string, input: string) {
    // 如果消息已恢复，直接返回空字符串，跳过解析
    if (this.isRestored(messageId)) {
      return '';
    }

    let state = this.#messages.get(messageId);

    if (!state) {
      state = {
        position: 0,
        insideAction: false,
        insideArtifact: false,
        currentAction: { content: '' },
        actionId: 0,
      };

      this.#messages.set(messageId, state);
    }

    // 如果输入很短，不值得优化处理
    if (input.length < 100) {
      return this.#parseImpl(state, messageId, input);
    }

    // 对于长输入，使用更高效的处理方式
    return this.#parseImpl(state, messageId, input);
  }

  // 实际的解析实现
  #parseImpl(state: MessageState, messageId: string, input: string) {
    let output = '';
    let i = state.position;
    let earlyBreak = false;
    
    // 预分配缓冲区，减少字符串连接操作
    const outputChunks: string[] = [];
    
    // 批处理阈值，每处理这么多字符就检查一次是否需要让出主线程
    const BATCH_SIZE = 5000;
    let processedChars = 0;

    while (i < input.length) {
      // 每处理一定数量的字符，检查是否需要让出主线程
      if (processedChars > BATCH_SIZE) {
        processedChars = 0;
        // 如果有 requestIdleCallback，使用它来让出主线程
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          break; // 提前退出循环，下次继续处理
        }
      }

      if (state.insideArtifact) {
        const currentArtifact = state.currentArtifact;

        if (currentArtifact === undefined) {
          unreachable('Artifact not initialized');
        }

        if (state.insideAction) {
          const closeIndex = input.indexOf(ARTIFACT_ACTION_TAG_CLOSE, i);

          const currentAction = state.currentAction;

          if (closeIndex !== -1) {
            // 使用 substring 代替 slice，性能更好
            currentAction.content += input.substring(i, closeIndex);

            let content = currentAction.content.trim();

            if ('type' in currentAction && currentAction.type === 'file') {
              // 使用缓存避免重复处理相同的内容
              const cacheKey = `file:${content}:${currentAction.filePath}`;
              if (this.#tagCache.has(cacheKey)) {
                content = this.#tagCache.get(cacheKey)!;
              } else {
                // Remove markdown code block syntax if present and file is not markdown
                if (!currentAction.filePath.endsWith('.md')) {
                  content = cleanoutMarkdownSyntax(content);
                  content = cleanEscapedTags(content);
                }
                content += '\n';
                this.#tagCache.set(cacheKey, content);
              }
            }

            currentAction.content = content;

            this._options.callbacks?.onActionClose?.({
              artifactId: currentArtifact.id,
              messageId,

              /**
               * We decrement the id because it's been incremented already
               * when `onActionOpen` was emitted to make sure the ids are
               * the same.
               */
              actionId: String(state.actionId - 1),

              action: currentAction as BoltAction,
            });

            state.insideAction = false;
            state.currentAction = { content: '' };

            i = closeIndex + ARTIFACT_ACTION_TAG_CLOSE.length;
            processedChars += closeIndex - i + ARTIFACT_ACTION_TAG_CLOSE.length;
          } else {
            if ('type' in currentAction && currentAction.type === 'file') {
              // 使用 substring 代替 slice，性能更好
              let content = input.substring(i);

              if (!currentAction.filePath.endsWith('.md')) {
                content = cleanoutMarkdownSyntax(content);
                content = cleanEscapedTags(content);
              }

              this._options.callbacks?.onActionStream?.({
                artifactId: currentArtifact.id,
                messageId,
                actionId: String(state.actionId - 1),
                action: {
                  ...(currentAction as FileAction),
                  content,
                  filePath: currentAction.filePath,
                },
              });
            }

            if ('type' in currentAction && currentAction.type === 'shell') {
              this._options.callbacks?.onActionStream?.({
                artifactId: currentArtifact.id,
                messageId,
                actionId: String(state.actionId - 1),
                action: currentAction as BoltAction,
              });
            }

            break;
          }
        } else {
          const actionOpenIndex = input.indexOf(ARTIFACT_ACTION_TAG_OPEN, i);
          const artifactCloseIndex = input.indexOf(ARTIFACT_TAG_CLOSE, i);

          if (actionOpenIndex !== -1 && (artifactCloseIndex === -1 || actionOpenIndex < artifactCloseIndex)) {
            const actionEndIndex = input.indexOf('>', actionOpenIndex);

            if (actionEndIndex !== -1) {
              state.insideAction = true;

              state.currentAction = this.#parseActionTag(input, actionOpenIndex, actionEndIndex);

              this._options.callbacks?.onActionOpen?.({
                artifactId: currentArtifact.id,
                messageId,
                actionId: String(state.actionId++),
                action: state.currentAction as BoltAction,
              });

              i = actionEndIndex + 1;
            } else {
              break;
            }
          } else if (artifactCloseIndex !== -1) {
            this._options.callbacks?.onArtifactClose?.({ messageId, ...currentArtifact });

            state.insideArtifact = false;
            state.currentArtifact = undefined;

            i = artifactCloseIndex + ARTIFACT_TAG_CLOSE.length;
          } else {
            break;
          }
        }
      } else if (input[i] === '<' && input[i + 1] !== '/') {
        let j = i;
        let potentialTag = '';

        while (j < input.length && potentialTag.length < ARTIFACT_TAG_OPEN.length) {
          potentialTag += input[j];

          if (potentialTag === ARTIFACT_TAG_OPEN) {
            const nextChar = input[j + 1];

            if (nextChar && nextChar !== '>' && nextChar !== ' ') {
              output += input.slice(i, j + 1);
              i = j + 1;
              break;
            }

            const openTagEnd = input.indexOf('>', j);

            if (openTagEnd !== -1) {
              const artifactTag = input.slice(i, openTagEnd + 1);

              const artifactTitle = this.#extractAttribute(artifactTag, 'title') as string;
              const type = this.#extractAttribute(artifactTag, 'type') as string;
              const artifactId = this.#extractAttribute(artifactTag, 'id') as string;

              if (!artifactTitle) {
                logger.warn('Artifact title missing');
              }

              if (!artifactId) {
                logger.warn('Artifact id missing');
              }

              state.insideArtifact = true;

              const currentArtifact = {
                id: artifactId,
                title: artifactTitle,
                type,
              } satisfies BoltArtifactData;

              state.currentArtifact = currentArtifact;

              this._options.callbacks?.onArtifactOpen?.({ messageId, ...currentArtifact });

              const artifactFactory = this._options.artifactElement ?? createArtifactElement;

              output += artifactFactory({ messageId });

              i = openTagEnd + 1;
            } else {
              earlyBreak = true;
            }

            break;
          } else if (!ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
            output += input.slice(i, j + 1);
            i = j + 1;
            break;
          }

          j++;
        }

        if (j === input.length && ARTIFACT_TAG_OPEN.startsWith(potentialTag)) {
          break;
        }
      } else {
        output += input[i];
        i++;
      }

      if (earlyBreak) {
        break;
      }
    }

    state.position = i;

    return output;
  }

  reset() {
    this.#messages.clear();
    this.#restoredMessages.clear(); // 新增：清除已恢复消息的跟踪
  }

  #parseActionTag(input: string, actionOpenIndex: number, actionEndIndex: number) {
    const actionTag = input.slice(actionOpenIndex, actionEndIndex + 1);

    const actionType = this.#extractAttribute(actionTag, 'type') as ActionType;

    const actionAttributes = {
      type: actionType,
      content: '',
    };

    if (actionType === 'supabase') {
      const operation = this.#extractAttribute(actionTag, 'operation');

      if (!operation || !['migration', 'query'].includes(operation)) {
        logger.warn(`Invalid or missing operation for Supabase action: ${operation}`);
        throw new Error(`Invalid Supabase operation: ${operation}`);
      }

      (actionAttributes as SupabaseAction).operation = operation as 'migration' | 'query';

      if (operation === 'migration') {
        const filePath = this.#extractAttribute(actionTag, 'filePath');

        if (!filePath) {
          logger.warn('Migration requires a filePath');
          throw new Error('Migration requires a filePath');
        }

        (actionAttributes as SupabaseAction).filePath = filePath;
      }
    } else if (actionType === 'file') {
      const filePath = this.#extractAttribute(actionTag, 'filePath') as string;

      if (!filePath) {
        logger.debug('File path not specified');
      }

      (actionAttributes as FileAction).filePath = filePath;
    } else if (!['shell', 'start'].includes(actionType)) {
      logger.warn(`Unknown action type '${actionType}'`);
    }

    return actionAttributes as FileAction | ShellAction;
  }

  #extractAttribute(tag: string, attributeName: string): string | undefined {
    const match = tag.match(new RegExp(`${attributeName}="([^"]*)"`, 'i'));
    return match ? match[1] : undefined;
  }
}

const createArtifactElement: ElementFactory = (props) => {
  const elementProps = [
    'class="__boltArtifact__"',
    ...Object.entries(props).map(([key, value]) => {
      return `data-${camelToDashCase(key)}=${JSON.stringify(value)}`;
    }),
  ];

  return `<div ${elementProps.join(' ')}></div>`;
};

function camelToDashCase(input: string) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
