import { useEffect, useRef, useState } from 'react';
import { fetchStockSuggestions } from '../api/stockApi';

export const useStockAutocomplete = (query, { minLength = 2, delay = 300, limit = 30 } = {}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const requestId = ++requestIdRef.current;
        const timer = setTimeout(async () => {
            if ((query || '').length < minLength) {
                if (requestId !== requestIdRef.current) return;
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            const results = await fetchStockSuggestions(query, limit);
            if (requestId !== requestIdRef.current) return;
            setSuggestions(Array.isArray(results) ? results : []);
            setShowSuggestions(Array.isArray(results) && results.length > 0);
        }, delay);

        return () => clearTimeout(timer);
    }, [query, minLength, delay, limit]);

    return {
        suggestions,
        showSuggestions,
        setShowSuggestions,
    };
};

export default useStockAutocomplete;
