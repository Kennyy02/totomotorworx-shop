import React from 'react';
import { useParams } from 'react-router-dom';
import HomeCategory from './HomeCategory';
import new_banner from '../Components/Assets/banner.png';
import tire_banner from '../Components/Assets/tire_banner.png';
import grip_banner from '../Components/Assets/grip_banner.jpg';
import helmet_banner from '../Components/Assets/helmet_banner.jpg';
import motor_oil from '../Components/Assets/motor_oil_banner.jpg';
import spray_paint from '../Components/Assets/spray_paint.jpg';
import cable_banner from '../Components/Assets/cable.png';

const DynamicCategory = () => {
  const { category } = useParams();
  
  // Map URL categories to their banners
  // Using SINGULAR forms to match database
  const bannerMap = {
    'tires': tire_banner,
    'grips': grip_banner,           // Singular to match DB
    'motor-oil': motor_oil,
    'helmets': helmet_banner,       // Singular to match DB
    'spray-paint': spray_paint,    // Singular to match DB
    'spray-paints': spray_paint, 
    'cable': cable_banner,         // Singular to match DB
    'mirror': new_banner,
    'service': new_banner,
  };

  // Get banner or use default
  const banner = bannerMap[category.toLowerCase()] || new_banner;

  return <HomeCategory banner={banner} category={category} />;
};

export default DynamicCategory;