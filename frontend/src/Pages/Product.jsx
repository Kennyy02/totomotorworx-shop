import React, { useContext } from 'react'
import { HomeContext } from '../Context/HomeContext'
import { useParams } from 'react-router-dom';
import Breadcrum from '../Components/Breadcrums/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const { all_product } = useContext(HomeContext);
  const { productId } = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  // Show loading state while products are being fetched
  if (all_product.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        fontSize: '18px',
        color: '#888'
      }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  // Show error if product not found
  if (!product) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        fontSize: '18px',
        color: '#e63946'
      }}>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <a href="/all-products" style={{ 
          color: '#2a9d8f', 
          textDecoration: 'underline',
          marginTop: '20px',
          display: 'inline-block'
        }}>
          ← Back to All Products
        </a>
      </div>
    );
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <RelatedProducts currentProduct={product} />
    </div>
  )
}

export default Product