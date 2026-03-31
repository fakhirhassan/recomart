import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';

const InventoryTable = ({ products }) => {
  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || styles.pending
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No products found</p>
        <p className="text-sm mt-1">Start by adding your first product.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  {product.images && product.images[0] ? (
                    <img
                      src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.title}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-sm text-gray-600">
                  {product.category?.name || product.category || '-'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span
                  className={`text-sm font-medium ${
                    product.stockQuantity <= 5 ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  {product.stockQuantity}
                </span>
              </td>
              <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/seller/products/edit/${product._id || product.id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
