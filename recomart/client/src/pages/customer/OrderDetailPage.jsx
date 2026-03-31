import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ImageOff,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import formatPrice from '../../utils/formatPrice';
import formatDate, { formatDateTime } from '../../utils/formatDate';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import Loader from '../../components/common/Loader';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  shipped: Truck,
  delivered: Package,
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const paymentStatus = PAYMENT_STATUSES[order.paymentStatus] || PAYMENT_STATUSES.pending;
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shippingFee = (order.totalAmount || 0) - subtotal;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {order.status === 'pending' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Status Tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6">Order Progress</h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => {
              const Icon = STATUS_ICONS[step];
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {/* Connector line */}
                  {index > 0 && (
                    <div
                      className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                        index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium capitalize ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled notice */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Items ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => {
                const primaryImage = item.product?.images?.[0]?.url || null;
                return (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingFee <= 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shipping & Payment */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                {order.shippingAddress.label && (
                  <p className="font-medium text-gray-900">{order.shippingAddress.label}</p>
                )}
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-500 mt-1">{order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4" />
              Payment
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'stripe' ? 'Card (Stripe)' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${paymentStatus.color}`}>
                  {paymentStatus.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
