import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// NOTE: Core customer/auth pages are imported statically to avoid intermittent
// dynamic-import chunk loading issues that can cause stale screens until refresh.
import HomePage from '../features/customer/home/HomePage';
import ProductsPage from '../features/customer/products/ProductsPage';
import ProductDetailPage from '../features/customer/products/ProductDetailPage';
import CartPage from '../features/customer/cart/CartPage';
import CheckoutPage from '../features/customer/checkout/CheckoutPage';
import OrdersPage from '../features/customer/orders/OrdersPage';
import OrderDetailPage from '../features/customer/orders/OrderDetailPage';
import ProfilePage from '../features/customer/profile/ProfilePage';
import BlogPage from '../features/customer/blog/BlogPage';
import ContactPage from '../features/customer/contact/ContactPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

const AdminDashboard = lazy(() => import('../features/admin/dashboard/DashboardPage'));
const AdminProducts = lazy(() => import('../features/admin/products/ProductsPage'));
const AdminProductForm = lazy(() => import('../features/admin/products/ProductFormPage'));
const AdminOrders = lazy(() => import('../features/admin/orders/OrdersPage'));
const AdminOrderDetail = lazy(() => import('../features/admin/orders/OrderDetailPage'));
const AdminUsers = lazy(() => import('../features/admin/users/UsersPage'));
const AdminUserForm = lazy(() => import('../features/admin/users/UserFormPage'));
const AdminPromotions = lazy(() => import('../features/admin/promotions/PromotionsPage'));

function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/product/detail/:id" element={<ProductDetailPage />} />
        <Route path="/collections/all" element={<ProductsPage />} />
        <Route path="/bo-hoa-tuoi" element={<ProductsPage />} />
        <Route path="/ke-hoa-chuc-mung-khai-truong" element={<ProductsPage />} />
        <Route path="/hoa-cuoi" element={<ProductsPage />} />
        <Route path="/hoa-sap" element={<ProductsPage />} />
        <Route path="/tin-tuc" element={<BlogPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account/register" element={<RegisterPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/edit/:id" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/edit/:id" element={<AdminUserForm />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
