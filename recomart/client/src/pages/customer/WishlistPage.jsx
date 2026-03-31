import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useWishlistStore from '../../store/wishlistStore';
import useCartStore from '../../store/cartStore';
import ProductCard from '../../components/product/ProductCard';
import Loader from '../../components/common/Loader';

const WishlistPage = () => {
  const { products, fetchWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
        <p className="text-gray-500 mb-6">Save items you love to your wishlist.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-pink-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-500">({products.length} items)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <div key={product._id} className="relative">
            <ProductCard product={product} />
            <button
              onClick={() => handleMoveToCart(product._id)}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
