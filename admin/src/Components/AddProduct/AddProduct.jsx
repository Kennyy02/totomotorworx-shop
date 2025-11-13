import React, { useState, useEffect } from 'react'
import './AddProduct.css'
import '../AdminTheme.css';

// Upload Icon Component
const UploadIcon = () => (
  <div className='addproduct-thumbnail-img' style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  }}>
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6079ff" strokeWidth="2" strokeDasharray="4 4"/>
      <path d="M12 8v8M8 12h8" stroke="#6079ff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, color: '#6079ff', fontSize: '14px', fontWeight: '600' }}>
        Upload Product Image
      </p>
      <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '12px' }}>
        PNG, JPG or SVG
      </p>
    </div>
  </div>
);

const AddProduct = () => {
    const [image, setImage] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "", // Will be set after categories load
        new_price: "",
        old_price: "",
    });

    // ✅ Fetch categories from database on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://totomotorworx-shop-production.up.railway.app/categories');
            const data = await response.json();
            
            console.log('📦 Fetched categories:', data);
            setCategories(data);
            
            // Set default category to first one
            if (data.length > 0 && !productDetails.category) {
                setProductDetails(prev => ({ ...prev, category: data[0].name }));
            }
            
            setLoadingCategories(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoadingCategories(false);
            alert('Failed to load categories. Please refresh the page.');
        }
    };

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

            console.log('📤 Sending product to backend:', product);

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
                // Clear the form after a successful submission
                setProductDetails({
                    name: "",
                    image: "",
                    category: categories.length > 0 ? categories[0].name : "",
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
            <div className="addproduct-itemfield">
                <p>Product/Service title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
            </div>
            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here' />
                </div>
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here' />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Category</p>
                {loadingCategories ? (
                    <div style={{ padding: '14px', color: '#999' }}>Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div style={{ padding: '14px', color: '#e74c3c' }}>
                        No categories available. Please add categories first in Category Management.
                    </div>
                ) : (
                    <select 
                        value={productDetails.category} 
                        onChange={changeHandler} 
                        name="category" 
                        className='add-product-selector'
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="addproduct-itemfield">
                <label htmlFor="file-input">
                    {image ? (
                        <img src={URL.createObjectURL(image)} className='addproduct-thumbnail-img' alt="Product" />
                    ) : (
                        <UploadIcon />
                    )}
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
            </div>
            <button 
                onClick={() => { Add_Product() }} 
                className='addproduct-btn'
                disabled={loadingCategories || categories.length === 0}
            >
                ADD
            </button>
        </div>
    );
};

export default AddProduct;