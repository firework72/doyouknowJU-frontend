import axios from 'axios';

/**
 * Fetch stock suggestions based on search query.
 * @param {string} query - The search term.
 * @returns {Promise<Array>} - List of matching stocks.
 */
// Suggestion API (Autocomplete)
export const fetchStockSuggestions = async (query) => {
    try {
        const response = await axios.get('/dykj/api/stocks/suggest', {
            params: { q: query },
        });

        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('API did not return an array:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching stock suggestions:', error);
        return [];
    }
};

// Search Result API (Full list)
export const searchStocks = async (query) => {
    try {
        const response = await axios.get('/dykj/api/stocks/search', {
            params: { q: query },
        });

        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('Search API did not return an array:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error searching stocks:', error);
        throw error;
    }
};
