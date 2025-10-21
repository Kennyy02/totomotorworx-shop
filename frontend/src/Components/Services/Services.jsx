// File: Services.jsx

import React, { useContext } from "react"; // ⬅️ IMPORT useContext
import "./Services.css";
import { Wrench, Droplet, Filter, CircleDot, ShoppingCart } from "lucide-react"; // ⬅️ IMPORT ShoppingCart
import { HomeContext } from "../../Context/HomeContext"; // ⬅️ IMPORT HomeContext

const servicesList = [
  // 💡 CRITICAL: Add id and price to match the cart logic in HomeContext
  {
    id: 9001, // ⬅️ Assign a unique, high ID to avoid collision with 'all_product'
    icon: <Droplet size={40} />,
    title: "Oil Change Service",
    desc: "Keep your engine running smooth with premium oil service.",
    new_price: 35.00, // ⬅️ Use 'new_price' to align with HomeContext
  },
  {
    id: 9002,
    icon: <Filter size={40} />,
    title: "Air Filter Replacement Service",
    desc: "Boost fuel efficiency and extend engine life.",
    new_price: 15.00,
  },
  {
    id: 9003,
    icon: <Wrench size={40} />,
    title: "Chain Maintenance Service",
    desc: "Stay safe with professional chain cleaning & adjustments.",
    new_price: 20.00,
  },
  {
    id: 9004,
    icon: <CircleDot size={40} />,
    title: "Tire Replacement Service",
    desc: "Better grip and safety with high-quality tires.",
    new_price: 50.00,
  },
];

const Services = () => {
  // ⬅️ ACCESS addToCart from context
  const { addToCart } = useContext(HomeContext); 

  return (
    <section className="services">
      <div className="services-header">
        <h1>Our Services</h1>
        <p>
          We provide professional motorcycle care with reliable parts, skilled
          hands, and modern tools.
        </p>
      </div>
      <div className="services-grid">
        {servicesList.map((service) => (
          // Use 'service.id' as the key
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            
            {/* Display Price */}
            <p className="service-price">
              Price: ₱{service.new_price.toFixed(2)}
            </p>
            
            {/* ⬅️ Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={() => addToCart(service.id)} // Pass the service's ID
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
