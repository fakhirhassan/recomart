import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Clock,
  Package,
  ChevronRight,
  ImageOff,
} from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import formatPrice from '../../utils/formatPrice';
import formatDate from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import RecommendedProducts from '../../components/home/RecommendedProducts';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link
    to={to}
    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { products: wishlistProducts, fetchWishlist } = useWishlistStore();
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes] = await Promise.all([
          api.get('/orders/my-orders', { params: { limit: 5 } }),
          fetchWishlist(),
        ]);
        const ordersData = ordersRes.data;
        setOrders(ordersData.orders || []);
        setTotalOrders(ordersData.totalOrders || ordersData.orders?.length || 0);
        setPendingOrders(
          (ordersData.orders || []).filter((o) => o.status === 'pending').length
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchWishlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-500 ml-10">
          Welcome back, <span className="font-medium text-gray-700">{user?.fullName || 'Customer'}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={totalOrders}
          color="bg-blue-50 text-blue-600"
          to="/orders"
        />
        <StatCard
          icon={Heart}
          label="Wishlist Items"
          value={wishlistProducts.length}
          color="bg-pink-50 text-pink-600"
          to="/wishlist"
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={pendingOrders}
          color="bg-yellow-50 text-yellow-600"
          to="/orders"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Start shopping to see your orders here.</p>
            <Link
              to="/products"
              className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              const firstItem = order.items?.[0];
              const primaryImage =
                firstItem?.product?.images?.[0]?.url || null;

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(order.createdAt)} &middot; {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>

                  <span className="text-sm font-bold text-gray-900 hidden sm:block">
                    {formatPrice(order.totalAmount)}
                  </span>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Products */}
      <RecommendedProducts />
    </div>
  );
};

export default DashboardPage;
