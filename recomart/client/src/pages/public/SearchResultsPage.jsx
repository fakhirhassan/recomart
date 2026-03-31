import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}&page=${page}`);
        setProducts(data.products || []);
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          total: data.total || 0
        });
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Search results for: <span className="text-blue-600">"{query}"</span>
        </h1>
        {products.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">{pagination.total} results found</p>
        )}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} loading={false} />
      ) : (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn't find any products matching "{query}". Try adjusting your search or browse our categories.
          </p>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Suggestions:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>Check the spelling of your search term</li>
              <li>Try using more general keywords</li>
              <li>Browse categories to find what you need</li>
            </ul>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {[...Array(pagination.totalPages)].map((_, i) => (
            <Link
              key={i + 1}
              to={`/search?q=${encodeURIComponent(query)}&page=${i + 1}`}
              className={`px-3 py-2 text-sm rounded-lg ${
                pagination.page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
