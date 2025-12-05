import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import HomeCategory from './Pages/HomeCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import DynamicCategory from './Pages/DynamicCategory';
import AllProducts from './Pages/AllProducts'; 
import services from './Components/Assets/service_banner.jpeg';
import helmetBanner from "./Components/Assets/helmet_banner.jpg";
import sprayPaintBanner from "./Components/Assets/spray_paint.jpg";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          
          {/* ✅ FIXED: Show ALL products when clicking "Products" - NO BANNER */}
          <Route path='/products' element={<AllProducts />}/>
          
          {/* ✅ Dynamic route handles specific categories */}
          <Route path='/products/:category' element={<DynamicCategory />}/>
          
          {/* ✅ Specific categories WITH banners */}
          <Route path='/services' element={<HomeCategory banner={services} category="service"/>}/>
          <Route path='/helmets' element={<HomeCategory banner={helmetBanner} category="helmets"/>}/>
          <Route path='/spray-paint' element={<HomeCategory banner={sprayPaintBanner} category="spray-paint"/>}/>
          
          <Route path="/product" element={<Product/>}>
            <Route path=':productId' element={<Product/>}/>
          </Route>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/login' element={<LoginSignup/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;