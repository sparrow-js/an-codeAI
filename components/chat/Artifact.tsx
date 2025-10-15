import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useEffect, useRef, useState } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import { Files, Loader2, Terminal, Circle, Check, X, ChevronUp, ChevronDown, ChevronRight, Database } from 'lucide-react';
import type { ActionState } from '@/lib/runtime/action-runner';
import { workbenchStore } from '@/lib/stores/workbench';
import { classNames } from '@/utils/classNames';
import { cubicEasingFn } from '@/utils/easings';
import { WORK_DIR } from '@/utils/constants';
import type { SupabaseAction } from '@/types/actions';
import { chatId } from '@/lib/persistence/useChatHistory';
import { toast } from 'react-toastify';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> = (await createHighlighter(highlighterOptions));


interface ArtifactProps {
  messageId: string;
}

export const Artifact = memo(({ messageId }: ArtifactProps) => {
  const userToggledActions = useRef(false);
  const [showActions, setShowActions] = useState(false);
  const [allActionFinished, setAllActionFinished] = useState(false);

  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[messageId];

  const actions = useStore(
    computed(artifact?.runner.actions, (actions) => {
      return Object.values(actions);
    }),
  );

  const toggleActions = () => {
    userToggledActions.current = true;
    setShowActions(!showActions);
  };

  useEffect(() => {
    if (actions.length && !showActions && !userToggledActions.current) {
      setShowActions(true);
    }

    if (actions.length !== 0 && artifact.type === 'bundled') {
      const finished = !actions.find((action) => action.status !== 'complete');

      if (allActionFinished !== finished) {
        setAllActionFinished(finished);
      }
    }
  }, [actions]);

  return (
    <div className="artifact border border-bolt-elements-borderColor flex flex-col overflow-hidden rounded-lg w-full transition-border duration-150">
      <div className="flex">
        <button
          className="flex items-stretch bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover w-full overflow-hidden"
          onClick={() => {
            const showWorkbench = workbenchStore.showWorkbench.get();
            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          {artifact.type == 'bundled' && (
            <>
              <div className="p-4 flex items-center justify-center">
                {allActionFinished ? (
                  <Files className='w-5 h-5'/>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      ease: "linear",
                      repeatType: "loop"
                    }}
                  >
                    <Loader2 className='w-5 h-5'/>
                  </motion.div>
                )}
              </div>
              <div className="bg-bolt-elements-artifacts-borderColor w-[1px]" />
            </>
          )}
          <div className="px-5 p-3.5 w-full text-left">
            <div className="w-full text-bolt-elements-textPrimary font-medium leading-5 text-sm">{artifact?.title}</div>
            <div className="w-full text-bolt-elements-textSecondary text-xs mt-0.5">Click to open Workbench</div>
          </div>
        </button>
        <div className="bg-bolt-elements-artifacts-borderColor w-[1px]" />
        <AnimatePresence>
          {actions.length && artifact.type !== 'bundled' && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover"
              onClick={toggleActions}
            >
              <div className="p-4">
                {showActions ? <ChevronUp /> : <ChevronDown />}
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {artifact.type !== 'bundled' && showActions && actions.length > 0 && (
          <motion.div
            className="actions"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-bolt-elements-artifacts-borderColor h-[1px]" />

            <div className="p-5 text-left bg-bolt-elements-actions-background">
              <ActionList actions={actions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      dangerouslySetInnerHTML={{
        __html: shellHighlighter.codeToHtml(code, {
          lang: 'shell',
          theme: 'dark-plus',
        }),
      }}
    ></div>
  );
}

interface ActionListProps {
  actions: ActionState[];
}

const actionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function openArtifactInWorkbench(filePath: any) {
  workbenchStore.setSelectedFile(`${WORK_DIR}/${filePath}`);
}


interface SupabaseActionCardProps {
  action: ActionState & SupabaseAction;
  isLast: boolean;
}

const SupabaseActionCard = memo(({ action, isLast }: SupabaseActionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [executionMode, setExecutionMode] = useState<'ask' | 'auto'>('ask');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleAllow = async () => {
    const currentChatId = chatId.get();
    
    if (!currentChatId) {
      toast.error('Chat ID not found');
      return;
    }

    setIsExecuting(true);

    try {
      const response = await fetch('/api/supabase/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: action.content,
          chatId: currentChatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute SQL query');
      }

      toast.success('SQL query executed successfully');
      console.log('Execution result:', data);
    } catch (error: any) {
      console.error('Error executing Supabase action:', error);
      toast.error(error.message || 'Failed to execute SQL query');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={classNames('w-full', { 'mb-3.5': !isLast })}>
      {/* Main Card */}
      <div className="border border-bolt-elements-borderColor rounded-lg overflow-hidden bg-bolt-elements-artifacts-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-bolt-elements-artifacts-background border-b border-bolt-elements-borderColor">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-bolt-elements-textSecondary" />
            <span className="text-sm font-medium text-bolt-elements-textPrimary">
              Modify database
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAllow}
              disabled={isExecuting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors flex items-center gap-1"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <span>Allow</span>
              )}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-bolt-elements-artifacts-backgroundHover rounded transition-colors"
            >
              <ChevronDown
                className={classNames('w-4 h-4 text-bolt-elements-textSecondary transition-transform', {
                  'rotate-180': isExpanded,
                })}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* SQL Content with gradient mask */}
          <div className="relative">
            <div 
              className={classNames(
                'bg-bolt-elements-background rounded-md border border-bolt-elements-borderColor overflow-hidden',
                { 'max-h-32': !isExpanded }
              )}
            >
              <ShellCodeBlock code={action.content} />
            </div>
            
            {/* Gradient mask overlay when collapsed */}
            {!isExpanded && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent, var(--bolt-elements-background))'
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-bolt-elements-artifacts-background border-t border-bolt-elements-borderColor">
          <div className="flex items-center gap-2">
            <select
              value={executionMode}
              onChange={(e) => setExecutionMode(e.target.value as 'ask' | 'auto')}
              className="text-sm bg-transparent border border-bolt-elements-borderColor rounded px-2 py-1 text-bolt-elements-textPrimary cursor-pointer hover:bg-bolt-elements-artifacts-backgroundHover"
            >
              <option value="ask">Ask each time</option>
              <option value="auto">Run automatically</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-bolt-elements-textSecondary">
            <Database className="w-3 h-3" />
            <span>Cloud</span>
            {action.status === 'complete' && <Check className="w-3 h-3 text-bolt-elements-icon-success" />}
            {action.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
            {action.status === 'failed' && <X className="w-3 h-3 text-bolt-elements-icon-error" />}
          </div>
        </div>
      </div>

      {/* File Path Link (if exists) */}
      {action.filePath && (
        <div className="mt-2 text-xs text-bolt-elements-textSecondary flex items-center gap-1">
          <span>Migration file:</span>
          <code
            className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-0.5 rounded text-bolt-elements-item-contentAccent hover:underline cursor-pointer"
            onClick={() => openArtifactInWorkbench(action.filePath)}
          >
            {action.filePath}
          </code>
        </div>
      )}
    </div>
  );
});

const ActionList = memo(({ actions }: ActionListProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <ul className="list-none space-y-2.5">
        {actions.map((action, index) => {
          const { status, type, content } = action;
          const isLast = index === actions.length - 1;

          // Use the new SupabaseActionCard for supabase actions
          if (type === 'supabase') {
            return (
              <motion.li
                key={index}
                variants={actionVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 0.2,
                  ease: cubicEasingFn,
                }}
              >
                <SupabaseActionCard action={action as ActionState & SupabaseAction} isLast={isLast} />
              </motion.li>
            );
          }

          return (
            <motion.li
              key={index}
              variants={actionVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.2,
                ease: cubicEasingFn,
              }}
            >
              <div className="flex items-center gap-1.5 text-sm">
                <div className={classNames('text-lg', getIconColor(action.status))}>
                  {status === 'running' ? (
                    <>
                      {type !== 'start' ? (
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            ease: "linear",
                            repeatType: "loop"
                          }}
                        >
                          <Loader2 className='w-4 h-4'/>
                        </motion.div>
                      ) : (
                        <Terminal className='w-4 h-4'/>
                      )}
                    </>
                  ) : status === 'pending' ? (
                    <Circle className='w-4 h-4'/>
                  ) : status === 'complete' ? (
                    <Check className='w-4 h-4'/>
                  ) : status === 'failed' || status === 'aborted' ? (
                    <X className='w-4 h-4'/>
                  ) : null}
                </div>
                {type === 'file' ? (
                  <div>
                    Create{' '}
                    <code
                      className="bg-bolt-elements-artifacts-inlineCode-background text-bolt-elements-artifacts-inlineCode-text px-1.5 py-1 rounded-md text-bolt-elements-item-contentAccent hover:underline cursor-pointer"
                      onClick={() => openArtifactInWorkbench(action.filePath)}
                    >
                      {action.filePath}
                    </code>
                  </div>
                ) : type === 'shell' ? (
                  <div className="flex items-center w-full min-h-[28px]">
                    <span className="flex-1">Run command</span>
                  </div>
                ) : type === 'start' ? (
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      workbenchStore.currentView.set('preview');
                    }}
                    className="flex items-center w-full min-h-[28px]"
                  >
                    <span className="flex-1">Start Application</span>
                  </a>
                ) : null}
              </div>
              {(type === 'shell' || type === 'start') && (
                <ShellCodeBlock
                  classsName={classNames('mt-1', {
                    'mb-3.5': !isLast,
                  })}
                  code={content}
                />
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
});

function getIconColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-bolt-elements-textTertiary';
    }
    case 'running': {
      return 'text-bolt-elements-loader-progress';
    }
    case 'complete': {
      return 'text-bolt-elements-icon-success';
    }
    case 'aborted': {
      return 'text-bolt-elements-textSecondary';
    }
    case 'failed': {
      return 'text-bolt-elements-icon-error';
    }
    default: {
      return undefined;
    }
  }
}
