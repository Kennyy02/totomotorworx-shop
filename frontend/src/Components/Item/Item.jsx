import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';

const Item = (props) => {
  return (
    <div className='item'>
      {/* Corrected onClick handler to be an arrow function */}
      {/* Added alt tag for accessibility based on the product name */}
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          ₱{props.new_price}
        </div>
        {/* Only display the old price if it's different from the new price */}
        {props.old_price && props.old_price !== props.new_price && (
          <div className="item-price-old">
            ₱{props.old_price}
          </div>
        )}
      </div>
    </div>
  );
};

export default Item;