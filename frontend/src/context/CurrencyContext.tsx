"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = {
    code: string;
    symbol: string;
    rate: number; // Rate relative to USD
};

const currencies: Record<string, Currency> = {
    NPR: { code: 'NPR', symbol: 'Rs.', rate: 1 },
    INR: { code: 'INR', symbol: '₹', rate: 0.625 }, // 1 / 1.6
    USD: { code: 'USD', symbol: '$', rate: 0.0075 }, // 1 / 133.33
    EUR: { code: 'EUR', symbol: '€', rate: 0.00689 }, // 1 / 145
    GBP: { code: 'GBP', symbol: '£', rate: 0.00588 }, // 1 / 170
    BRL: { code: 'BRL', symbol: 'R$', rate: 0.045 },
    CNY: { code: 'CNY', symbol: '¥', rate: 0.054 },
    EGP: { code: 'EGP', symbol: '£', rate: 0.36 },
    KRW: { code: 'KRW', symbol: '₩', rate: 10.15 },
    KWD: { code: 'KWD', symbol: 'KD', rate: 0.0023 },
    NGN: { code: 'NGN', symbol: '₦', rate: 11.55 },
    PHP: { code: 'PHP', symbol: '₱', rate: 0.42 },
};

type CurrencyContextType = {
    currency: Currency;
    setCurrency: (code: string) => void;
    formatValue: (value: number | string | undefined | null) => string;
    availableCurrencies: Currency[];
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currentCode, setCurrentCode] = useState('NPR');

    const currency = currencies[currentCode] || currencies.USD;

    const formatValue = (value: number | string | undefined | null) => {
        if (value === undefined || value === null) return `${currency.symbol}0.00`;

        let numValue: number;
        if (typeof value === 'string') {
            // Strip everything except numbers and decimal point
            const cleaned = value.replace(/[^\d.-]/g, '');
            numValue = parseFloat(cleaned);
        } else {
            numValue = value;
        }

        if (isNaN(numValue)) return `${currency.symbol}0.00`;

        const converted = numValue * currency.rate;

        // SMM rates are often EXTREMELY small (e.g. 0.000091)
        // If value is less than 0.1, show up to 6 decimals, otherwise 2
        const decimals = converted < 0.1 && converted !== 0 ? 6 : 2;

        return `${currency.symbol}${converted.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    };

    const setCurrency = (code: string) => {
        if (currencies[code]) {
            setCurrentCode(code);
            localStorage.setItem('admin_currency', code);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('admin_currency');
        if (saved && currencies[saved]) {
            setCurrentCode(saved);
        }
    }, []);

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency,
            formatValue,
            availableCurrencies: Object.values(currencies)
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
