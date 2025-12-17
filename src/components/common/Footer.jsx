import { Link } from 'react-router-dom';
import '../../assets/css/home.css';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        {/* Column 1: Opening Time */}
        <div className="footer-column">
          <h4>Giờ mở cửa</h4>
          <div className="footer-opening-time">
            <div className="opening-time-row">
              <span className="opening-day">Thứ 2 - Thứ 6:</span>
              <span className="opening-hours">8:00 - 22:00</span>
            </div>
            <div className="opening-time-row">
              <span className="opening-day">Thứ 7:</span>
              <span className="opening-hours">9:00 - 20:00</span>
            </div>
            <div className="opening-time-row">
              <span className="opening-day">Chủ nhật:</span>
              <span className="opening-hours">14:00 - 18:00</span>
            </div>
            <p className="footer-holiday">Chúng tôi làm việc cả ngày lễ</p>
          </div>
        </div>

        {/* Column 2: Contact */}
        <div className="footer-column">
          <h4>Liên hệ</h4>
          <div className="footer-contact-info">
            <p>
              <i className="fas fa-map-marker-alt"></i> Thành phố Hồ Chí Minh, Việt Nam
            </p>
            <p>
              <i className="fas fa-phone"></i> +84 123 456 789
            </p>
            <p>
              <i className="fas fa-envelope"></i> info@fiama.com
            </p>
          </div>
        </div>

        {/* Column 3: Central Section with Logo, Social, Apps */}
        <div className="footer-column footer-center-column">
          <div className="footer-logo-center">FIAMA</div>
          <div className="footer-social-icons">
            <a href="#" className="social-icon" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
          <div className="footer-app-buttons">
            <a href="#" className="app-button app-store">
              <i className="fab fa-apple"></i>
              <span>Tải từ APP STORE</span>
            </a>
            <a href="#" className="app-button google-play">
              <i className="fab fa-google-play"></i>
              <span>Tải từ GOOGLE PLAY</span>
            </a>
          </div>
        </div>

        {/* Column 4: My Account */}
        <div className="footer-column">
          <h4>Tài khoản của tôi</h4>
          <ul>
            <li>
              <Link to="/account">Tài khoản của tôi</Link>
            </li>
            <li>
              <Link to="/cart">Giỏ hàng</Link>
            </li>
            <li>
              <Link to="/orders">Lịch sử đơn hàng</Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Customer Service */}
        <div className="footer-column">
          <h4>Dịch vụ khách hàng</h4>
          <ul>
            <li>
              <a href="#">Điều khoản sử dụng</a>
            </li>
            <li>
              <a href="#">Chính sách bảo mật</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

