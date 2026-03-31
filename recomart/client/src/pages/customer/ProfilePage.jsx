import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  // --- Profile Form ---
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  // --- Password Form ---
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // --- Address Form ---
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors, isSubmitting: addressSubmitting },
    reset: resetAddress,
    setValue: setAddressValue,
  } = useForm({
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

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatar?.url || null);
    }
  }, [user, resetProfile]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/users/addresses');
        setAddresses(data.addresses || []);
      } catch {
        // Addresses may not exist yet
        setAddresses([]);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // --- Handlers ---
  const onProfileSubmit = async (formData) => {
    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('phone', formData.phone);
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }
      const { data } = await api.put('/users/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (formData) => {
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await api.put('/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onAddressSubmit = async (formData) => {
    try {
      if (editingAddress) {
        const { data } = await api.put(`/users/addresses/${editingAddress._id}`, formData);
        setAddresses((prev) =>
          prev.map((a) => (a._id === editingAddress._id ? data.address : a))
        );
        toast.success('Address updated');
      } else {
        const { data } = await api.post('/users/addresses', formData);
        setAddresses((prev) => [...prev, data.address]);
        toast.success('Address added');
      }
      resetAddress();
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
    Object.entries(address).forEach(([key, value]) => {
      if (['label', 'street', 'city', 'state', 'zipCode', 'country', 'phone'].includes(key)) {
        setAddressValue(key, value);
      }
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      toast.success('Address deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    resetAddress();
  };

  const newPassword = watchPassword('newPassword');

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      {/* ---- Profile Info ---- */}
      <form
        onSubmit={handleProfileSubmit(onProfileSubmit)}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-5">Profile Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700">{user?.fullName}</p>
            <p>Upload a profile picture (JPG, PNG)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                {...registerProfile('fullName', { required: 'Full name is required' })}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {profileErrors.fullName && (
              <p className="text-xs text-red-500 mt-1">{profileErrors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                {...registerProfile('email')}
                readOnly
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                {...registerProfile('phone')}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={profileSubmitting}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {profileSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* ---- Change Password ---- */}
      <form
        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...registerPassword('confirmNewPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {passwordErrors.confirmNewPassword && (
              <p className="text-xs text-red-500 mt-1">
                {passwordErrors.confirmNewPassword.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={passwordSubmitting}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <Lock className="w-4 h-4" />
          {passwordSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      {/* ---- Addresses ---- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Saved Addresses
          </h2>
          {!showAddressForm && (
            <button
              onClick={() => {
                resetAddress();
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          )}
        </div>

        {addressLoading ? (
          <Loader size="sm" />
        ) : (
          <>
            {/* Address list */}
            {addresses.length === 0 && !showAddressForm && (
              <p className="text-sm text-gray-500 text-center py-4">No saved addresses yet.</p>
            )}

            <div className="space-y-3 mb-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex items-start justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{address.label}</span>
                    <p className="text-gray-600 mt-0.5">{address.street}</p>
                    <p className="text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                    {address.phone && (
                      <p className="text-gray-500 mt-1">{address.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Address form */}
            {showAddressForm && (
              <form
                onSubmit={handleAddressSubmit(onAddressSubmit)}
                className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200"
              >
                <h4 className="text-sm font-semibold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'New Address'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      {...registerAddress('label', { required: 'Label is required' })}
                      placeholder="e.g. Home, Office"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {addressErrors.label && (
                      <p className="text-xs text-red-500 mt-1">{addressErrors.label.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      {...registerAddress('phone', { required: 'Phone is required' })}
                      placeholder="+92 300 1234567"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {addressErrors.phone && (
                      <p className="text-xs text-red-500 mt-1">{addressErrors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    {...registerAddress('street', { required: 'Street is required' })}
                    placeholder="123 Main Street"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {addressErrors.street && (
                    <p className="text-xs text-red-500 mt-1">{addressErrors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      {...registerAddress('city', { required: 'City is required' })}
                      placeholder="Lahore"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {addressErrors.city && (
                      <p className="text-xs text-red-500 mt-1">{addressErrors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      {...registerAddress('state', { required: 'State is required' })}
                      placeholder="Punjab"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {addressErrors.state && (
                      <p className="text-xs text-red-500 mt-1">{addressErrors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      {...registerAddress('zipCode', { required: 'Zip code is required' })}
                      placeholder="54000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {addressErrors.zipCode && (
                      <p className="text-xs text-red-500 mt-1">{addressErrors.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    {...registerAddress('country')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={addressSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {addressSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelAddressForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
