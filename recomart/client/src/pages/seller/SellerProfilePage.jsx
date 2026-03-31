import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Store, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SellerSidebar from '../../components/seller/SellerSidebar';

const SellerProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    businessName: '',
    shopDescription: '',
    shopLogo: '',
    shopBanner: '',
    bankDetails: {
      accountTitle: '',
      accountNumber: '',
      bankName: '',
    },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/seller/dashboard');
        const d = data.data || data;
        const p = d.profile || d.vendor || d;

        setProfile({
          businessName: p.businessName || p.shopName || '',
          shopDescription: p.shopDescription || p.description || '',
          shopLogo: p.shopLogo || p.logo || '',
          shopBanner: p.shopBanner || p.banner || '',
          bankDetails: {
            accountTitle: p.bankDetails?.accountTitle || '',
            accountNumber: p.bankDetails?.accountNumber || '',
            bankName: p.bankDetails?.bankName || '',
          },
        });

        if (p.shopLogo || p.logo) setLogoPreview(p.shopLogo || p.logo);
        if (p.shopBanner || p.banner) setBannerPreview(p.shopBanner || p.banner);
      } catch (err) {
        toast.error('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const field = name.split('.')[1];
      setProfile((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [field]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let shopLogo = profile.shopLogo;
      let shopBanner = profile.shopBanner;

      // Upload logo if new file selected
      if (logoFile) {
        const uploadData = new FormData();
        uploadData.append('images', logoFile);
        const { data: uploadRes } = await api.post('/upload/images', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const urls = uploadRes.urls || uploadRes.images || uploadRes.data?.urls || [];
        if (urls.length > 0) shopLogo = urls[0];
      }

      // Upload banner if new file selected
      if (bannerFile) {
        const uploadData = new FormData();
        uploadData.append('images', bannerFile);
        const { data: uploadRes } = await api.post('/upload/images', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const urls = uploadRes.urls || uploadRes.images || uploadRes.data?.urls || [];
        if (urls.length > 0) shopBanner = urls[0];
      }

      await api.put('/seller/profile', {
        businessName: profile.businessName,
        shopDescription: profile.shopDescription,
        shopLogo,
        shopBanner,
        bankDetails: profile.bankDetails,
      });

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  if (loading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="ml-64 p-6 w-full">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Store size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Shop Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={profile.businessName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className={labelClass}>Shop Description</label>
                <textarea
                  name="shopDescription"
                  value={profile.shopDescription}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Describe your shop..."
                />
              </div>

              {/* Shop Logo */}
              <div>
                <label className={labelClass}>Shop Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Upload size={24} />
                    </div>
                  )}
                  <label className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Shop Banner */}
              <div>
                <label className={labelClass}>Shop Banner</label>
                <div className="space-y-3">
                  {bannerPreview ? (
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                      <img src={bannerPreview} alt="Shop Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-sm">Upload banner image</span>
                      </div>
                    </div>
                  )}
                  <label className="inline-flex px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Account Title</label>
                <input
                  type="text"
                  name="bank.accountTitle"
                  value={profile.bankDetails.accountTitle}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <label className={labelClass}>Bank Name</label>
                <input
                  type="text"
                  name="bank.bankName"
                  value={profile.bankDetails.bankName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Bank name"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Account Number</label>
                <input
                  type="text"
                  name="bank.accountNumber"
                  value={profile.bankDetails.accountNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Account number / IBAN"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SellerProfilePage;
