import React, { useContext, useRef, useState, useEffect } from 'react';
import './Navbar.css';
import bike from '../Assets/bike.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { HomeContext } from '../../Context/HomeContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartItems } = useContext(HomeContext);
  const menuRef = useRef();
  
  // ✅ NEW: Fetch categories dynamically from database
  const [productCategories, setProductCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://totomotorworx-shop-production.up.railway.app/categories');
      const data = await response.json();
      
       // ✅ FIXED: Filter out "service" and format the rest
    const formattedCategories = data
      .filter(cat => cat.name.toLowerCase() !== 'service') // ADD THIS LINE
      .map(cat => {
        const categoryPath = cat.name.toLowerCase().replace(/\s+/g, '-');
        
        return {
          name: cat.name,
          path: `/products/${categoryPath}`
        };
      })
      
      setProductCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if fetch fails
      setProductCategories([
        { name: "Tires", path: "/products/tires" },
        { name: "Grips", path: "/products/grip" },
        { name: "Motor Oil", path: "/products/motor-oil" },
        { name: "Helmets", path: "/products/helmet" },
        { name: "Spray Paint", path: "/products/spray-paint" },
        { name: "Cables", path: "/products/cable" }
      ]);
    }
  };

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={bike} alt="" />
        <p>totomotorworx</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("home") }}>
          <Link style={{ textDecoration: 'none' }} to='/'>Home</Link>
          {menu === "home" ? <hr /> : <></>}
        </li>

        {/* ✅ Dynamic Products Dropdown */}
        <li className="dropdown-container" onClick={() => { setMenu("products") }}>
          <Link style={{ textDecoration: 'none' }} to='/products'>Products</Link>
          {menu === "products" ? <hr /> : <></>}
          
          <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
            {productCategories.map((category, index) => (
              <Link 
                key={index} 
                to={category.path}
                onClick={() => setMenu("products")}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </li>

        <li onClick={() => { setMenu("services") }}>
          <Link style={{ textDecoration: 'none' }} to='/services'>Services</Link>
          {menu === "services" ? <hr /> : <></>}
        </li>
        <li onClick={() => { setMenu("abouts") }}>
          <Link style={{ textDecoration: 'none' }} to='/abouts'>About</Link>
          {menu === "abouts" ? <hr /> : <></>}
        </li>
      </ul>
      <div className="nav-login-cart">
        {localStorage.getItem('auth-token')
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace('/') }}>Logout</button>
          : <Link to='/login'><button>Login</button></Link>}
        <Link to='/cart'><img src={cart_icon} alt="" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  )
}

export default Navbar;