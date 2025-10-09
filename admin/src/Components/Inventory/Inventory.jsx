// src/components/Inventory/Inventory.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import './Inventory.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [editStock, setEditStock] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 products per page (you can adjust)

  // --- Currency Formatter for PHP ---
  const formatPeso = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2
    });
  };

  // Fetch inventory from backend
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${BACKEND_URL}/inventory`);

      const processedProducts = res.data.map(product => ({
        ...product,
        available: product.available === 1
      }));

      setProducts(processedProducts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to fetch inventory. " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleChange = (id, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      setEditStock(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async (id) => {
    const productToSave = products.find(p => p.id === id);
    const initialProductStock = productToSave ? productToSave.stock : 0;
    const rawInputValue = editStock[id];

    let stockValue;

    if (rawInputValue === undefined) {
      stockValue = initialProductStock;
    } else if (rawInputValue === '') {
      stockValue = 0;
    } else {
      stockValue = Number(rawInputValue);
    }

    if (isNaN(stockValue) || stockValue < 0) {
      alert("Stock must be a non-negative number.");
      setEditStock(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    setSavingId(id);
    try {
      await axios.put(`${BACKEND_URL}/inventory/${id}`, { stock: stockValue });
      alert("Stock updated successfully");
      fetchInventory();
      setEditStock(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock. " + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  // --- Pagination logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="inventory-management-container">
      <h2>Inventory Management</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Old Price</th>
            <th>New Price</th>
            <th>Current Stock</th>
            <th>Date Added</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.length === 0 ? (
            <tr><td colSpan="10">No products found in the database.</td></tr>
          ) : (
            currentProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.image && (
                    <img src={product.image} alt={product.name} className="product-thumbnail-img" />
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatPeso(product.old_price)}</td>
                <td>{formatPeso(product.new_price)}</td>
                <td>
                  <input
                    type="text"
                    value={
                      editStock[product.id] !== undefined
                        ? editStock[product.id]
                        : product.stock
                    }
                    onChange={(e) => handleChange(product.id, e.target.value)}
                    className="stock-input"
                  />
                </td>
                <td>{new Date(product.date).toLocaleDateString()}</td>
                <td>{product.available ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    onClick={() => handleSave(product.id)}
                    className="save-stock-button"
                    disabled={savingId === product.id}
                  >
                    {savingId === product.id ? 'Saving...' : 'Save Stock'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Prev
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => goToPage(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
