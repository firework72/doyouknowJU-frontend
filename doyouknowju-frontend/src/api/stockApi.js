import axios from 'axios';

/**
 * Fetch stock suggestions based on search query.
 * @param {string} query - The search term.
 * @returns {Promise<Array>} - List of matching stocks.
 */
// Suggestion API (Autocomplete)
export const fetchStockSuggestions = async (query) => {
    try {
        const response = await axios.get('http://localhost:8080/dykj/api/stocks/suggest', {
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
        const response = await axios.get('http://localhost:8080/dykj/api/stocks/search', {
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

// Stock Price API
export const fetchStockPrice = async (stockId) => {
    try {
        const response = await axios.get(`http://localhost:8080/dykj/api/stocks/${stockId}/price`);
        // KIS API response typically wraps real data in 'output'
        return response.data.output || response.data;
    } catch (error) {
        console.error(`Error fetching price for ${stockId}:`, error);
        return null; // Return null on error to handle gracefully
    }
};
