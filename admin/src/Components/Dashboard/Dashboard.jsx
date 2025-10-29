import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    lowStockItems: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsRes = await fetch('https://totomotorworksbe-production.up.railway.app/allproducts');
      const productsData = await productsRes.json();
      
      // Fetch users
      const usersRes = await fetch('https://totomotorworksbe-production.up.railway.app/allusers');
      const usersData = await usersRes.json();
      
      // Calculate low stock items (products with quantity < 10)
      const lowStock = productsData.filter(product => product.quantity < 10).length;
      
      // Calculate total revenue (example calculation)
      const revenue = productsData.reduce((sum, product) => {
        return sum + (product.new_price * (product.sold || 0));
      }, 0);

      setStats({
        totalProducts: productsData.length,
        totalUsers: usersData.length,
        lowStockItems: lowStock,
        totalRevenue: revenue
      });
      
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

            <div className="stat-card" style={{ borderTopColor: '#4caf50' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}>
                💰
              </div>
              <div className="stat-info">
                <h3>₱{stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
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
                    <p>You have {stats.lowStockItems} product(s) with low inventory. Check inventory now.</p>
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