import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Home from './Pages/Home';
import HomeCategory from './Pages/HomeCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import new_banner from './Components/Assets/banner.png'
import tire_banner from './Components/Assets/tire_banner.png'
import grip_banner from './Components/Assets/grip_banner.jpg'
import helmet_banner from './Components/Assets/helmet_banner.jpg'
import motor_oil from './Components/Assets/motor_oil_banner.jpg'
import spray_paint from './Components/Assets/spray_paint.jpg'
import services from './Components/Assets/service_banner.jpeg'
import cable_banner from './Components/Assets/cable.png'

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/products' element={<HomeCategory banner={new_banner} category="product"/>}/>
        <Route path='/products/tires' element={<HomeCategory banner={tire_banner} category="tires"/>}/>
        <Route path='/products/grip' element={<HomeCategory banner={grip_banner} category="grip"/>}/>
        <Route path='/products/motor-oil' element={<HomeCategory banner={motor_oil} category="motor-oil"/>}/>
        <Route path='/products/helmet' element={<HomeCategory banner={helmet_banner} category="helmet"/>}/>
        <Route path='/products/spray-paint' element={<HomeCategory banner={spray_paint} category="spray-paint"/>}/>
        <Route path='/products/cable' element={<HomeCategory banner={cable_banner} category="cable"/>}/>
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
