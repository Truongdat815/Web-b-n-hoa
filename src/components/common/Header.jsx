import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState, useEffect } from 'react';
import { useGetMyCartQuery } from '../../api/cart/cartApi';
import '../../assets/css/home.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data: cartResponse } = useGetMyCartQuery(undefined, { skip: !isAuthenticated });
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // API returns {code, message, data: [...]}
  const cartItems = cartResponse?.data || [];
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const userDisplayName = user?.email || user?.full_name || 'User';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <Link to="/">
          <h1>FIAMA</h1>
        </Link>
      </div>
      <nav className="nav-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>
          Trang chủ
        </Link>
        <Link to="/products" className={isActive('/products') ? 'active' : ''}>
          Sản phẩm
        </Link>
        {!isAdmin && (
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
            Liên hệ
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/dashboard" className={isActive('/admin') ? 'active' : ''}>
            Admin
          </Link>
        )}
      </nav>
      <div className="utility-nav">
        {isAuthenticated ? (
          <div
            className="user-dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <a href="#" className="user-link" onClick={(e) => e.preventDefault()}>
              <i className="fas fa-user"></i>
              <span>{userDisplayName}</span>
            </a>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>Tài khoản</Link>
                {isAdmin && <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}>Quản lí</Link>}
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  Đăng xuất
                </a>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="user-link">
            <i className="fas fa-user"></i>
            <span>Đăng nhập</span>
          </Link>
        )}
        <Link to="/cart" className="cart-icon-wrapper">
          <i className="fas fa-shopping-bag"></i>
          {cartCount > 0 && (
            <span className="cart-count" id="cartCount">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
