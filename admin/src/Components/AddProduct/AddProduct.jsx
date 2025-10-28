import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "tires",
        new_price: "",
        old_price: "",
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const Add_Product = async () => {
        // --- 1. Client-Side Validation ---
        if (!productDetails.name || !image || !productDetails.category || !productDetails.new_price || !productDetails.old_price) {
            alert("Please fill out all the fields and upload an image.");
            return;
        }
        
        let responseData;
        let product = productDetails;

        try {
            // --- 2. Image Upload ---
            let formData = new FormData();
            formData.append('product', image);

            const uploadResponse = await fetch('https://totomotorworx-shop-production.up.railway.app/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });
            responseData = await uploadResponse.json();

            if (!responseData.success) {
                alert("Image upload failed. Please try again.");
                return;
            }

            product.image = responseData.image_url;

            // --- 3. Add Product to Database ---
            const addProductResponse = await fetch('https://totomotorworx-shop-production.up.railway.app/addproduct', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });
            const addProductData = await addProductResponse.json();
            
            // --- 4. Improved Error Handling and Feedback ---
            if (addProductData.success) {
                alert("Product Added Successfully!");
                setProductDetails({
                    name: "",
                    image: "",
                    category: "tires",
                    new_price: "",
                    old_price: "",
                });
                setImage(false);
            } else {
                alert(`Failed to add product: ${addProductData.error || 'Unknown error'}`);
            }

        } catch (error) {
            console.error("An unexpected error occurred:", error);
            alert("An unexpected error occurred. Check the console for details.");
        }
    };

    return (
        <div className='add-product'>
            {/* Product Name */}
            <div className="addproduct-itemfield">
                <p>Product/Service title</p>
                <input 
                    value={productDetails.name} 
                    onChange={changeHandler} 
                    type="text" 
                    name='name' 
                    placeholder='Type here' 
                />
            </div>

            {/* Price Fields */}
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input 
                        value={productDetails.old_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='old_price' 
                        placeholder='Type here' 
                    />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input 
                        value={productDetails.new_price} 
                        onChange={changeHandler} 
                        type="text" 
                        name='new_price' 
                        placeholder='Type here' 
                    />
                </div>
            </div>

            {/* Category */}
            <div className="addproduct-itemfield">
                <p>Category</p>
                <select 
                    value={productDetails.category} 
                    onChange={changeHandler} 
                    name="category" 
                    className='add-product-selector'
                >
                    <option value="tires">Tires</option>
                    <option value="grip">Grips</option>
                    <option value="motor-oil">Motor Oil</option>
                    <option value="helmet">Helmets</option>
                    <option value="spray-paint">Spray Paint</option>
                    <option value="cable">Cable</option>
                    <option value="service">Service</option>
                </select>
            </div>

            {/* Upload Area */}
            <div className="addproduct-upload-section">
                <label className="addproduct-upload-label">Upload Area</label>
                <div className="addproduct-thumbnail-container">
                    <label htmlFor="file-input" style={{width: '100%', cursor: 'pointer'}}>
                        {image ? (
                            <div className="image-preview-container">
                                <img 
                                    src={URL.createObjectURL(image)} 
                                    className='addproduct-thumbnail-img' 
                                    alt="Product Preview" 
                                />
                                <span className="image-name">{image.name}</span>
                            </div>
                        ) : (
                            <div className="upload-content">
                                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="upload-text">Upload Area</span>
                            </div>
                        )}
                    </label>
                    <input 
                        onChange={imageHandler} 
                        type="file" 
                        name='image' 
                        id='file-input' 
                        hidden 
                        accept="image/*" 
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button onClick={Add_Product} className='addproduct-btn'>
                ADD
            </button>
        </div>
    );
};

export default AddProduct;