import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatsCards from '../../components/admin/StatsCards';
import RevenueChart from '../../components/admin/RevenueChart';
import formatDate from '../../utils/formatDate';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        const d = data.data || data;

        setStats([
          { label: 'Total Users', value: d.totalUsers || 0, icon: Users, color: 'blue' },
          { label: 'Total Sellers', value: d.totalSellers || 0, icon: Store, color: 'green' },
          { label: 'Total Products', value: d.totalProducts || 0, icon: Package, color: 'purple' },
          { label: 'Total Orders', value: d.totalOrders || 0, icon: ShoppingBag, color: 'orange' },
          { label: 'Total Revenue', value: `Rs ${Number(d.totalRevenue || d.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'indigo' },
          { label: 'Pending Sellers', value: d.pendingSellers || 0, icon: Clock, color: 'yellow' },
          { label: 'Pending Products', value: d.pendingProducts || 0, icon: AlertCircle, color: 'red' },
        ]);

        setRevenueData(d.monthlyRevenue || d.revenueData || []);
        setRecentOrders(d.recentOrders || []);
        setRecentUsers(d.recentUsers || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
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
      <AdminSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Revenue Chart */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          <RevenueChart data={revenueData} />
        </div>

        {/* Mini Tables Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
                    {recentOrders.slice(0, 5).map((order) => {
                      const orderId = order._id || order.id || '';
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

          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">No recent users</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentUsers.slice(0, 5).map((user) => {
                      const userId = user._id || user.id;
                      const role = user.role || 'user';
                      const roleBadge = {
                        admin: 'bg-red-100 text-red-800',
                        seller: 'bg-blue-100 text-blue-800',
                        user: 'bg-gray-100 text-gray-800',
                      };
                      return (
                        <tr key={userId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[role] || roleBadge.user}`}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.createdAt ? formatDate(user.createdAt) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
