import React, { useState, useEffect } from 'react';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://totomotorworx-shop-production.up.railway.app/categories');
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to load categories', 'error');
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showAlert('Category name cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch('https://totomotorworx-shop-production.up.railway.app/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('Category added successfully!', 'success');
        setNewCategory('');
        fetchCategories();
      } else {
        showAlert(data.error || 'Failed to add category', 'error');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('Failed to add category', 'error');
    }
  };

  const handleEditCategory = async (id) => {
    if (!editingName.trim()) {
      showAlert('Category name cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch(`https://totomotorworx-shop-production.up.railway.app/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('Category updated successfully!', 'success');
        setEditingId(null);
        setEditingName('');
        fetchCategories();
      } else {
        showAlert(data.error || 'Failed to update category', 'error');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      showAlert('Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`https://totomotorworx-shop-production.up.railway.app/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('Category deleted successfully!', 'success');
        fetchCategories();
      } else {
        showAlert(data.error || 'Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Failed to delete category', 'error');
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return (
      <div className="category-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="category-header">
        <h2>📂 Category Management</h2>
        <p className="category-subtitle">Manage product categories for your store</p>
      </div>

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          <span className="alert-icon">{alert.type === 'success' ? '✓' : '⚠'}</span>
          {alert.message}
          <button className="alert-close" onClick={() => setAlert({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}

      <div className="add-category-section">
        <h3>Add New Category</h3>
        <div className="add-category-form">
          <input
            type="text"
            className="category-input"
            placeholder="Enter category name (e.g., Brake Pads)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            maxLength={100}
          />
          <button onClick={handleAddCategory} className="btn-add">
            <span className="btn-icon">+</span>
            Add Category
          </button>
        </div>
      </div>

      <div className="categories-section">
        <h3>Existing Categories ({categories.length})</h3>
        
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories found. Add your first category above!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                {editingId === category.id ? (
                  <div className="category-edit-mode">
                    <input
                      type="text"
                      className="category-input-edit"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      maxLength={100}
                      autoFocus
                    />
                    <div className="category-actions">
                      <button 
                        className="btn-save"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        ✓ Save
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={cancelEditing}
                      >
                        × Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="category-info">
                      <span className="category-icon">🏷️</span>
                      <h4>{category.name}</h4>
                      <p className="category-meta">
                        Created: {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => startEditing(category)}
                      >
                        ✎ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;