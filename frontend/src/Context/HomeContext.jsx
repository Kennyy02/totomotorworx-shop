import React, { createContext, useEffect, useState } from "react";

export const HomeContext = createContext(null);

// ✅ Dynamic API base URL for both local and Railway
const API_URL = process.env.REACT_APP_BACKEND_URL;

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const HomeContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  // HomeContext.jsx

  useEffect(() => {
    // ✅ Fetch products from backend
    fetch(`${API_URL}/products`)
      .then((response) => response.json())
      .then((data) => { // <-- NOTE: Start of the .then() function body
        // 💡 CRITICAL: Check if the data is an array before setting state
        if (Array.isArray(data)) {
            setAll_Product(data);
        } else {
            console.error("Backend returned non-array data for products:", data);
            setAll_Product([]); // Fallback to empty array to prevent .map crash
        }
      }) // <-- End of the .then() function body
      .catch((err) => {
        console.error("Error fetching products:", err);
        setAll_Product([]); // Set to empty array on network/server error
      });

    // ✅ Fetch user cart if logged in
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
  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: prev[itemId] + 1 };

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

    // ✅ Decrease stock in products
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
      const updated = { ...prev, [itemId]: Math.max(prev[itemId] - 1, 0) };

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
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
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
