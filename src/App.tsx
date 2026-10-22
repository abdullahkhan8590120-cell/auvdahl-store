
import { Routes, Route } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Account from './pages/Account'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import ComingSoon from './pages/ComingSoon'
import AdminDashboard from './admin/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="forgot-password" element={<Auth mode="forgot" />} />
        <Route path="reset-password" element={<Auth mode="reset" />} />
        <Route path="account" element={<Account />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="order/:id" element={<OrderDetail />} />
        {/* Phase 5+: real Shop, Product, Cart, Checkout pages replace this */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}

