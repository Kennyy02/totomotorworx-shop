import React, { useContext } from "react";
import "./Services.css";
// 💡 Import Link for routing
import { Link } from 'react-router-dom'; 
import { Wrench, Droplet, Filter, CircleDot, ShoppingCart } from "lucide-react"; 
import { HomeContext } from "../../Context/HomeContext";

// NOTE: Ensure this list exactly matches the servicesList in HomeContext.jsx
const servicesList = [
  {
    id: 9001, 
    icon: <Droplet size={40} />,
    title: "Oil Change Service", // Use "Service" suffix to distinguish from products
    desc: "Keep your engine running smooth with premium oil service.",
    new_price: 35.00,
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
          // 💡 Wrap the service card in a Link component
          // The 'to' path matches the product route structure: /product/:productId
          <Link 
            key={service.id} 
            to={`/product/${service.id}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              
              <p className="service-price">
                Price: ₱{service.new_price.toFixed(2)}
              </p>
              
              {/* Optional: Add to Cart button can remain, or be moved to the detail page */}
              <button
                className="add-to-cart-btn"
                // Stop the link navigation when button is clicked
                onClick={(e) => {
                    e.preventDefault(); 
                    addToCart(service.id);
                }} 
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Services;
