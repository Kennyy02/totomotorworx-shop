import React from 'react'
import './Offers.css'
import exlusive_image from '../Assets/exclusive_image.png'

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
         <h1>Exclusive</h1>
         <h1>Offers for you</h1>
         <p>Only On Best Sellers Products</p>
      </div>
      <div className="offers-right">
        <img src={exlusive_image} alt="" />
      </div>
    </div>
  )
}

export default Offers