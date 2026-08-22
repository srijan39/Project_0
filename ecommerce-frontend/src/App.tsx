import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Mens from "./pages/Mens"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Womens from "./pages/Womens"
import Kids from "./pages/Kids"
import Products from "./pages/Products"
import Cart from "./pages/Cart"
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Wishlist from "./pages/Wishlist";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/men" element={<Mens />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/women" element={<Womens />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
