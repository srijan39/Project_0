import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Mens from "./pages/Mens"
import Profile from "./pages/Profile"
import Womens from "./pages/Womens"
import Kids from "./pages/Kids"
import Products from "./pages/Products"
import Cart from "./pages/Cart"
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import ScrollToTop from "./components/ScrollToTop";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/men" element={<Mens />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/women" element={<Womens />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
