import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const statusColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
};

const SellersTable = ({ sellers, onApprove }) => {
  if (!sellers || sellers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No sellers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Name</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Owner</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Total Sales</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Revenue</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sellers.map((seller) => {
            const sellerId = seller._id || seller.id;
            const status = seller.status || 'pending';
            const isPending = status === 'pending';

            return (
              <tr key={sellerId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">
                    {seller.businessName || seller.shopName || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">
                    {seller.owner?.name || seller.user?.name || seller.ownerName || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[status] || statusColors.pending
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-600">
                    {seller.totalSales != null ? seller.totalSales.toLocaleString() : '0'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm font-medium text-gray-900">
                    ${Number(seller.revenue || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove && onApprove(sellerId, 'approved')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => onApprove && onApprove(sellerId, 'rejected')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SellersTable;
