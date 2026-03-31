import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import CouponInput from '../../components/cart/CouponInput';
import Loader from '../../components/common/Loader';

const CartPage = () => {
  const { items, total, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // While items is undefined / initial load you could show a loader;
  // since zustand initialises items to [], we rely on the array being present.

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Looks like you have not added anything yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-500">
          ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}

          {/* Coupon */}
          <CouponInput />
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary items={items} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
