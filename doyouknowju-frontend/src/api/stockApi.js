import axios from 'axios';

const findArrayDeep = (value, depth = 0) => {
    if (depth > 4 || value === null || value === undefined) return null;
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return findArrayDeep(parsed, depth + 1);
        } catch {
            return null;
        }
    }

    if (typeof value !== 'object') return null;

    for (const nested of Object.values(value)) {
        const found = findArrayDeep(nested, depth + 1);
        if (Array.isArray(found)) return found;
    }

    return null;
};

const toArrayPayload = (raw) => {
    let data = raw;

    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return [];
        }
    }

    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];

    const candidates = [
        data.output,
        data.output1,
        data.output2,
        data.list,
        data.data,
        data.items,
        data.result,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
        if (typeof candidate === 'string') {
            try {
                const parsed = JSON.parse(candidate);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // noop
            }
        }
    }

    const deepArray = findArrayDeep(data);
    return Array.isArray(deepArray) ? deepArray : [];
};

const toIndexChartRows = (raw) => {
    let data = raw;

    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return [];
        }
    }

    if (!data) return [];

    if (Array.isArray(data?.output)) return data.output;
    if (Array.isArray(data?.output2)) return data.output2;
    if (Array.isArray(data)) return data;

    if (typeof data?.output === 'string') {
        try {
            const parsed = JSON.parse(data.output);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // noop
        }
    }

    if (typeof data?.output2 === 'string') {
        try {
            const parsed = JSON.parse(data.output2);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // noop
        }
    }

    return [];
};

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

export const fetchKospiIndexChart = async (params = {}) => {
    try {
        const response = await axios.get('/dykj/api/stocks/index/kospi/chart', {
            params,
        });
        return toIndexChartRows(response.data);
    } catch (error) {
        console.error('Error fetching KOSPI index chart:', error);
        return [];
    }
};

export const fetchKosdaqIndexChart = async (params = {}) => {
    try {
        const response = await axios.get('/dykj/api/stocks/index/kosdaq/chart', {
            params,
        });
        return toIndexChartRows(response.data);
    } catch (error) {
        console.error('Error fetching KOSDAQ index chart:', error);
        return [];
    }
};
