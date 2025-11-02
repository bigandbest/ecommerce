'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getWalletDetails } from '@/api/walletApi';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWalletDetails = async () => {
        if (!currentUser) {
            setWallet(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getWalletDetails();
            if (response.success) {
                setWallet(response.wallet);
            } else {
                setError(response.error || 'Failed to fetch wallet details');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch wallet details');
        } finally {
            setLoading(false);
        }
    };

    const refreshWallet = () => {
        fetchWalletDetails();
    };

    const updateWalletBalance = (newBalance) => {
        if (wallet) {
            setWallet(prev => ({
                ...prev,
                balance: newBalance
            }));
        }
    };

    const isWalletAvailable = wallet && !wallet.is_frozen;
    const hasSufficientBalance = (amount) => wallet && wallet.balance >= amount;

    useEffect(() => {
        if (currentUser) {
            fetchWalletDetails();
        } else {
            setWallet(null);
        }
    }, [currentUser]);

    const value = {
        wallet,
        loading,
        error,
        refreshWallet,
        updateWalletBalance,
        isWalletAvailable,
        hasSufficientBalance,
        fetchWalletDetails
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
