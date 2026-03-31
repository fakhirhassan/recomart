import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import formatPrice from '../../utils/formatPrice';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 200;

const CartSummary = ({ items, total }) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total;
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = subtotal + shippingFee;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>
            {shippingFee === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              formatPrice(shippingFee)
            )}
          </span>
        </div>

        {shippingFee > 0 && (
          <p className="text-xs text-gray-400">
            Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(orderTotal)}</span>
        </div>
      </div>

      <Link
        to="/checkout"
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Proceed to Checkout
      </Link>
    </div>
  );
};

export default CartSummary;
