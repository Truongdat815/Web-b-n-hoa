import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Search
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useState } from 'react';
import '../assets/css/admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { path: '/admin/dashboard', icon: 'fa-home', label: 'Dashboard' },
    { path: '/admin/products', icon: 'fa-box', label: 'Sản phẩm' },
    { path: '/admin/orders', icon: 'fa-shopping-cart', label: 'Đơn hàng' },
    { path: '/admin/users', icon: 'fa-users', label: 'Tài khoản' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="admin-page">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="logo">
            <Link to="/admin/dashboard">
              <h1>FIAMA</h1>
              <span className="admin-badge">ADMIN</span>
            </Link>
          </div>
          <div className="admin-user-info">
            <div className="user-dropdown">
              <a href="#" className="user-link" onClick={(e) => e.preventDefault()}>
                <i className="fas fa-user-shield"></i>
                <span>{user?.email || user?.full_name || 'Admin'}</span>
              </a>
              <div className="dropdown-menu">
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Đăng xuất</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="sidebar-header">
              <h2><i className="fas fa-shield-alt"></i> Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <i className={`fas ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="admin-content">
            {children}
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="admin-footer">
        <div className="admin-footer-content">
          <p>&copy; 2025 FIAMA Admin Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
