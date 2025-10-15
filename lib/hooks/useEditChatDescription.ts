import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { description as descriptionStore, type ChatHistoryItem } from '@/lib/persistence';

interface EditChatDescriptionOptions {
  initialDescription?: string;
  customChatId?: string;
  syncWithGlobalStore?: boolean;
}

type EditChatDescriptionHook = {
  editing: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => Promise<void>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  currentDescription: string;
  toggleEditMode: () => void;
};

/**
 * Hook to manage the state and behavior for editing chat descriptions.
 *
 * Offers functions to:
 * - Switch between edit and view modes.
 * - Manage input changes, blur, and form submission events.
 * - Save updates to IndexedDB and optionally to the global application state.
 *
 * @param {Object} options
 * @param {string} options.initialDescription - The current chat description.
 * @param {string} options.customChatId - Optional ID for updating the description via the sidebar.
 * @param {boolean} options.syncWithGlobalStore - Flag to indicate global description store synchronization.
 * @returns {EditChatDescriptionHook} Methods and state for managing description edits.
 */
export function useEditChatDescription({
  initialDescription = descriptionStore.get()!,
  customChatId,
  syncWithGlobalStore,
}: EditChatDescriptionOptions): EditChatDescriptionHook {
  // const chatIdFromStore = useStore(chatIdStore);
  const [editing, setEditing] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(initialDescription);
  const [chatId, setChatId] = useState<string>();

  // useEffect(() => {
  //   setChatId(customChatId || chatIdFromStore);
  // }, [customChatId, chatIdFromStore]);

  useEffect(() => {
    setCurrentDescription(initialDescription);
  }, [initialDescription]);

  const toggleEditMode = useCallback(() => setEditing((prev) => !prev), []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDescription(e.target.value);
  }, []);

  const fetchLatestDescription = useCallback(async () => {
    if (!chatId) {
      return initialDescription;
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch chat');
      
      const chat = (await response.json()) as ChatHistoryItem;
      return chat?.description || initialDescription;
    } catch (error) {
      console.error('Failed to fetch latest description:', error);
      return initialDescription;
    }
  }, [chatId, initialDescription]);

  const handleBlur = useCallback(async () => {
    // const latestDescription = await fetchLatestDescription();
    // setCurrentDescription(latestDescription);
    // toggleEditMode();
  }, [fetchLatestDescription, toggleEditMode]);

  const isValidDescription = useCallback((desc: string): boolean => {
    const trimmedDesc = desc.trim();

    if (trimmedDesc === initialDescription) {
      // toggleEditMode();
      return false;
    }

    const lengthValid = trimmedDesc.length > 0 && trimmedDesc.length <= 100;
    const characterValid = /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"]+$/.test(trimmedDesc);

    if (!lengthValid) {
      toast.error('Description must be between 1 and 100 characters.');
      return false;
    }

    if (!characterValid) {
      toast.error('Description can only contain letters, numbers, spaces, and basic punctuation.');
      return false;
    }

    return true;
  }, [initialDescription, toggleEditMode]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!isValidDescription(currentDescription)) {
        return;
      }

      if (!chatId) {
        toast.error('Chat Id is not available');
        return;
      }

      try {
        const response = await fetch(`/api/chats/${chatId}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: currentDescription }),
        });

        if (!response.ok) {
          throw new Error('Failed to update description');
        }

        setCurrentDescription(currentDescription);

        if (syncWithGlobalStore) {
          descriptionStore.set(currentDescription);
        }

        toast.success('Chat description updated successfully');
        setEditing(false);
      } catch (error) {
        toast.error('Failed to update chat description: ' + (error as Error).message);
      }
    },
    [chatId, currentDescription, isValidDescription, syncWithGlobalStore, toggleEditMode],
  );

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        await handleBlur();
      }
    },
    [handleBlur],
  );

  return {
    editing,
    handleChange,
    handleBlur,
    handleSubmit,
    handleKeyDown,
    currentDescription,
    toggleEditMode,
  };
}
