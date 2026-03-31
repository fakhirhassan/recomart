import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ImageOff } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import formatPrice from '../../utils/formatPrice';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();
  const { product, quantity } = item;

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0].url : null;

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(product._id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromCart(product._id);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">{formatPrice(product.price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdateQuantity(quantity - 1)}
          disabled={quantity <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium text-gray-900">
          {quantity}
        </span>
        <button
          onClick={() => handleUpdateQuantity(quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-sm font-bold text-gray-900 w-24 text-right">
        {formatPrice(product.price * quantity)}
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
