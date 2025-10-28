import React from 'react'
import './Navbar.css'
// import navlogo from '../../assets/nav-logo.png'; // Removed: No longer needed
import navProfile from '../../assets/nav-profile.png';

const Navbar = () => {
  return (
    <div className='navbar'>
    {/* Replaced image with an h2 element for the title */}
    <h2 className='nav-title'>Admin Dashboard</h2> 
    <img src={navProfile} className='nav-profile' alt="User Profile" />
    </div>
  )
}

export default Navbar