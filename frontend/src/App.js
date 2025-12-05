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
import services from './Components/Assets/service_banner.jpeg'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          
          {/* ✅ FIXED: Show ALL products when clicking "Products" */}
          <Route path='/products' element={<AllProducts />}/>
          
          {/* ✅ Dynamic route handles specific categories */}
          <Route path='/products/:category' element={<DynamicCategory />}/>
          
          <Route path='/services' element={<HomeCategory banner={services} category="service"/>}/>
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