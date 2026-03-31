import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ImageOff } from 'lucide-react';
import formatPrice from '../../utils/formatPrice';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import useAuthStore from '../../store/authStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const wishlisted = isInWishlist(product._id);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= roundedRating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative">
        <Link to={`/products/${product.slug}`}>
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <ImageOff className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </Link>

        {isAuthenticated && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${
                wishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              }`}
            />
          </button>
        )}

        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {Math.round(
              ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
            )}
            % OFF
          </span>
        )}
      </div>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">
            {product.category.name || product.category}
          </p>
        )}

        <div className="flex items-center gap-1 mb-2">
          {renderStars(product.averageRating)}
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
