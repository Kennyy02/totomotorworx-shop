import React, { useState } from 'react'
import './Navbar.css'
import { Link, useLocation } from 'react-router-dom'
import navProfile from '../../assets/nav-profile.png'
import add_product_icon from '../../assets/Product_Cart.png'
import list_product_icon from '../../assets/Product_list_icon.png'
import user_management_icon from '../../assets/Users_icon.png'
import inventory_icon from '../../assets/Inventory.png'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const menuItems = [
    { path: '/', icon: inventory_icon, label: 'Dashboard' },
    { path: '/addproduct', icon: add_product_icon, label: 'Add Products' },
    { path: '/listproduct', icon: list_product_icon, label: 'Product List' },
    { path: '/usermanagement', icon: user_management_icon, label: 'Manage Users' },
    { path: '/inventory', icon: inventory_icon, label: 'Inventory Management' },
    { path: '/analytics', icon: inventory_icon, label: 'Analytics' }
  ]

  return (
    <>
      <div className='navbar'>
        <div className="navbar-left">
          <button className="hamburger-btn" onClick={toggleMenu}>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
          <h2 className='nav-title'>Admin Dashboard</h2>
        </div>
        <img src={navProfile} className='nav-profile' alt="User Profile" />
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={closeMenu}>×</button>
        </div>
        <div className="mobile-menu-items">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.path} 
              style={{textDecoration:"none"}}
              onClick={closeMenu}
            >
              <div className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}>
                <img src={item.icon} alt="" />
                <p>{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

export default Navbar