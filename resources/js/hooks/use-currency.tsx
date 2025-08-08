import { useCallback } from 'react';


export function useCurrency() {
    return useCallback((num: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(num);
    }, []);
}
