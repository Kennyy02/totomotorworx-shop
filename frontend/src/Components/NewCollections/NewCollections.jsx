import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import { Link } from 'react-router-dom';

const NewCollections = () => {
  const [newCollection, setNewCollection] = useState([]);

  useEffect(() => {
    fetch('https://totomotorworx-shop-production.up.railway.app/newcollections')
      .then((res) => res.json())
      .then((data) => setNewCollection(data))
      .catch((err) => console.error('Error fetching collections:', err));
  }, []);

  return (
    <div className="new-collections">
      <h1>New Collections</h1>
      <hr />
      <div className="carousel">
        {newCollection.map((item, i) => (
          <Link
            to={`/product/${item.id}`}
            className="carousel-item"
            key={item.id}
            style={{ '--i': i, '--total': newCollection.length }}
            onClick={() => window.scrollTo(0, 0)}
          >
            <img src={item.image} alt={item.name} />
            <div className="carousel-item-overlay">
              <h3>{item.name}</h3>
              <div className="carousel-item-prices">
                <span className="new-price">₱{item.new_price}</span>
                <span className="old-price">₱{item.old_price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewCollections;