import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = lazy(() => import('../features/customer/home/HomePage'));
const ProductsPage = lazy(() => import('../features/customer/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('../features/customer/products/ProductDetailPage'));
const CartPage = lazy(() => import('../features/customer/cart/CartPage'));
const CheckoutPage = lazy(() => import('../features/customer/checkout/CheckoutPage'));
const OrdersPage = lazy(() => import('../features/customer/orders/OrdersPage'));
const ProfilePage = lazy(() => import('../features/customer/profile/ProfilePage'));
const BlogPage = lazy(() => import('../features/customer/blog/BlogPage'));
const ContactPage = lazy(() => import('../features/customer/contact/ContactPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));

const AdminDashboard = lazy(() => import('../features/admin/dashboard/DashboardPage'));
const AdminProducts = lazy(() => import('../features/admin/products/ProductsPage'));
const AdminProductForm = lazy(() => import('../features/admin/products/ProductFormPage'));
const AdminOrders = lazy(() => import('../features/admin/orders/OrdersPage'));
const AdminUsers = lazy(() => import('../features/admin/users/UsersPage'));
const AdminPromotions = lazy(() => import('../features/admin/promotions/PromotionsPage'));

function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
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
                <Route path="users" element={<AdminUsers />} />
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
