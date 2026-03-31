import { CreditCard, Banknote } from 'lucide-react';

const paymentOptions = [
  {
    value: 'stripe',
    label: 'Pay with Card (Stripe)',
    icon: CreditCard,
    description: 'Secure payment via Stripe',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    icon: Banknote,
    description: 'Pay when you receive your order',
  },
];

const PaymentForm = ({ paymentMethod, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment Method
      </h3>

      <div className="space-y-2">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => onChange(option.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <Icon className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-sm font-semibold text-gray-900">
                  {option.label}
                </span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentForm;
