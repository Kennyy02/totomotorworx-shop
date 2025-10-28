import React, { createContext, useEffect, useState } from "react";

export const HomeContext = createContext(null);

// ✅ Dynamic API base URL for both local and Railway (Must be set in .env file as REACT_APP_BACKEND_URL)
const API_URL = process.env.REACT_APP_BACKEND_URL;

// ✅ Initialize default cart with up to 300 items
const getDefaultCart = () => {
   const cart = {};
   for (let i = 1; i <= 300; i++) cart[i] = 0;
    return cart;
};

const HomeContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // ✅ Helper to send real-time analytics data to backend
 const syncCartToAnalytics = async (productId, userId, action) => {
    try {
      // Using API_URL for deployed backend connection
      await fetch(`${API_URL}/${action === "add" ? "addtocart" : "removefromcart"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, user_id: userId }),
      });
    } catch (error) {
      console.error("Error syncing with analytics backend:", error);
     }
  };

 useEffect(() => {
   // ✅ Fetch all products - Using API_URL
   fetch(`${API_URL}/products`)
      .then((response) => {
        // Robust error handling for production deployment
        if (!response.ok) {
          console.error("HTTP Error fetching products:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`); 
        }
        return response.json();
      })
      .then((data) => {
      if (Array.isArray(data)) { 
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

    // ✅ Fetch user cart if logged in - Using API_URL
    const token = localStorage.getItem("auth-token");
    if (token) {
      fetch(`${API_URL}/getcart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => setCartItems(data))
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, []);


  // ✅ FIXED: Add to cart + sync to backend (handles services properly)
  const addToCart = (itemId) => {
    const token = localStorage.getItem("auth-token");
    
    // Find the product to check if it's a service or physical product
    const product = all_product.find((p) => p.id === itemId);
    
    // Check if product exists and has stock (skip stock check for services)
    if (!product) {
      console.error("Product not found:", itemId);
      return;
    }
    
    const isService = product.category === 'service';
    const hasStock = product.stock > 0 || isService; // Services always have "stock"
    
    if (!hasStock) {
      alert("This item is out of stock!");
      return;
    }

    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: prev[itemId] + 1 };

      // If user is logged in → sync to server cart - Using API_URL
      if (token) {
        fetch(`${API_URL}/addtocart`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId }),
        }).catch((err) => console.error("Add to cart error:", err));
      }

      // 🔥 Sync to analytics backend (real-time chart) - Restored for CartAnalytics
      syncCartToAnalytics(itemId, 1, "add"); 

      return updated;
     });

    // ✅ FIXED: Only decrease stock for physical products, NOT services
    if (!isService) {
      setAll_Product((prevProducts) =>
        prevProducts.map((p) =>
          p.id === itemId && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
        )
      );
    }
  };

  // ✅ FIXED: Remove from cart + sync to backend (handles services properly)
  const removeFromCart = (itemId) => {
    const token = localStorage.getItem("auth-token");
    
    // Find the product to check if it's a service
    const product = all_product.find((p) => p.id === itemId);
    const isService = product?.category === 'service';

    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: Math.max(prev[itemId] - 1, 0) };

      if (token) {
        // Using API_URL for deployed backend connection
        fetch(`${API_URL}/removefromcart`, { 
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId }), // Fixed: now sends itemId
        }).catch((err) => console.error("Remove from cart error:", err));
      }

      // 🔥 Sync to analytics backend (real-time chart) - Restored for CartAnalytics
      syncCartToAnalytics(itemId, 1, "remove"); 

      return updated;
    });

    // ✅ FIXED: Only restore stock for physical products, NOT services
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
  const getTotalCartItems = () =>
  Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);

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