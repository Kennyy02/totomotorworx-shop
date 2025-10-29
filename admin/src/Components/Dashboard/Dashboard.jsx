import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    lowStockItems: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsRes = await fetch('https://totomotorworx-shop-production.up.railway.app/products');
      const productsData = await productsRes.json();
      
      // Fetch users
      const usersRes = await fetch('https://totomotorworx-shop-production.up.railway.app/users');
      const usersData = await usersRes.json();
      
      // Calculate low stock items (products with stock < 10)
      const lowStock = productsData.filter(product => {
        const stock = product.stock !== undefined ? product.stock : 0;
        return stock < 10;
      }).length;

      setStats({
        totalProducts: productsData.length,
        totalUsers: usersData.length,
        lowStockItems: lowStock
      });
      
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Add New Product', icon: '📦', link: '/addproduct', color: '#6079ff' },
    { title: 'View Products', icon: '📋', link: '/listproduct', color: '#7c5dff' },
    { title: 'Manage Users', icon: '👥', link: '/usermanagement', color: '#ff6b9d' },
    { title: 'Check Inventory', icon: '📊', link: '/inventory', color: '#ffa726' }
  ];

  // Format currency
  const formatPeso = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ borderTopColor: '#6079ff' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6079ff 0%, #7c5dff 100%)' }}>
                📦
              </div>
              <div className="stat-info">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className="stat-card" style={{ borderTopColor: '#ff6b9d' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)' }}>
                👥
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card" style={{ borderTopColor: '#ffa726' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffa726 0%, #ffb74d 100%)' }}>
                ⚠️
              </div>
              <div className="stat-info">
                <h3>{stats.lowStockItems}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>
          </div>

          {/* Inventory Display */}
          <div className="inventory-section">
            <h2>Current Inventory</h2>
            <div className="inventory-table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No products found</td></tr>
                  ) : (
                    currentProducts.map((product) => {
                      const stock = product.stock !== undefined ? product.stock : 0;
                      const isLowStock = stock < 10;
                      
                      return (
                        <tr key={product.id}>
                          <td data-label="Image">
                            {product.image && (
                              <img src={product.image} alt={product.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }} />
                            )}
                          </td>
                          <td data-label="Product Name">{product.name}</td>
                          <td data-label="Category">{product.category}</td>
                          <td data-label="Price">{formatPeso(product.new_price)}</td>
                          <td data-label="Stock">
                            <span style={{ 
                              fontWeight: 'bold',
                              color: stock === 0 ? '#f44336' : isLowStock ? '#ff9800' : '#4caf50'
                            }}>
                              {stock}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge ${stock === 0 ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
                              {stock === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <Link to={action.link} key={index} className="action-card" style={{ '--hover-color': action.color }}>
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-title">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity / Alerts */}
          <div className="alerts-section">
            <h2>System Alerts</h2>
            <div className="alerts-container">
              {stats.lowStockItems > 0 && (
                <div className="alert alert-warning">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <h4>Low Stock Warning</h4>
                    <p>You have {stats.lowStockItems} product(s) with low inventory (stock below 10). Check inventory now.</p>
                  </div>
                  <Link to="/inventory" className="alert-action">View</Link>
                </div>
              )}
              
              <div className="alert alert-info">
                <span className="alert-icon">ℹ️</span>
                <div className="alert-content">
                  <h4>System Status</h4>
                  <p>All systems are operational. Railway backend is connected.</p>
                </div>
              </div>

              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <div className="alert-content">
                  <h4>Analytics Available</h4>
                  <p>New cart analytics are ready for review.</p>
                </div>
                <Link to="/analytics" className="alert-action">View</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;