import React, { useContext } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { HomeContext } from '../../Context/HomeContext'

const RelatedProducts = ({ currentProduct }) => {
  const { all_product } = useContext(HomeContext);

  // Filter products by same category, exclude current product, limit to 4
  const relatedProducts = all_product
    .filter((item) => {
      // Same category but different product
      return item.category === currentProduct?.category && 
             item.id !== currentProduct?.id;
    })
    .slice(0, 4); // Show only 4 related products

  // If no related products, show random products (excluding current)
  const displayProducts = relatedProducts.length > 0 
    ? relatedProducts 
    : all_product
        .filter(item => item.id !== currentProduct?.id)
        .slice(0, 4);

  return (
    <div className='relatedproducts'>
       <h1>Related Products</h1>
       <hr />
       <div className="relatedproducts-item">
          {displayProducts.length > 0 ? (
            displayProducts.map((item) => (
              <Item 
                key={item.id} 
                id={item.id} 
                name={item.name} 
                image={item.image} 
                new_price={item.new_price} 
                old_price={item.old_price}
              />
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%', padding: '40px' }}>
              No related products available
            </p>
          )}
       </div>
    </div>
  )
}

export default RelatedProducts