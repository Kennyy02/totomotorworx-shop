import React, { useContext, useRef, useState } from 'react';
import './Navbar.css';
import bike from '../Assets/bike.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { HomeContext } from '../../Context/HomeContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {

     const [menu,setMenu] = useState("home");
     const {getTotalCartItems}= useContext(HomeContext);
     const menuRef = useRef();

     const dropdown_toggle = (e) =>{
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
          <li onClick={()=>{setMenu("home")}}><Link style={{ textDecoration: 'none'}} to='/'>Home</Link>{menu==="home"?<hr/>:<></>}</li>
          <li className="dropdown-container" onClick={()=>{setMenu("products")}}>
             <Link style={{ textDecoration: 'none'}} to='/products'>Products</Link>{menu==="products"?<hr/>:<></>}
             <div className="dropdown-content">
                 <Link to="/products/tires">Tires</Link>
                 <Link to="/products/grip">Grips</Link>
                 <Link to="/products/motor-oil">Motor Oil</Link>
                 <Link to="/products/helmet">Helmets</Link>
                 <Link to="/products/spray-paint">Spray Paints</Link>
                 <Link to="/products/cable">Cables</Link>
             </div>
          </li>
          <li onClick={()=>{setMenu("services")}}><Link style={{ textDecoration: 'none'}} to='/services'>Services</Link>{menu==="services"?<hr/>:<></>}</li>
          <li onClick={()=>{setMenu("abouts")}}><Link style={{ textDecoration: 'none'}} to='/abouts'>About</Link>{menu==="abouts"?<hr/>:<></>}</li>
       </ul>
       <div className="nav-login-cart">
         {localStorage.getItem('auth-token')
         ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button>
      :<Link to='/login'><button>Login</button></Link>}
          <Link to='/cart'><img src={cart_icon} alt="" /></Link>
          <div className="nav-cart-count">{getTotalCartItems()}</div>
       </div>
    </div>
  )
}

export default Navbar;