import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SellerSidebar from '../../components/seller/SellerSidebar';
import StatsCards from '../../components/admin/StatsCards';
import SalesChart from '../../components/seller/SalesChart';
import formatDate from '../../utils/formatDate';

const SellerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/seller/dashboard');
        const d = data.data || data;

        setStats([
          { label: 'Total Products', value: d.totalProducts || 0, icon: Package, color: 'blue' },
          { label: 'Total Orders', value: d.totalOrders || 0, icon: ShoppingBag, color: 'green' },
          { label: 'Revenue', value: `Rs ${Number(d.revenue || d.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'purple' },
          { label: 'Pending Orders', value: d.pendingOrders || 0, icon: Clock, color: 'orange' },
        ]);

        setSalesData(d.monthlySales || d.salesData || []);
        setRecentOrders(d.recentOrders || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="ml-64 p-6 w-full">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Sales Chart */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          <SalesChart data={salesData} />
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">No recent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const orderId = order._id || order.id || '';
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      confirmed: 'bg-blue-100 text-blue-800',
                      shipped: 'bg-purple-100 text-purple-800',
                      delivered: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800',
                    };
                    const status = order.status || 'pending';

                    return (
                      <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">#{orderId.slice(-8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.customer?.name || order.user?.name || order.customerName || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          Rs {Number(order.totalAmount || order.total || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.createdAt ? formatDate(order.createdAt) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboardPage;
