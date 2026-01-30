'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface DolarRate {
    buy: number;
    sell: number;
}

interface DolarData {
    blue: DolarRate;
    official: DolarRate;
    timestamp: string;
}

export function DollarTicker() {
    const [data, setData] = useState<DolarData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dolar');
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setData(json);
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (error) return null;

    return (
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground border-l pl-4 ml-4">
            {loading ? (
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Cargando cotizaciones...</span>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">Dólar Blue</span>
                        <div className="flex gap-2">
                            <span>C: ${data?.blue.buy}</span>
                            <span>V: ${data?.blue.sell}</span>
                        </div>
                    </div>
                    <div className="w-px h-3 bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400 font-bold">Dólar Oficial</span>
                        <div className="flex gap-2">
                            <span>C: ${data?.official.buy}</span>
                            <span>V: ${data?.official.sell}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
