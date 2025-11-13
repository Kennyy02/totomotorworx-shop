import React, { useContext } from "react";
import "./CSS/HomeCategory.css";
import { HomeContext } from "../Context/HomeContext";
import Item from "../Components/Item/Item";

const AllProducts = (props) => {
  const { all_product } = useContext(HomeContext);

  // Filter out services, show only physical products
  const physicalProducts = all_product.filter((item) => {
    return item.category && item.category.toLowerCase() !== 'service';
  });

  console.log("🔍 AllProducts Debug:", {
    totalProducts: all_product.length,
    physicalProducts: physicalProducts.length,
    categories: [...new Set(all_product.map(p => p.category))]
  });

  return (
    <div className="home-category">
      <img
        className="homecategory-banner"
        src={props.banner}
        alt="All Products"
      />

      <div className="homecategory-products">
        <div className="services-header">
          <h1>All Products</h1>
          <p>
            Browse our complete collection of motorcycle parts and accessories.
            Use the dropdown menu above to filter by specific categories.
          </p>
        </div>

        {physicalProducts.length === 0 ? (
          <div className="no-products" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#888',
            fontSize: '18px'
          }}>
            <h2>No products available</h2>
            <p>Please check back later for new inventory.</p>
          </div>
        ) : (
          physicalProducts.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllProducts;