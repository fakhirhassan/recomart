import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Plus, ChevronRight, FolderOpen } from 'lucide-react';

const CategoryManager = ({ categories, onAdd, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', description: '', parent: '' },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm();

  const onAddSubmit = (data) => {
    onAdd && onAdd(data);
    reset();
  };

  const startEdit = (category) => {
    setEditingId(category._id || category.id);
    setEditValue('name', category.name);
    setEditValue('description', category.description || '');
    setEditValue('parent', category.parent || '');
  };

  const onEditSubmit = (data) => {
    onEdit && onEdit(editingId, data);
    setEditingId(null);
    resetEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetEdit();
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm';

  // Build tree structure
  const buildTree = (items) => {
    const map = {};
    const roots = [];
    items.forEach((item) => {
      const id = item._id || item.id;
      map[id] = { ...item, children: [] };
    });
    items.forEach((item) => {
      const id = item._id || item.id;
      const parentId = item.parent?._id || item.parent;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[id]);
      } else {
        roots.push(map[id]);
      }
    });
    return roots;
  };

  const tree = categories ? buildTree(categories) : [];

  const renderCategory = (category, depth = 0) => {
    const catId = category._id || category.id;
    const isEditing = editingId === catId;

    return (
      <div key={catId}>
        <div
          className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          {category.children && category.children.length > 0 ? (
            <ChevronRight size={16} className="text-gray-400" />
          ) : (
            <div className="w-4" />
          )}
          <FolderOpen size={16} className="text-gray-400" />

          {isEditing ? (
            <form
              onSubmit={handleEditSubmit(onEditSubmit)}
              className="flex-1 flex items-center gap-2"
            >
              <input
                {...registerEdit('name', { required: 'Name is required' })}
                className={inputClass}
                placeholder="Category name"
              />
              <input
                {...registerEdit('description')}
                className={inputClass}
                placeholder="Description"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                {category.description && (
                  <span className="text-xs text-gray-500 ml-2">{category.description}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(category)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(catId)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
        {category.children &&
          category.children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={16} />
          Add Category
        </h3>
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                {...register('name', { required: 'Name is required' })}
                className={inputClass}
                placeholder="Category name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <input
                {...register('description')}
                className={inputClass}
                placeholder="Description (optional)"
              />
            </div>
            <div>
              <select {...register('parent')} className={inputClass}>
                <option value="">No parent (top-level)</option>
                {categories &&
                  categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        </form>
      </div>

      {/* Categories Tree */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {tree.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No categories yet</p>
            <p className="text-sm mt-1">Add your first category above.</p>
          </div>
        ) : (
          tree.map((category) => renderCategory(category))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
