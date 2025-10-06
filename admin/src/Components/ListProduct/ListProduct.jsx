import React, { useEffect, useState, useCallback } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const productsPerPage = 10; // You can adjust this value

    const fetchInfo = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/products_paginated?page=${page}&limit=${productsPerPage}`);
            const data = await res.json();
            
            // Handle API errors
            if (data.error) {
                console.error("API Error:", data.error);
                setLoading(false);
                return;
            }
            
            setAllProducts(data.products);
            setTotalPages(data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setLoading(false);
        }
    }, [page, productsPerPage]);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    const handleNextPage = () => {
        setPage(prevPage => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const remove_product = async (id) => {
        await fetch('http://localhost:4000/removeproduct', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        });
        await fetchInfo();
    };

    return (
        <div className='list-product'>
            <h1>All Products list</h1>
            <div className="listproduct-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-allproducts">
                <hr />
                {loading ? (
                    <p>Loading products...</p>
                ) : allproducts.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    allproducts.map((product) => (
                        <React.Fragment key={product.id}>
                            <div className="listproduct-format-main listproduct-format">
                                <img src={product.image} alt="" className="listproduct-product-icon" />
                                <p>{product.name}</p>
                                <p>₱{product.old_price}</p>
                                <p>₱{product.new_price}</p>
                                <p>{product.category}</p>
                                <img
                                    onClick={() => remove_product(product.id)}
                                    className="listproduct-remove-icon"
                                    src={cross_icon}
                                    alt=""
                                />
                            </div>
                            <hr />
                        </React.Fragment>
                    ))
                )}
            </div>
            <div className="pagination">
                <button onClick={handlePrevPage} disabled={page === 1}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default ListProduct;