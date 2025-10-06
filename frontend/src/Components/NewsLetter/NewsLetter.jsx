import React from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  return (
    <div className="shop-location">
      <h1>totomotorworx</h1>
      <p>Your trusted source for quality motorcycle and auto parts</p>

      <div className="shop-card">
        <h2>Our Shop</h2>
        <p>📍 Morente Street, Roxas, Oriental Mindoro</p>
        <p>📞 (02) 123-4567</p>
        <p>🕒 Open: Mon–Sat | 8:00 AM – 7:00 PM</p>
      </div>

      <div className="shop-map">
        <iframe
          title="motor-parts-shop-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1946.9331013576887!2d121.5119496158629!3d12.5910684931454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bb49c07a89766f%3A0xac3df038a9660df8!2sToto%20Motorworx!5e0!3m2!1sen!2sph!4v1758276232543!5m2!1sen!2sph"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  )
}

export default NewsLetter
