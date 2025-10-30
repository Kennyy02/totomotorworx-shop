import React, { useState, useEffect } from 'react';
import './CategoryManagement.css'
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
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{cssStyles}</style>
      
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>📂 Category Management</h2>
        <p style={styles.subtitle}>Manage product categories for your store</p>
      </div>

      {alert.show && (
        <div style={{...styles.alert, ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError)}}>
          <span style={{fontSize: '20px'}}>{alert.type === 'success' ? '✓' : '⚠'}</span>
          {alert.message}
          <button style={styles.alertClose} onClick={() => setAlert({ show: false, message: '', type: '' })}>×</button>
        </div>
      )}

      <div style={styles.addSection}>
        <h3 style={styles.sectionTitle}>Add New Category</h3>
        <div style={styles.addForm}>
          <input
            type="text"
            style={styles.input}
            className="category-input-focus"
            placeholder="Enter category name (e.g., Brake Pads)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            maxLength={100}
          />
          <button onClick={handleAddCategory} style={styles.btnAdd} className="btn-hover">
            <span style={{fontSize: '18px'}}>+</span>
            Add Category
          </button>
        </div>
      </div>

      <div>
        <h3 style={styles.sectionTitle}>Existing Categories ({categories.length})</h3>
        
        {categories.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No categories found. Add your first category above!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {categories.map((category) => (
              <div key={category.id} style={styles.card} className="category-card-hover">
                {editingId === category.id ? (
                  <div style={styles.editMode}>
                    <input
                      type="text"
                      style={styles.inputEdit}
                      className="category-input-focus"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      maxLength={100}
                      autoFocus
                    />
                    <div style={styles.actions}>
                      <button 
                        style={styles.btnSave}
                        className="btn-hover"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        ✓ Save
                      </button>
                      <button 
                        style={styles.btnCancel}
                        className="btn-hover"
                        onClick={cancelEditing}
                      >
                        × Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.cardInfo}>
                      <span style={styles.categoryIcon}>🏷️</span>
                      <h4 style={styles.categoryName}>{category.name}</h4>
                      <p style={styles.categoryMeta}>
                        Created: {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={styles.actions}>
                      <button 
                        style={styles.btnEdit}
                        className="btn-hover"
                        onClick={() => startEditing(category)}
                      >
                        ✎ Edit
                      </button>
                      <button 
                        style={styles.btnDelete}
                        className="btn-hover"
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