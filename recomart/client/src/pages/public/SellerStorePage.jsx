import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';

const SellerStorePage = () => {
  const { vendorId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/seller/store/${vendorId}`);
        setStore(data.store);
      } catch {
        setStore(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [vendorId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const { data } = await api.get(`/products?vendor=${vendorId}&page=${page}`);
        setProducts(data.products || []);
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        });
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [vendorId, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Store not found</h2>
        <p className="text-gray-500 mt-2">This seller store does not exist or is no longer available.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Store banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 h-48 md:h-64">
        {store.banner && (
          <img
            src={store.banner}
            alt={store.businessName}
            className="w-full h-full object-cover absolute inset-0"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store info */}
        <div className="relative -mt-16 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-sm bg-gray-100 flex-shrink-0">
              {store.logo ? (
                <img src={store.logo} alt={store.businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {store.businessName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{store.businessName}</h1>
              {store.description && (
                <p className="text-gray-600 mt-1 line-clamp-2">{store.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {store.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{store.rating?.toFixed(1)}</span>
                  </div>
                )}
                {store.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{store.location}</span>
                  </div>
                )}
                <span className="text-sm text-gray-500">{pagination.total} products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <section className="pb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Products</h2>
          <ProductGrid products={products} loading={productsLoading} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerStorePage;
