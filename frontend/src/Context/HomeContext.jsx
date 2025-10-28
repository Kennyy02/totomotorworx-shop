import React, { createContext, useEffect, useState } from "react";

export const HomeContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getDefaultCart = () => {
   const cart = {};
   for (let i = 1; i <= 300; i++) cart[i] = 0;
    return cart;
};

const HomeContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

 useEffect(() => {
   fetch(`${API_URL}/products`)
      .then((response) => {
        if (!response.ok) {
          console.error("HTTP Error fetching products:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`); 
        }
        return response.json();
      })
      .then((data) => {
      if (Array.isArray(data)) { 
            console.log("✅ Products loaded:", data.length);
            setAll_Product(data);
      } else {
          console.error("Backend returned non-array data for products:", data);
            setAll_Product([]);
      }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setAll_Product([]);
      });

    const token = localStorage.getItem("auth-token");
    if (token) {
      console.log("🔑 Auth token found, fetching cart...");
      fetch(`${API_URL}/getcart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Cart data loaded:", data);
          setCartItems(data);
        })
        .catch((err) => console.error("Error fetching cart:", err));
    } else {
      console.log("❌ No auth token found");
    }
  }, []);


  // ✅ Add to cart with extensive debugging
  const addToCart = (itemId) => {
    console.log("🛒 ADD TO CART CALLED - Item ID:", itemId);
    
    const token = localStorage.getItem("auth-token");
    console.log("🔑 Token exists:", !!token);
    
    if (!token) {
      alert("Please log in to add items to your cart!");
      window.location.href = '/login';
      return;
    }

    // Find the product
    const product = all_product.find((p) => p.id === itemId);
    console.log("📦 Product found:", product);
    
    if (!product) {
      console.error("❌ Product not found:", itemId);
      alert("Product not found!");
      return;
    }

    // Check if it's a service
    const isService = product.category && product.category.toLowerCase() === 'service';
    console.log("🔍 Is Service:", isService, "| Category:", product.category);

    // Only check stock for physical products
    if (!isService && product.stock <= 0) {
      console.error("❌ Out of stock");
      alert("This item is out of stock!");
      return;
    }

    console.log("✅ Validation passed, adding to cart...");

    // Update cart state locally FIRST
    setCartItems((prev) => {
      const newQuantity = (prev[itemId] || 0) + 1;
      const updated = { ...prev, [itemId]: newQuantity };
      console.log("📊 Updated cart state:", { itemId, oldQty: prev[itemId] || 0, newQty: newQuantity });

      // Then sync to backend
      console.log("🌐 Sending request to:", `${API_URL}/addtocart`);
      fetch(`${API_URL}/addtocart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })
      .then(response => {
        console.log("📡 Response status:", response.status);
        return response.json();
      })
      .then(data => {
        console.log("📡 Backend response:", data);
        if (data.success) {
          console.log("✅ Item successfully added to cart in backend");
        } else {
          console.error("❌ Backend error:", data);
          alert("Failed to add item to cart: " + (data.error || "Unknown error"));
        }
      })
      .catch((err) => {
        console.error("❌ Network error:", err);
        alert("Network error: " + err.message);
      });

      return updated;
    });

    // Only decrease stock for physical products
    if (!isService) {
      console.log("📉 Decreasing stock for physical product");
      setAll_Product((prevProducts) =>
        prevProducts.map((p) =>
          p.id === itemId && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
        )
      );
    } else {
      console.log("ℹ️ Service detected - skipping stock decrease");
    }
  };

  // ✅ Remove from cart with debugging
  const removeFromCart = (itemId) => {
    console.log("🗑️ REMOVE FROM CART CALLED - Item ID:", itemId);
    
    const token = localStorage.getItem("auth-token");
    
    if (!token) {
      console.log("❌ No token, cannot remove from cart");
      return;
    }

    const product = all_product.find((p) => p.id === itemId);
    const isService = product?.category && product.category.toLowerCase() === 'service';

    setCartItems((prev) => {
      const newQuantity = Math.max((prev[itemId] || 0) - 1, 0);
      const updated = { ...prev, [itemId]: newQuantity };
      console.log("📊 Updated cart (remove):", { itemId, oldQty: prev[itemId] || 0, newQty: newQuantity });

      fetch(`${API_URL}/removefromcart`, { 
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }), 
      })
      .then(response => response.json())
      .then(data => {
        console.log("📡 Remove response:", data);
        if (data.success) {
          console.log("✅ Item removed from cart in backend");
        }
      })
      .catch((err) => console.error("❌ Remove error:", err));

      return updated;
    });

    // Only restore stock for physical products
    if (!isService) {
      setAll_Product((prevProducts) =>
        prevProducts.map((p) =>
          p.id === itemId ? { ...p, stock: p.stock + 1 } : p
        )
      );
    }
  };

  // ✅ Calculate total amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const product = all_product.find((p) => p.id === Number(item));
        if (product) total += product.new_price * cartItems[item];
      }
    }
    return total;
  };

  // ✅ Count total number of items in cart
  const getTotalCartItems = () => {
    const count = Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);
    console.log("🛒 Total cart items:", count);
    return count;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
  };

  return (
    <HomeContext.Provider value={contextValue}>
      {props.children}
    </HomeContext.Provider>
  );
};

export default HomeContextProvider;