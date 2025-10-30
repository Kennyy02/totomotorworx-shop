import React from 'react';
import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import add_product_icon from '../../assets/Product_Cart.png';
import list_product_icon from '../../assets/Product_list_icon.png';
import user_management_icon from '../../assets/Users_icon.png';
import inventory_icon from '../../assets/Inventory.png';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className='sidebar'>
      <Link to={'/'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
          <img src={inventory_icon} alt="" />
          <p>Dashboard</p>
        </div>
      </Link>

      <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/addproduct' ? 'active' : ''}`}>
          <img src={add_product_icon} alt="" />
          <p>Add Products</p>
        </div>
      </Link>

      <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/listproduct' ? 'active' : ''}`}>
          <img src={list_product_icon} alt="" />
          <p>Product List</p>
        </div>
      </Link>

      {/* ✅ Category Management with Emoji Icon */}
      <Link to={'/categories'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/categories' ? 'active' : ''}`}>
          <span style={{fontSize: '22px', minWidth: '22px', textAlign: 'center'}}>📂</span>
          <p>Category Management</p>
        </div>
      </Link>

      <Link to={'/usermanagement'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/usermanagement' ? 'active' : ''}`}>
          <img src={user_management_icon} alt="" />
          <p>Manage Users</p>
        </div>
      </Link>

      <Link to={'/inventory'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/inventory' ? 'active' : ''}`}>
          <img src={inventory_icon} alt="" />
          <p>Inventory Management</p>
        </div>
      </Link>

      <Link to={'/analytics'} style={{textDecoration:"none"}}>
        <div className={`sidebar-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
          <img src={inventory_icon} alt="" />
          <p>Analytics</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;