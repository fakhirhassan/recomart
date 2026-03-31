import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SellersTable from '../../components/admin/SellersTable';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

const ManageSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter) params.status = activeFilter;

      const { data } = await api.get('/admin/sellers', { params });
      const result = data.data || data;
      setSellers(result.sellers || result);
    } catch (err) {
      toast.error('Failed to load sellers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleApprove = async (sellerId, status) => {
    try {
      await api.put(`/admin/sellers/${sellerId}/approve`, { status });
      toast.success(`Seller ${status} successfully`);
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} seller`);
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Sellers</h1>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <SellersTable sellers={sellers} onApprove={handleApprove} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageSellersPage;
