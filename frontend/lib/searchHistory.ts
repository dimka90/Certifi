
export interface SearchItem {
    query: string;
    timestamp: number;
}

const STORAGE_KEY = 'certifi_search_history';
const MAX_HISTORY = 10;

export const searchHistory = {
    addSearch: (query: string): void => {
        if (!query.trim()) return;

        const history = searchHistory.getHistory();
        const newHistory = [
            { query: query.trim(), timestamp: Date.now() },
            ...history.filter(item => item.query.toLowerCase() !== query.trim().toLowerCase())
        ].slice(0, MAX_HISTORY);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    },

    getHistory: (): SearchItem[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    clearHistory: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
