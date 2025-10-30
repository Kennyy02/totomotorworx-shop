import React, { useContext } from 'react';
import './CSS/ShopCategory.css';
import { HomeContext } from '../Context/HomeContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';
import { useParams } from 'react-router-dom';

const ShopCategory = (props) => {
  const { all_product } = useContext(HomeContext);
  const { category } = useParams(); // Get category from URL parameter

  // ✅ FIXED: Case-insensitive category matching with space handling
  // This ensures "motor oil" in URL matches "Motor Oil" in database
  // And "grips" matches "Grips", etc.
  const filteredProducts = all_product.filter((item) => {
    if (!category) return true; // Show all if no category
    
    // Normalize both category strings: lowercase and handle spaces
    const urlCategory = decodeURIComponent(category).toLowerCase().trim();
    const productCategory = item.category.toLowerCase().trim();
    
    return productCategory === urlCategory;
  });

  return (
    <div className='shop-category'>
      {/* Banner - Optional: You can customize based on category */}
      {props.banner && <img className='shopcategory-banner' src={props.banner} alt="" />}
      
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing {filteredProducts.length}</span> out of {all_product.length} products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {filteredProducts.length === 0 ? (
          <div className="no-products-message">
            <h2>No products found in this category</h2>
            <p>Please check back later or browse other categories.</p>
          </div>
        ) : (
          filteredProducts.map((item, i) => (
            <Item 
              key={i} 
              id={item.id} 
              name={item.name} 
              image={item.image} 
              new_price={item.new_price} 
              old_price={item.old_price}
            />
          ))
        )}
      </div>

      {/* Load More Button - Optional */}
      {filteredProducts.length > 12 && (
        <div className="shopcategory-loadmore">
          Explore More
        </div>
      )}
    </div>
  );
}

export default ShopCategory;