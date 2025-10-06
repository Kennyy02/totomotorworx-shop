import React, { useContext } from 'react';
import './ProductDisplay.css';
import { HomeContext } from '../../Context/HomeContext';

const ProductDisplay = (props) => {
    const { product } = props;
    const { addToCart } = useContext(HomeContext);

    // Determine if the product is in stock
    const isInStock = product.stock > 0;

    return (
        <div className='productdisplay'>
            {/* Left Section - Images */}
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt={product.name} />
                    <img src={product.image} alt={product.name} />
                    <img src={product.image} alt={product.name} />
                    <img src={product.image} alt={product.name} />
                </div>
                <div className="productdisplay-img">
                    <img className='productdisplay-main-img' src={product.image} alt={product.name} />
                </div>
            </div>

            {/* Right Section - Details */}
            <div className="productdisplay-right">
                <h2 className="productdisplay-title">{product.name || "Featured Product"}</h2>

                {/* Price Section */}
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">
                        ₱{product.old_price?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="productdisplay-right-price-new">
                        ₱{product.new_price?.toFixed(2) || 'N/A'}
                    </div>
                </div>

                {/* Stock Section */}
                <div className="productdisplay-right-stock">
                    <p>
                        <b>Stock Available: </b>
                        {isInStock ? (
                            <span className="in-stock">{product.stock} in stock</span>
                        ) : (
                            <span className="out-of-stock">Out of Stock</span>
                        )}
                    </p>
                </div>

                {/* Welcoming Description */}
                <p className="productdisplay-description">
                    {product.description || (
                        <>
                            <strong>
                                👋 Welcome to <span className="brand-name">TotoMotorWorx</span> Online Canvassing!
                            </strong> ✨ <br />
                            We’re excited to have you here. Take your time browsing our wide range of high-quality automotive products.  
                            Compare prices, explore features, and find the best deals that fit your needs.  
                            <br /><br />
                            At <span className="brand-name">TotoMotorWorx</span>, your satisfaction and trust is our top priorities. 
                        </>
                    )}
                </p>

                {/* Add to Cart Button */}
                <button
                    onClick={() => { addToCart(product.id) }}
                    disabled={!isInStock}
                    className={`add-to-cart-btn ${!isInStock ? 'disabled-add-to-cart-button' : ''}`}
                >
                    {isInStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductDisplay;
