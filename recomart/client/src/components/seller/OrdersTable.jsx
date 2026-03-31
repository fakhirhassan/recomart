import React from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrdersTable = ({ orders, onStatusUpdate }) => {
  const handleStatusChange = (orderId, newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No orders yet</p>
        <p className="text-sm mt-1">Orders will appear here once customers start purchasing.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => {
            const orderId = order._id || order.id || '';
            const shortId = orderId.slice(-8);
            const itemsCount = order.items?.length || order.itemsCount || 0;
            const customerName =
              order.customer?.name || order.user?.name || order.customerName || 'N/A';
            const status = order.status || 'pending';
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : '-';

            return (
              <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-gray-900">#{shortId}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{customerName}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">{itemsCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">
                    ${Number(order.totalAmount || order.total || 0).toFixed(2)}
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
                  <span className="text-sm text-gray-600">{date}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleStatusChange(orderId, e.target.value);
                    }}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Update</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
