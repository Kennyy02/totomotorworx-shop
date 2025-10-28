import React, { useContext } from "react";
import "./CSS/HomeCategory.css";
import { HomeContext } from "../Context/HomeContext";
import Item from "../Components/Item/Item";

const HomeCategory = (props) => {
  const { all_product } = useContext(HomeContext);

  return (
    <div className="home-category">
      <img
        className="homecategory-banner"
        src={props.banner}
        alt={props.category}
      />

      <div className="homecategory-products">
        {/* Add header for services page */}
        {props.category === "service" && (
          <div className="services-header">
            <h1>Our Services</h1>
            <p>
              We provide routine checks and replacements to keep your motorcycle
              in top condition. Add services to your cart and book an appointment!
            </p>
          </div>
        )}

        {/* Display products or services (both use same Item component) */}
        {all_product.map((item, i) => {
          if (props.category === item.category) {
            return (
              <Item
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default HomeCategory;