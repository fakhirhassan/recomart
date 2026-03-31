import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import RevenueChart from '../../components/admin/RevenueChart';

const PIE_COLORS = ['#FBBF24', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#6366F1'];

const AdminReportsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/admin/reports');
        const d = data.data || data;

        setRevenueData(d.monthlyRevenue || d.revenueByMonth || []);
        setUserGrowth(d.userGrowth || d.monthlyUsers || []);
        setOrdersByStatus(d.ordersByStatus || []);
        setTopCategories(d.topCategories || d.categoryRevenue || []);
      } catch (err) {
        toast.error('Failed to load reports');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Month */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h2>
            <RevenueChart data={revenueData} />
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            {userGrowth.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No user growth data available</p>
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px' }} iconType="circle" />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="New Users"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
            {ordersByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No order status data available</p>
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }) =>
                        `${status ? status.charAt(0).toUpperCase() + status.slice(1) : ''}: ${count}`
                      }
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value, name) => [value, name ? name.charAt(0).toUpperCase() + name.slice(1) : '']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '13px' }}
                      iconType="circle"
                      formatter={(value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Categories by Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories by Revenue</h2>
            {topCategories.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No category revenue data available</p>
              </div>
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                      tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#8B5CF6"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;
