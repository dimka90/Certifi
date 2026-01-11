
import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutMap {
    [key: string]: KeyHandler;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const ctrlKey = event.ctrlKey || event.metaKey;

            let shortcutKey = key;
            if (ctrlKey) shortcutKey = `ctrl+${key}`;
            if (event.shiftKey) shortcutKey = `shift+${shortcutKey}`;

            if (shortcuts[shortcutKey]) {
                event.preventDefault();
                shortcuts[shortcutKey](event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
