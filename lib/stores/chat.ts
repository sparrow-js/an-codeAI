import { atom, map } from 'nanostores';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
});

export const sendMessageFn = atom<((event: React.UIEvent, messageInput?: string) => Promise<void>) | null>(null);
