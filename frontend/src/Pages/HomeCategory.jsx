import React, { useContext } from "react";
import "./CSS/HomeCategory.css";
import { HomeContext } from "../Context/HomeContext";
import Item from "../Components/Item/Item";

const HomeCategory = (props) => {
  const { all_product } = useContext(HomeContext);

  // ✅ Normalize category for flexible matching
  const normalizeCategory = (category) => {
    if (!category) return '';
    return category.toLowerCase().trim().replace(/\s+/g, '-');
  };

  const propsCategory = normalizeCategory(props.category);

  // ✅ Filter products with normalized comparison
  const filteredProducts = all_product.filter((item) => {
    const itemCategory = normalizeCategory(item.category);
    return itemCategory === propsCategory;
  });

  console.log("🔍 HomeCategory Debug:", {
    propsCategory,
    filteredCount: filteredProducts.length,
    allProducts: all_product.length,
    availableCategories: [...new Set(all_product.map(p => p.category))],
    sampleProduct: all_product[0]
  });

  return (
    <div className="home-category">
      {/* Only show banner if it exists AND is passed as a prop */}
      {props.banner && (
        <img
          className="homecategory-banner"
          src={props.banner}
          alt={props.category}
        />
      )}

      <div className="homecategory-products">
        {/* Add header for services page */}
        {propsCategory === "service" && (
          <div className="services-header">
            <h1>Our Services</h1>
            <p>
              We provide routine checks and replacements to keep your motorcycle
              in top condition. Add services to your cart and book an appointment!
            </p>
          </div>
        )}

        {/* Display message if no products found */}
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <h2>No products found in "{props.category}" category</h2>
            <p>Please check back later or browse other categories.</p>
          </div>
        )}

        {/* Display products or services (both use same Item component) */}
        {filteredProducts.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeCategory;