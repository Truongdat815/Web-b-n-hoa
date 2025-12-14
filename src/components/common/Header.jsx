import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState, useEffect } from 'react';
import '../../assets/css/home.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Update cart count
  useEffect(() => {
    const updateCartCount = async () => {
      try {
        const response = await fetch('/cart/api/count');
        if (response.ok) {
          const data = await response.json();
          setCartCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };
    updateCartCount();
    const interval = setInterval(updateCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const userDisplayName = user?.name || user?.username || 'User';
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
        <Link to="/product" className={isActive('/product') ? 'active' : ''}>
          Sản phẩm
        </Link>
        {!isAdmin && (
          <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
            Liên hệ
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
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
            <a href="#" className="user-link">
              <i className="fas fa-user"></i>
              <span>{userDisplayName}</span>
            </a>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/account">Tài khoản</Link>
                {isAdmin && <Link to="/admin">Quản lí</Link>}
                <a href="#" onClick={handleLogout}>
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
          <span className="cart-count" id="cartCount">
            {cartCount}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;

