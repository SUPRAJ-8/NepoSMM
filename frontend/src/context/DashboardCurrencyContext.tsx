"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = {
    code: string;
    symbol: string;
    rate: number; // Rate relative to NPR
};

const currencies: Record<string, Currency> = {
    NPR: { code: 'NPR', symbol: 'Rs.', rate: 1 },
    INR: { code: 'INR', symbol: '₹', rate: 0.625 }, // 1 / 1.6
    USD: { code: 'USD', symbol: '$', rate: 0.0075 }, // 1 / 133.33
    EUR: { code: 'EUR', symbol: '€', rate: 0.00689 }, // 1 / 145
    GBP: { code: 'GBP', symbol: '£', rate: 0.00588 }, // 1 / 170
};

type DashboardCurrencyContextType = {
    currency: Currency;
    setCurrency: (code: string) => void;
    formatValue: (value: number | string | undefined | null) => string;
    availableCurrencies: Currency[];
};

const DashboardCurrencyContext = createContext<DashboardCurrencyContextType | undefined>(undefined);

export function DashboardCurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currentCode, setCurrentCode] = useState('NPR');

    const currency = currencies[currentCode] || currencies.NPR;

    const formatValue = (value: number | string | undefined | null) => {
        if (value === undefined || value === null) return `${currency.symbol}0.00`;

        let numValue: number;
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d.-]/g, '');
            numValue = parseFloat(cleaned);
        } else {
            numValue = value;
        }

        if (isNaN(numValue)) return `${currency.symbol}0.00`;

        const converted = numValue * currency.rate;

        const decimals = converted < 0.1 && converted !== 0 ? 6 : 2;

        return `${currency.symbol}${converted.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    };

    const setCurrency = (code: string) => {
        if (currencies[code]) {
            setCurrentCode(code);
            localStorage.setItem('dashboard_currency', code);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('dashboard_currency');
        if (saved && currencies[saved]) {
            setCurrentCode(saved);
        }
    }, []);

    return (
        <DashboardCurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatValue,
            availableCurrencies: Object.values(currencies)
        }}>
            {children}
        </DashboardCurrencyContext.Provider>
    );
}

export function useDashboardCurrency() {
    const context = useContext(DashboardCurrencyContext);
    if (context === undefined) {
        throw new Error('useDashboardCurrency must be used within a DashboardCurrencyProvider');
    }
    return context;
}