import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag, XCircle } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cartStore';
import formatPrice from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      try {
        const { data } = await api.get(`/payments/verify/${sessionId}`);
        setOrder(data.order);
        setStatus('success');
        // Clear the cart after successful payment
        await clearCart();
      } catch (error) {
        console.error('Payment verification failed:', error);
        setStatus('error');
      }
    };
    verifyPayment();
  }, [sessionId, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
        <p className="text-gray-500 mt-4">Verifying your payment...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
        <p className="text-gray-500 mb-6">
          We could not verify your payment. If you were charged, please contact support.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      {/* Success animation */}
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center animate-bounce-once">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-8">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {/* Order summary card */}
      {order && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 text-left">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium text-gray-900">
                #{order._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            {order.totalAmount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium text-green-600">Paid via Stripe</span>
            </div>
            {order.items && (
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium text-gray-900">{order.items.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action links */}
      <div className="flex items-center justify-center gap-3">
        {order && (
          <Link
            to={`/orders/${order._id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            View Order
          </Link>
        )}
        <Link
          to="/products"
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
