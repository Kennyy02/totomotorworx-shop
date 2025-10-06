import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
  const [newCollection, setNewCollection] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/newcollections')
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
          <div
            className="carousel-item"
            key={item.id}
            style={{ '--i': i, '--total': newCollection.length }}
          >
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
