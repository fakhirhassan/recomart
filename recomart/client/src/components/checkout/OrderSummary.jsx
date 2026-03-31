import { ImageOff, ShieldCheck } from 'lucide-react';
import formatPrice from '../../utils/formatPrice';

const OrderSummary = ({ items, subtotal, shippingFee, total, paymentMethod, onPlaceOrder }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>

      {/* Item List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => {
          const { product, quantity } = item;
          const primaryImage =
            product.images && product.images.length > 0
              ? product.images[0].url
              : null;

          return (
            <div
              key={product._id}
              className="flex items-center gap-3 text-sm"
            >
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-gray-500">Qty: {quantity}</p>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
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
        <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Payment Method Indicator */}
      <div className="text-xs text-gray-500">
        Paying via:{' '}
        <span className="font-medium text-gray-700">
          {paymentMethod === 'stripe' ? 'Card (Stripe)' : 'Cash on Delivery'}
        </span>
      </div>

      {/* Place Order */}
      <button
        onClick={onPlaceOrder}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <ShieldCheck className="w-4 h-4" />
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
