import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SellerSidebar from '../../components/seller/SellerSidebar';
import ProductForm from '../../components/seller/ProductForm';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // Check if there are image files in the formData
      const imageFiles = formData.getAll('images');
      let imageUrls = [];

      if (imageFiles.length > 0 && imageFiles[0] instanceof File) {
        const uploadData = new FormData();
        imageFiles.forEach((file) => uploadData.append('images', file));

        const { data: uploadRes } = await api.post('/upload/images', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = uploadRes.urls || uploadRes.images || uploadRes.data?.urls || [];
      }

      // Build product payload
      const productPayload = {};
      for (const [key, value] of formData.entries()) {
        if (key === 'images') continue;
        if (key === 'specifications') {
          productPayload[key] = JSON.parse(value);
        } else {
          productPayload[key] = value;
        }
      }
      productPayload.images = imageUrls;

      const { data } = await api.post('/products', productPayload);
      const product = data.product || data.data || data;

      // Show AI classification result if available
      if (product.aiCategory || product.aiClassification) {
        setAiResult({
          category: product.aiCategory || product.aiClassification?.category,
          confidence: product.aiConfidence || product.aiClassification?.confidence,
          tags: product.tags || product.aiClassification?.tags || [],
        });
      }

      toast.success('Product created successfully!');
      setTimeout(() => navigate('/seller/products'), 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create product';
      toast.error(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

        {/* AI Classification Result */}
        {aiResult && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-800">AI Classification Result</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 bg-purple-200 text-purple-900 text-sm font-medium rounded-full">
                {aiResult.category}
              </span>
              {aiResult.confidence && (
                <span className="text-xs text-purple-700">
                  {Math.round(aiResult.confidence * 100)}% confidence
                </span>
              )}
              {aiResult.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-2">
                  {aiResult.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default AddProductPage;
