import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, Loader2, Sparkles, X } from 'lucide-react';
import axios from 'axios';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  specifications: z.array(
    z.object({
      key: z.string().min(1, 'Key is required'),
      value: z.string().min(1, 'Value is required'),
    })
  ),
});

const ProductForm = ({ initialData, onSubmit, isLoading }) => {
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          title: initialData.title || '',
          description: initialData.description || '',
          price: initialData.price || '',
          compareAtPrice: initialData.compareAtPrice || '',
          category: initialData.category || '',
          brand: initialData.brand || '',
          stockQuantity: initialData.stockQuantity || 0,
          specifications: initialData.specifications || [],
        }
      : {
          title: '',
          description: '',
          price: '',
          compareAtPrice: '',
          category: '',
          brand: '',
          stockQuantity: 0,
          specifications: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/categories');
        setCategories(data.categories || data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData?.images) {
      setImagePreviews(initialData.images.map((img) => (typeof img === 'string' ? img : img.url)));
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'specifications') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== '' && value !== undefined) {
        formData.append(key, value);
      }
    });
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    onSubmit(formData);
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* AI Classification Badge */}
      {initialData?.aiCategory && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <Sparkles size={18} className="text-purple-600" />
          <span className="text-sm font-medium text-purple-800">
            AI Classification: {initialData.aiCategory}
          </span>
          {initialData.aiConfidence && (
            <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
              {Math.round(initialData.aiConfidence * 100)}% confidence
            </span>
          )}
        </div>
      )}

      {/* Auto-generated Tags */}
      {initialData?.tags && initialData.tags.length > 0 && (
        <div>
          <label className={labelClass}>Auto-Generated Tags</label>
          <div className="flex flex-wrap gap-2">
            {initialData.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input type="text" {...register('title')} className={inputClass} placeholder="Product title" />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className={inputClass}
          placeholder="Product description"
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* Price & Compare At Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price')}
            className={inputClass}
            placeholder="0.00"
          />
          {errors.price && <p className={errorClass}>{errors.price.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Compare At Price (optional)</label>
          <input
            type="number"
            step="0.01"
            {...register('compareAtPrice')}
            className={inputClass}
            placeholder="0.00"
          />
          {errors.compareAtPrice && <p className={errorClass}>{errors.compareAtPrice.message}</p>}
        </div>
      </div>

      {/* Category & Brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select {...register('category')} className={inputClass}>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Brand</label>
          <input type="text" {...register('brand')} className={inputClass} placeholder="Brand name" />
          {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
        </div>
      </div>

      {/* Stock Quantity */}
      <div>
        <label className={labelClass}>Stock Quantity</label>
        <input
          type="number"
          {...register('stockQuantity')}
          className={inputClass}
          placeholder="0"
        />
        {errors.stockQuantity && <p className={errorClass}>{errors.stockQuantity.message}</p>}
      </div>

      {/* Specifications */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Specifications</label>
          <button
            type="button"
            onClick={() => append({ key: '', value: '' })}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Row
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                {...register(`specifications.${index}.key`)}
                className={inputClass}
                placeholder="Key (e.g. Weight)"
              />
              <input
                {...register(`specifications.${index}.value`)}
                className={inputClass}
                placeholder="Value (e.g. 1.5kg)"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-gray-400 italic">No specifications added yet.</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>Images (max 5)</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {imagePreviews.map((src, index) => (
            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {imagePreviews.length < 5 && (
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>{initialData ? 'Update Product' : 'Create Product'}</>
        )}
      </button>
    </form>
  );
};

export default ProductForm;
