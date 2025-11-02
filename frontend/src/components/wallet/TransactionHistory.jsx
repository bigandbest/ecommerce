'use client';
import { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaArrowUp, FaArrowDown, FaClock, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { getTransactionHistory } from '@/api/walletApi';
import { toast } from 'react-toastify';

const TransactionHistory = ({ walletId }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const transactionTypes = {
        1: { name: 'Recharge', color: 'green', icon: FaArrowUp },
        2: { name: 'Order Payment', color: 'red', icon: FaArrowDown },
        3: { name: 'Refund', color: 'green', icon: FaArrowUp },
        4: { name: 'Admin Credit', color: 'blue', icon: FaArrowUp },
        5: { name: 'Admin Debit', color: 'red', icon: FaArrowDown },
    };

    const statusConfig = {
        completed: { color: 'green', icon: FaCheck },
        pending: { color: 'yellow', icon: FaClock },
        failed: { color: 'red', icon: FaTimes },
        cancelled: { color: 'gray', icon: FaExclamationTriangle },
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, filters]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await getTransactionHistory(page, 20);
            if (response.success) {
                if (page === 1) {
                    setTransactions(response.transactions || []);
                } else {
                    setTransactions(prev => [...prev, ...(response.transactions || [])]);
                }
                setHasMore(response.transactions?.length === 20);
            } else {
                toast.error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ type: '', status: '', search: '' });
        setPage(1);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount, isCredit) => {
        const sign = isCredit ? '+' : '-';
        return `${sign}₹${parseFloat(amount).toFixed(2)}`;
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filters.type && transaction.transaction_type_id !== parseInt(filters.type)) return false;
        if (filters.status && transaction.status !== filters.status) return false;
        if (filters.search && !transaction.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                        {filteredTransactions.length} transactions
                    </span>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                    <FaFilter className="text-sm" />
                    <span className="font-medium">Filters</span>
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                {Object.entries(transactionTypes).map(([id, type]) => (
                                    <option key={id} value={id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                {Object.entries(statusConfig).map(([status, config]) => (
                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search transactions..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaClock className="w-10 h-10 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">No Transactions Found</h4>
                        <p className="text-gray-600">
                            {filters.type || filters.status || filters.search
                                ? 'No transactions match your filters'
                                : 'Your transaction history will appear here'
                            }
                        </p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => {
                        const typeConfig = transactionTypes[transaction.transaction_type_id] || { name: 'Unknown', color: 'gray', icon: FaClock };
                        const statusInfo = statusConfig[transaction.status] || { color: 'gray', icon: FaClock };
                        const isCredit = transaction.amount > 0;
                        const IconComponent = typeConfig.icon;
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-${typeConfig.color}-100`}>
                                        <IconComponent className={`text-${typeConfig.color}-600`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{typeConfig.name}</h4>
                                        <p className="text-sm text-gray-600">{transaction.description}</p>
                                        <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-lg ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatAmount(transaction.amount, isCredit)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <StatusIcon className={`text-${statusInfo.color}-500`} />
                                        <span className={`text-${statusInfo.color}-600 capitalize`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Load More */}
            {hasMore && filteredTransactions.length > 0 && (
                <div className="text-center mt-6">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
