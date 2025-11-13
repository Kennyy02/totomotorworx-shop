import React from 'react';
import './Admin.css';
import './AdminTheme.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../Components/Dashboard/Dashboard';
import AddProduct from '../../Components/AddProduct/AddProduct';
import ListProduct from '../../Components/ListProduct/ListProduct';
import UserManagement from '../../Components/UserManagement/UserManagement';
import Inventory from '../../Components/Inventory/Inventory';
import CartAnalytics from '../../Components/Analytics/CartAnalytics';
import CategoryManagement from '../../Components/Category/CategoryManagement';

const Admin = () => {
  // Fix: Use correct key 'auth-token' to get token
  const authToken = localStorage.getItem('auth-token');

  return (
    <div className='admin'>
      <Sidebar />
      <Routes>
        {/* Default route - Dashboard Overview */}
        <Route path='/' element={<Dashboard />} />
        <Route path='/addproduct' element={<AddProduct />} />
        <Route path='/categories' element={<CategoryManagement />} />
        <Route path='/listproduct' element={<ListProduct />} />
        <Route path='/usermanagement' element={<UserManagement authToken={authToken} />} />
        <Route path='/inventory' element={<Inventory/>} />
        <Route path='/analytics' element={<CartAnalytics/>} />
      </Routes>
    </div>
  );
};

export default Admin;