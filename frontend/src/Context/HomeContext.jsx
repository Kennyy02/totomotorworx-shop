import React, { createContext, useEffect, useState } from "react";

export const HomeContext = createContext(null);

// ✅ Dynamic API base URL for both local and Railway
const API_URL = process.env.REACT_APP_BACKEND_URL;

const getDefaultCart = () => {
  let cart = {};
  // Assuming a max item ID of 300, we need to ensure the service IDs (9000+) are also covered.
  // For simplicity and to cover the new service IDs, we'll keep the existing max for now, 
  // but note that adding items with IDs > 300 might require updating this loop's upper limit 
  // or initializing the cart differently if the backend doesn't handle service carts.
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

// ----------------------------------------------------------------------
// 1. DEFINE THE COMPLETE SERVICES LIST
// Note: Fields like 'image' and 'category' are added to match the product structure
// used in CartItems.jsx and HomeCategory.
// ----------------------------------------------------------------------
const servicesList = [
  {
    id: 9001, // Unique ID far from product IDs
    title: "Oil Change Service",
    new_price: 35.00,
    image: 'path/to/oil_icon.png', // Placeholder
    category: 'service',
    name: 'Oil Change Service', 
    stock: 9999, // High stock for services
  },
  {
    id: 9002,
    title: "Air Filter Replacement Service",
    new_price: 15.00,
    image: 'path/to/filter_icon.png', // Placeholder
    category: 'service',
    name: 'Air Filter Replacement Service',
    stock: 9999,
  },
  {
    id: 9003,
    title: "Chain Maintenance Service",
    new_price: 20.00,
    image: 'path/to/wrench_icon.png', // Placeholder
    category: 'service',
    name: 'Chain Maintenance Service',
    stock: 9999,
  },
  {
    id: 9004,
    title: "Tire Replacement Service",
    new_price: 50.00,
    image: 'path/to/tire_icon.png', // Placeholder
    category: 'service',
    name: 'Tire Replacement Service',
    stock: 9999,
  },
];


const HomeContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    // ✅ Fetch products from backend
    fetch(`${API_URL}/products`)
      .then((response) => {
        // 1. Check if the HTTP response itself was successful
        if (!response.ok) {
            console.error("HTTP Error fetching products:", response.status);
            throw new Error(`HTTP error! status: ${response.status}`); 
        }
        return response.json();
      })
      .then((data) => {
        // 2. CRITICAL: Merge services with fetched products
        if (Array.isArray(data)) { 
            // ⬅️ MERGE servicesList with the successfully fetched products
            const combinedProducts = [...data, ...servicesList];
            setAll_Product(combinedProducts);
        } else {
            console.error("Backend returned non-array data for products:", data);
            // ⬅️ FALLBACK: Use only servicesList if fetch returns bad data
            setAll_Product(servicesList); 
        }
      })
      .catch((err) => {
        // 3. Handle network errors or thrown errors
        console.error("Error fetching products:", err);
        // ⬅️ FALLBACK: Use only servicesList if fetch fails completely
        setAll_Product(servicesList);
      });

    // ✅ Fetch user cart if logged in (This logic implicitly supports services 
    // if the backend 'getcart' returns the service IDs in the cart data.)
    if (localStorage.getItem("auth-token")) {
      fetch(`${API_URL}/getcart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: "",
      })
        .then((response) => response.json())
        .then((data) => setCartItems(data))
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, []);

  // ✅ Add to cart and decrease stock
  // This function now handles both products (with stock check) and services (stock is 9999).
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 }; // Use (prev[itemId] || 0) to safely add new high IDs

      if (localStorage.getItem("auth-token")) {
        fetch(`${API_URL}/addtocart`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId }),
        })
          .then((response) => response.json())
          .then((data) => console.log("Add to cart:", data))
          .catch((error) => console.error("Add to cart error:", error));
      }

      return updated;
    });

    // ✅ Decrease stock in products (Services with stock 9999 will also be mapped, but stock remains high)
    setAll_Product((prevProducts) =>
      prevProducts.map((product) =>
        product.id === itemId && product.stock > 0
          ? { ...product, stock: product.stock - 1 }
          : product
      )
    );
  };

  // ✅ Remove from cart and restore stock
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      // Use (prev[itemId] || 0) to ensure we get 0 for new service IDs not yet in the map
      const currentQuantity = prev[itemId] || 0; 
      const updated = { ...prev, [itemId]: Math.max(currentQuantity - 1, 0) };

      if (localStorage.getItem("auth-token")) {
        fetch(`${API_URL}/removefromcart`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "auth-token": localStorage.getItem("auth-token"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId }),
        })
          .then((response) => response.json())
          .then((data) => console.log("Remove from cart:", data))
          .catch((error) => console.error("Remove from cart error:", error));
      }

      return updated;
    });

    // ✅ Restore stock when removing
    setAll_Product((prevProducts) =>
      prevProducts.map((product) =>
        product.id === itemId
          ? { ...product, stock: product.stock + 1 }
          : product
      )
    );
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    // Iterate over the cart items (IDs)
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        // Find the item info in the combined all_product array (including services)
        const itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let TotalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        TotalItem += cartItems[item];
      }
    }
    return TotalItem;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product, // Now includes both products and services
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
