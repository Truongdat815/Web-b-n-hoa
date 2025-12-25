import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import BlogPage from '../features/customer/blog/BlogPage';
import BlogDetailPage from '../features/customer/blog/BlogDetailPage';
import ContactPage from '../features/customer/contact/ContactPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// Lazy load ProfilePage to ensure it only loads when needed
const ProfilePage = lazy(() => import('../features/customer/profile/ProfilePage'));

// Admin pages - import statically to avoid module loading errors
import AdminDashboard from '../features/admin/dashboard/DashboardPage';
import AdminProducts from '../features/admin/products/ProductsPage';
import AdminProductForm from '../features/admin/products/ProductFormPage';
import AdminOrders from '../features/admin/orders/OrdersPage';
import AdminOrderDetail from '../features/admin/orders/OrderDetailPage';
import AdminUsers from '../features/admin/users/UsersPage';
import AdminUserForm from '../features/admin/users/UserFormPage';
import AdminPromotions from '../features/admin/promotions/PromotionsPage';
import AdminPromotionForm from '../features/admin/promotions/PromotionFormPage';
import AdminFeedbacks from '../features/admin/feedbacks/FeedbacksPage';

// Wrapper component to ensure ProfilePage only renders on /profile route
const ProfilePageWrapper = () => {
  const location = useLocation();
  
  // Only render ProfilePage if we're actually on /profile route
  // Use useMemo to prevent unnecessary re-renders
  const shouldRender = location.pathname === '/profile';
  
  if (!shouldRender) {
    return null;
  }
  
  // Use Suspense for lazy loading - only load when actually on /profile route
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePage key="profile-page" />
    </Suspense>
  );
};

function AppRouter() {
  const location = useLocation();
  
  // Force Routes to re-render when location changes
  // This ensures all route components properly unmount/remount on navigation
  return (
      <Routes key={location.pathname}>
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
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/tin-tuc/:id" element={<BlogDetailPage />} />
        <Route path="/lien-he" element={<ContactPage key={`contact-${location.pathname}`} />} />
        <Route path="/contact" element={<ContactPage key={`contact-${location.pathname}`} />} />
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
              <ProfilePageWrapper key={`profile-wrapper-${location.pathname}`} />
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
                <Route path="promotions/new" element={<AdminPromotionForm />} />
                <Route path="promotions/edit/:id" element={<AdminPromotionForm />} />
                <Route path="feedbacks" element={<AdminFeedbacks />} />
                <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default AppRouter;
