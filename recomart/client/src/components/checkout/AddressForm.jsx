import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Check } from 'lucide-react';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  street: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State/Province is required').max(100),
  zipCode: z.string().min(1, 'Zip code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s+\-()]+$/, 'Invalid phone number'),
});

const AddressForm = ({ addresses = [], selectedAddress, onSelect, onAddNew }) => {
  const [showNewForm, setShowNewForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    await onAddNew(data);
    reset();
    setShowNewForm(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Shipping Address
      </h3>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-2">
          {addresses.map((address) => (
            <label
              key={address._id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAddress === address._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address._id}
                checked={selectedAddress === address._id}
                onChange={() => onSelect(address._id)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{address.label}</span>
                  {selectedAddress === address._id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-gray-600 mt-0.5">{address.street}</p>
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-gray-600">{address.country}</p>
                <p className="text-gray-500 mt-1">{address.phone}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Add New Address Button */}
      {!showNewForm && (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      )}

      {/* New Address Form */}
      {showNewForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-900">New Address</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                {...register('label')}
                placeholder="e.g. Home, Office"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.label && (
                <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Street */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              {...register('street')}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.street && (
              <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder="Lahore"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State / Province
              </label>
              <input
                type="text"
                {...register('state')}
                placeholder="Punjab"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                {...register('zipCode')}
                placeholder="54000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.zipCode && (
                <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              {...register('country')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false);
                reset();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddressForm;
