import React from "react";
import "./Services.css";
import { Wrench, Droplet, Filter, CircleDot } from "lucide-react";

const servicesList = [
  {
    icon: <Droplet size={40} />,
    title: "Oil Change",
    desc: "Keep your engine running smooth with premium oil service.",
  },
  {
    icon: <Filter size={40} />,
    title: "Air Filter Replacement",
    desc: "Boost fuel efficiency and extend engine life.",
  },
  {
    icon: <Wrench size={40} />,
    title: "Chain Maintenance",
    desc: "Stay safe with professional chain cleaning & adjustments.",
  },
  {
    icon: <CircleDot size={40} />,
    title: "Tire Replacement",
    desc: "Better grip and safety with high-quality tires.",
  },
];

const Services = () => {
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
        {servicesList.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
