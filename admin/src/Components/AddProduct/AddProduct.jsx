import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "tires", // Default category
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
            return; // Stop the function if validation fails
        }
        
        let responseData;
        let product = productDetails;

        try {
            // --- 2. Image Upload ---
            let formData = new FormData();
            formData.append('product', image);

            const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });
            responseData = await uploadResponse.json();

            if (!responseData.success) {
                alert("Image upload failed. Please try again.");
                return; // Stop if image upload fails
            }

            product.image = responseData.image_url;

            // --- 3. Add Product to Database ---
            const addProductResponse = await fetch(`${BACKEND_URL}/addproduct`, {
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
                // Clear the form after a successful submission
                setProductDetails({
                    name: "",
                    image: "",
                    category: "tires",
                    new_price: "",
                    old_price: "",
                });
                setImage(false);
            } else {
                // Display the specific error message from the backend
                alert(`Failed to add product: ${addProductData.error || 'Unknown error'}`);
            }

        } catch (error) {
            console.error("An unexpected error occurred:", error);
            alert("An unexpected error occurred. Check the console for details.");
        }
    };

    return (
        <div className='add-product'>
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here' />
                </div>
                <div className="addproduct-itemfield">
                    <p> Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here' />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
                    <option value="tires">Tires</option>
                    <option value="grip">Grips</option>
                    <option value="motor-oil">Motor Oil</option>
                    <option value="helmet">Helmets</option>
                    <option value="spray-paint">Spray Paint</option>
                    <option value="cable">Cable</option>
                </select>
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-thumbnail-img' alt="Upload Area" />
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
            </div>
            <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button>
        </div>
    );
};

export default AddProduct;