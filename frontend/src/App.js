import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import HomeCategory from './Pages/HomeCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import DynamicCategory from './Pages/DynamicCategory'; // ✅ NEW
import new_banner from './Components/Assets/banner.png'
import services from './Components/Assets/service_banner.jpeg'

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/products' element={<HomeCategory banner={new_banner} category="product"/>}/>
          
          {/* ✅ Dynamic route handles ALL product categories automatically */}
          <Route path='/products/:category' element={<DynamicCategory />}/>
          
          <Route path='/services' element={<HomeCategory banner={services} category="service"/>}/>
          <Route path='/abouts' element={<HomeCategory banner={new_banner} category="about"/>}/>
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