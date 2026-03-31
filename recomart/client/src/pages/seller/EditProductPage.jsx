import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import SellerSidebar from '../../components/seller/SellerSidebar';
import ProductForm from '../../components/seller/ProductForm';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product || data.data || data);
      } catch (err) {
        toast.error('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Check for new image files
      const imageFiles = formData.getAll('images');
      let newImageUrls = [];

      if (imageFiles.length > 0 && imageFiles[0] instanceof File) {
        const uploadData = new FormData();
        imageFiles.forEach((file) => uploadData.append('images', file));

        const { data: uploadRes } = await api.post('/upload/images', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newImageUrls = uploadRes.urls || uploadRes.images || uploadRes.data?.urls || [];
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

      // Merge existing images that were kept with any new uploads
      const existingImages = product?.images
        ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
        : [];
      productPayload.images = [...existingImages, ...newImageUrls];

      await api.put(`/products/${id}`, productPayload);
      toast.success('Product updated successfully!');
      navigate('/seller/products');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update product';
      toast.error(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!product) {
    return (
      <div className="flex">
        <SellerSidebar />
        <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">Product not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};

export default EditProductPage;
