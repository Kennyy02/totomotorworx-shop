import React, { useContext } from 'react';
import './CartItems.css';
import { HomeContext } from '../../Context/HomeContext';

// This function formats a number with commas and ensures two decimal places.
const formatNumber = (num) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart } = useContext(HomeContext);
  const totalAmount = getTotalCartAmount();

  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
      </div>
      <hr />

      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          const isOutOfStock = e.stock <= 0; // check if item is out of stock

          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img src={e.image} alt="" className='carticon-product-icon' />
                <p>{e.name}</p>
                <p>₱{formatNumber(e.new_price)}</p>

                {/* Quantity selector */}
                <div className="cartitems-quantity-controls">
                  <button onClick={() => removeFromCart(e.id)} className="quantity-btn">−</button>
                  <span className="cartitems-quantity">{cartItems[e.id]}</span>
                  <button
                    onClick={() => addToCart(e.id)}
                    className={`quantity-btn ${isOutOfStock ? 'disabled-btn' : ''}`}
                    disabled={isOutOfStock} // disable if out of stock
                  >
                    +
                  </button>
                </div>

                <p>₱{formatNumber(e.new_price * cartItems[e.id])}</p>
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₱{formatNumber(totalAmount)}</p>
            </div>
            <hr />
            <h3>Total</h3>
            <h3>₱{formatNumber(totalAmount)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
