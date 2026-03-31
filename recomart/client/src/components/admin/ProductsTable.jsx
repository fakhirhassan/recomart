import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const ProductsTable = ({ products, onApprove }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No products found</p>
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
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Seller</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => {
            const productId = product._id || product.id;
            const status = product.status || 'pending';
            const isPending = status === 'pending';

            return (
              <tr key={productId} className="hover:bg-gray-50 transition-colors">
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
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                    {product.title}
                  </p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {product.seller?.businessName || product.seller?.name || product.sellerName || '-'}
                  </span>
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
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove && onApprove(productId, 'approved')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        status === 'approved'
                          ? 'text-green-300 cursor-default'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      disabled={status === 'approved'}
                      title="Approve"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => onApprove && onApprove(productId, 'rejected')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        status === 'rejected'
                          ? 'text-red-300 cursor-default'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      disabled={status === 'rejected'}
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
