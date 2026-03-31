import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ChevronRight,
  ChevronLeft,
  ImageOff,
  ShoppingBag,
} from 'lucide-react';
import api from '../../api/axios';
import formatPrice from '../../utils/formatPrice';
import formatDate from '../../utils/formatDate';
import { ORDER_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LIMIT = 10;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, limit: LIMIT };
        if (activeTab !== 'all') {
          params.status = activeTab;
        }
        const { data } = await api.get('/orders/my-orders', { params });
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-500 mb-6">
            {activeTab !== 'all'
              ? `You have no ${activeTab} orders.`
              : 'You have not placed any orders yet.'}
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
            const firstItem = order.items?.[0];
            const primaryImage = firstItem?.product?.images?.[0]?.url || null;
            const itemCount = order.items?.length || 0;

            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 hidden sm:block">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)} &middot; {itemCount} item
                      {itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
