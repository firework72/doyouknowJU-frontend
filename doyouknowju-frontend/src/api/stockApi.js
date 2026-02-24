import axios from 'axios';

const toIndexChartResult = (raw) => {
    let data = raw;

    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return { ok: false, rows: [] };
        }
    }

    if (!data) return { ok: false, rows: [] };

    if (typeof data === 'object' && data !== null && String(data.rt_cd ?? '0').trim() !== '0') {
        return { ok: false, rows: [] };
    }

    if (Array.isArray(data?.output)) return { ok: true, rows: data.output };
    if (Array.isArray(data?.output2)) return { ok: true, rows: data.output2 };
    if (Array.isArray(data)) return { ok: true, rows: data };

    if (typeof data?.output === 'string') {
        try {
            const parsed = JSON.parse(data.output);
            if (Array.isArray(parsed)) return { ok: true, rows: parsed };
        } catch {
            // noop
        }
    }

    if (typeof data?.output2 === 'string') {
        try {
            const parsed = JSON.parse(data.output2);
            if (Array.isArray(parsed)) return { ok: true, rows: parsed };
        } catch {
            // noop
        }
    }

    return { ok: true, rows: [] };
};

/**
 * Fetch stock suggestions based on search query.
 * @param {string} query - The search term.
 * @returns {Promise<Array>} - List of matching stocks.
 */
// Suggestion API (Autocomplete)
export const fetchStockSuggestions = async (query, limit) => {
    try {
        const params = { q: query };
        if (Number.isFinite(Number(limit)) && Number(limit) > 0) {
            params.limit = Number(limit);
        }
        const response = await axios.get('/dykj/api/stocks/suggest', {
            params,
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

export const fetchStockSearch = async ({ q, page = 1, size = 30 } = {}) => {
    try {
        const response = await axios.get('/dykj/api/stocks/search', {
            params: { q, page, size },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching stock search:', error);
        return [];
    }
};

export const fetchStockPrices = async (stockIds = []) => {
    try {
        if (!Array.isArray(stockIds) || stockIds.length === 0) return {};
        const response = await axios.post('/dykj/api/stocks/prices', { stockIds });
        return response.data && typeof response.data === 'object' ? response.data : {};
    } catch (error) {
        console.error('Error fetching stock prices:', error);
        return {};
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
        return toIndexChartResult(response.data);
    } catch (error) {
        console.error('Error fetching KOSPI index chart:', error);
        return { ok: false, rows: [] };
    }
};

export const fetchKosdaqIndexChart = async (params = {}) => {
    try {
        const response = await axios.get('/dykj/api/stocks/index/kosdaq/chart', {
            params,
        });
        return toIndexChartResult(response.data);
    } catch (error) {
        console.error('Error fetching KOSDAQ index chart:', error);
        return { ok: false, rows: [] };
    }
};
