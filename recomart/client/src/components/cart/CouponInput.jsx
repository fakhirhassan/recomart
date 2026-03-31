import { useState } from 'react';
import { Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponInput = () => {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    toast('Coupon feature coming soon', { icon: '🎟️' });
    setCouponCode('');
  };

  return (
    <form onSubmit={handleApply} className="bg-white rounded-lg border border-gray-200 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Tag className="w-4 h-4" />
        Coupon Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Apply
        </button>
      </div>
    </form>
  );
};

export default CouponInput;
