import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add_product_icon from '../../assets/Product_Cart.png';
import list_product_icon from '../../assets/Product_list_icon.png';
import user_management_icon from '../../assets/Users_icon.png';
import inventory_icon from '../../assets/Inventory.png'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'/addproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Add Products</p>
        </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Product List</p>
        </div>
      </Link>
      <Link to={'/usermanagement'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={user_management_icon} alt="" />
          <p>Manage Users</p>
        </div>
      </Link>
      <Link to={'/inventory'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={inventory_icon} alt="" />
          <p>Inventory management</p>
        </div>
      </Link>
      <Link to={'/analytics'} style={{textDecoration:"none"}}>
        <div className="sidebar-item">
          <img src={inventory_icon} alt="" />
          <p>Analytics</p>
        </div>
      </Link>
    </div>
  )
}

export default Sidebar