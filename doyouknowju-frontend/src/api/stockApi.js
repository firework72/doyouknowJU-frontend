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

// Top 10 Volume (Existing)
export const fetchTop10Volume = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10');
        return response.data;
    } catch (error) {
        console.error('Error fetching Top 10 Volume:', error);
        return [];
    }
};

// Top 10 Trade Amount (New)
export const fetchTop10TradeAmount = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10/trade-amount');
        return response.data;
    } catch (error) {
        console.error('Error fetching Top 10 Trade Amount:', error);
        return [];
    }
};

// Top 10 Trade Value from Naver (Backend-crawled + cached)
export const fetchTop10TradeValueNaver = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10/trade-value/naver');
        return response.data;
    } catch (error) {
        console.error('Error fetching Top 10 Trade Value (Naver):', error);
        return [];
    }
};

// Top 10 Rise Rate (KIS)
export const fetchTop10RiseRate = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10/rise-rate');
        return response.data;
    } catch (error) {
        console.error('Error fetching Top 10 Rise Rate:', error);
        return [];
    }
};

// Top 10 Fall Rate (KIS)
export const fetchTop10FallRate = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10/fall-rate');
        return response.data;
    } catch (error) {
        console.error('Error fetching Top 10 Fall Rate:', error);
        return [];
    }
};

// Top 10 Market Cap
export const fetchTop10MarketCap = async () => {
    try {
        const response = await axios.get('/dykj/api/stocks/top10/market-cap');
        const data = response.data;
        return Array.isArray(data) ? data : data?.list || data?.data || [];
    } catch (error) {
        console.error('Error fetching Top 10 Market Cap:', error);
        return [];
    }
};
