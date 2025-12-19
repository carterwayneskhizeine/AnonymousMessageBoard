import {
    globalSearchContainer
} from './ui-elements.js';
import {
    fetchAndRenderSearchResults
} from './api-rendering-logic.js';

let searchTimeout;

export const initSearchHandler = () => {
    const searchInput = globalSearchContainer.querySelector('input');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', (e) => {
        clearTimeout(searchTimeout);

        // instant search on Enter
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            fetchAndRenderSearchResults(query, 1);
            return;
        }

        // Debounced search for other keys
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query.length > 2 || query.length === 0) {
                 fetchAndRenderSearchResults(query, 1);
            }
        }, 500); // 500ms delay
    });
};
