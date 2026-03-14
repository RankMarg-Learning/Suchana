import React, { createContext, useContext, useCallback } from 'react';

interface AdsContextType {
    showInterstitial: (force?: boolean) => Promise<boolean>;
    isAdLoaded: boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const showInterstitial = useCallback(async (force = false) => {
        return false;
    }, []);

    return (
        <AdsContext.Provider value={{ showInterstitial, isAdLoaded: false }}>
            {children}
        </AdsContext.Provider>
    );
}

export const useAds = () => {
    const context = useContext(AdsContext);
    if (context === undefined) {
        throw new Error('useAds must be used within an AdsProvider');
    }
    return context;
};
