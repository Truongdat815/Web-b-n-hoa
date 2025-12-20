import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState, useEffect } from 'react';
import { useGetMyCartQuery } from '../../api/cart/cartApi';
import { useGetMeQuery } from '../../api/auth/authApi';
import '../../assets/css/home.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const { data: cartResponse } = useGetMyCartQuery(undefined, { skip: !isAuthenticated });
  const { data: meResponse } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // API returns {code, message, data: [...]}
  const cartItems = cartResponse?.data || [];
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Get user info from /users/me API
  const userInfo = meResponse?.data || null;

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle body class for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDropdownOpen(false);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/' || location.pathname === '/home';
    if (path === '/product') return location.pathname.startsWith('/products') || location.pathname.startsWith('/product');
    return location.pathname === path;
  };

  // Get last name from full name
  const getLastName = (fullName) => {
    if (!fullName) return '';
    const names = fullName.trim().split(/\s+/);
    return names[names.length - 1] || '';
  };

  // Get display name from API response or fallback
  const userDisplayName = isAuthenticated 
    ? (getLastName(userInfo?.fullName || user?.fullName || user?.full_name) || userInfo?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User')
    : 'Đăng nhập';
  const isAdmin = (userInfo?.roleName || role) === 'ADMIN';

  return (
    <>
      {/* Top Bar */}
      <div className="header-top-bar"></div>
      
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <h1>FIAMA</h1>
          </Link>
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className={`mobile-menu-wrapper ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <Link to="/home" className={isActive('/home') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/product" className={isActive('/product') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              Sản phẩm
            </Link>
            <a 
              href="#footer" 
              className={location.pathname === '/contact' ? 'active' : ''}
              onClick={(e) => { handleContactClick(e); setMobileMenuOpen(false); }}
            >
              Liên hệ
            </a>
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
          <Link to="/cart" className="cart-icon-wrapper" onClick={() => setMobileMenuOpen(false)}>
            <i className="fas fa-shopping-bag"></i>
            <span className="cart-count" id="cartCount">
              {cartCount}
            </span>
          </Link>
        </div>
        </div>
      </header>
    </>
  );
};

export default Header;
