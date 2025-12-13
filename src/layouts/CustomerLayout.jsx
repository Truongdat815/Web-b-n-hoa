import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, Phone, MapPin, Menu, X, Facebook, Instagram, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useState } from 'react';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setAccountDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <div className="customer-layout">
      {/* Header */}
      <header className="main-header">
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <div className="header-left">
                <a href="tel:0859336677" className="hotline-link">
                  Gọi mua hàng <strong>0859336677</strong>
                </a>
              </div>
              <div className="header-right">
                <div className="account-menu" onMouseEnter={() => setAccountDropdownOpen(true)} onMouseLeave={() => setAccountDropdownOpen(false)}>
                  <div className="account-trigger">
                    <User size={18} />
                    <span>Thông tin Tài khoản</span>
                  </div>
                  {accountDropdownOpen && (
                    <div className="account-dropdown">
                      {!isAuthenticated ? (
                        <>
                          <Link to="/login" onClick={() => setAccountDropdownOpen(false)}>Đăng nhập</Link>
                          <Link to="/register" onClick={() => setAccountDropdownOpen(false)}>Đăng ký</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" onClick={() => setAccountDropdownOpen(false)}>Thông tin tài khoản</Link>
                          <button onClick={handleLogout}>Đăng xuất</button>
                        </>
                      )}
                      <Link to="/wishlist" onClick={() => setAccountDropdownOpen(false)} className="wishlist-link">
                        <Heart size={14} /> Danh sách yêu thích (0)
                      </Link>
                    </div>
                  )}
                </div>
                <Link to="/cart" className="cart-link">
                  <ShoppingCart size={18} />
                  <span>Giỏ hàng</span>
                  {totalQuantity > 0 && <span className="cart-badge">{totalQuantity}</span>}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="header-main">
          <div className="container">
            <div className="header-main-content">
              <Link to="/" className="logo">
                <h1>Góc Hoa Xinh</h1>
              </Link>
              
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <Search size={20} />
                </button>
              </form>

              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="main-nav">
          <div className="container">
            <ul className="nav-menu">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/products">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=bo-hoa">Bó Hoa Tươi</Link></li>
              <li className="has-dropdown">
                <span>Kệ Hoa chúc mừng <span className="dropdown-arrow">▼</span></span>
                <ul className="submenu">
                  <li><Link to="/products?category=khai-truong">Kệ chúc mừng</Link></li>
                  <li><Link to="/products?category=chuc-mung">Giỏ hoa chúc mừng</Link></li>
                </ul>
              </li>
              <li><Link to="/products?category=hoa-cuoi">Hoa Cưới</Link></li>
              <li><Link to="/products?category=hoa-sap">Hoa Sáp</Link></li>
              <li><Link to="/blog">Tin Tức</Link></li>
              <li><Link to="/contact">Liên Hệ</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <h2>Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="mobile-nav">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Tất cả sản phẩm</Link>
              <Link to="/products?category=bo-hoa" onClick={() => setMobileMenuOpen(false)}>Bó Hoa Tươi</Link>
              <Link to="/products?category=khai-truong" onClick={() => setMobileMenuOpen(false)}>Kệ Hoa chúc mừng</Link>
              <Link to="/products?category=hoa-cuoi" onClick={() => setMobileMenuOpen(false)}>Hoa Cưới</Link>
              <Link to="/products?category=hoa-sap" onClick={() => setMobileMenuOpen(false)}>Hoa Sáp</Link>
              <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Tin Tức</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Liên Hệ</Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h4>Menu</h4>
              <ul>
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/products">Tất cả sản phẩm</Link></li>
                <li><Link to="/products?category=bo-hoa">Bó Hoa Tươi</Link></li>
                <li><Link to="/products?category=khai-truong">Kệ Hoa chúc mừng</Link></li>
                <li><Link to="/products?category=hoa-cuoi">Hoa Cưới</Link></li>
                <li><Link to="/products?category=hoa-sap">Hoa Sáp</Link></li>
                <li><Link to="/blog">Tin Tức</Link></li>
                <li><Link to="/contact">Liên Hệ</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Chính sách</h4>
              <ul>
                <li><Link to="/policy/payment">Hình Thức Thanh Toán</Link></li>
                <li><Link to="/policy/shipping">Chính sách giao hàng</Link></li>
                <li><Link to="/policy/privacy">Chính sách bảo mật thông tin</Link></li>
                <li><Link to="/policy/warranty">Chính sách bảo hành</Link></li>
                <li><Link to="/policy/terms">Điều khoản sử dụng</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Fanpage</h4>
              <div className="social-links">
                <a href="https://facebook.com/gochoaxinh" target="_blank" rel="noopener noreferrer">
                  <Facebook size={20} /> Góc Hoa Xinh
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Liên Hệ</h4>
              <ul className="contact-info">
                <li>
                  <MapPin size={16} />
                  <span>114 Dương Quang Đông, Phường 5, Quận 8 (Online)</span>
                </li>
                <li>
                  <Phone size={16} />
                  <a href="tel:0859336677">0859336677</a>
                </li>
                <li>
                  <span>Email:</span>
                  <a href="mailto:gochoaxinh@gmail.com">gochoaxinh@gmail.com</a>
                </li>
                <li>
                  <strong>Hotline:</strong> 0862775939
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© Bản quyền thuộc về <strong>Góc Hoa Xinh</strong> | Cung cấp bởi Sapo</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
