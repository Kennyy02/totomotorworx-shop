import React, { useRef } from 'react';
import Hero from '../Components/Hero/Hero';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import NewsLetter from '../Components/NewsLetter/NewsLetter';

const Home = () => {
  const collectionsRef = useRef(null);

  const scrollToCollections = () => {
    if (collectionsRef.current) {
      collectionsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Pass scroll function to Hero */}
      <Hero scrollToCollections={scrollToCollections} />
      <Offers />

      {/* Attach ref to NewCollections */}
      <div ref={collectionsRef}>
        <NewCollections />
      </div>

      <NewsLetter />
    </div>
  );
};

export default Home;
