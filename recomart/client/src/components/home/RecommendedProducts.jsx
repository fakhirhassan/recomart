import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import ProductCard from '../product/ProductCard';

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        let data;
        if (isAuthenticated) {
          const response = await api.get('/recommendations/for-you');
          data = response.data;
        } else {
          const response = await api.get('/products', {
            params: { sort: 'rating', limit: 8 }
          });
          data = response.data;
        }
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch recommended products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, [isAuthenticated]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-7 h-7 text-violet-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Recommended For You
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedProducts;
