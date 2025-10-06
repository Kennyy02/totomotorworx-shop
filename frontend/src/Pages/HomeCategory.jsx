import React, { useContext } from "react";
import "./CSS/HomeCategory.css";
import { HomeContext } from "../Context/HomeContext";
import Item from "../Components/Item/Item";

// Import service images (from public or src)
import oil_change from "../Components/Assets/oil.jpg";
import filter_img from "../Components/Assets/filter.jpg";
import chain_img from "../Components/Assets/chain.jpg";
import tire_img from "../Components/Assets/tire1.jpg";

const servicesList = [
  {
    title: "Oil Change",
    desc: "Keep your engine running smooth with premium oil service.",
    img: oil_change,
  },
  {
    title: "Air Filter Replacement",
    desc: "Boost fuel efficiency and extend engine life.",
    img: filter_img,
  },
  {
    title: "Chain Maintenance",
    desc: "Stay safe with professional chain cleaning & adjustments.",
    img: chain_img,
  },
  {
    title: "Tire Replacement",
    desc: "Better grip and safety with high-quality tires.",
    img: tire_img,
  },
];

const HomeCategory = (props) => {
  const { all_product } = useContext(HomeContext);

  return (
    <div className="home-category">
      <img
        className="homecategory-banner"
        src={props.banner}
        alt={props.category}
      />

      {/* If category is "service", show services instead of products */}
      {props.category === "service" ? (
        <div className="services">
          <h1>Our Services</h1>
          <p>
            We provide routine checks and replacements to keep your motorcycle
            in top condition:
          </p>

          <div className="services-grid">
            {servicesList.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-image">
                  <img src={service.img} alt={service.title} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="homecategory-products">
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
      )}
    </div>
  );
};

export default HomeCategory;
