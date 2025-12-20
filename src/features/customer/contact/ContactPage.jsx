import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import '../../../assets/css/home.css';
import '../../../assets/css/contact.css';

const ContactPage = () => {
  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <CustomerLayout>
      <div className="contact-page">
        <div className="contact-container">
          {/* Page Header */}
          <div className="contact-header">
            <h1 className="contact-title">Liên Hệ</h1>
            <p className="contact-subtitle">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các thông tin dưới đây.
            </p>
            <div className="contact-breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span className="separator">&gt;</span>
              <span className="current">Liên hệ</span>
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="contact-info-grid">
            {/* Address */}
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3 className="contact-info-heading">Địa chỉ</h3>
              <div className="contact-info-text">
                <div>Hồ Gươm, Hoàn Kiếm</div>
                <div>Hà Nội, Việt Nam</div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3 className="contact-info-heading">Số điện thoại</h3>
              <div className="contact-info-text">
                <div><a href="tel:+84901234567">+84 901 234 567</a></div>
                <div><a href="tel:+84987654321">+84 987 654 321</a></div>
              </div>
            </div>

            {/* Email */}
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3 className="contact-info-heading">Email</h3>
              <div className="contact-info-text">
                <div><a href="mailto:info@fiama.com">info@fiama.com</a></div>
                <div><a href="mailto:support@fiama.com">support@fiama.com</a></div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="contact-info-heading">Giờ làm việc</h3>
              <div className="contact-info-text">
                <div>T2 - CN: 8:00 - 20:00</div>
                <div>Thứ 7: 9:00 - 18:00</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="contact-features-section">
            <div className="contact-feature-item">
              <div className="contact-feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h4 className="contact-feature-title">Giao hàng nhanh chóng</h4>
              <p className="contact-feature-text">Giao hàng toàn quốc trong 24-48 giờ</p>
            </div>
            <div className="contact-feature-item">
              <div className="contact-feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="contact-feature-title">Bảo đảm chất lượng</h4>
              <p className="contact-feature-text">Hoa tươi 100% với chất lượng đảm bảo</p>
            </div>
            <div className="contact-feature-item">
              <div className="contact-feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h4 className="contact-feature-title">Hỗ trợ 24/7</h4>
              <p className="contact-feature-text">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn</p>
            </div>
            <div className="contact-feature-item">
              <div className="contact-feature-icon">
                <i className="fas fa-gift"></i>
              </div>
              <h4 className="contact-feature-title">Đóng gói tinh tế</h4>
              <p className="contact-feature-text">Thiết kế đóng gói đẹp mắt, tinh tế</p>
            </div>
          </div>

          {/* Map Section with Info Overlay */}
          <div className="contact-map-section">
            <div className="contact-map-header">
              <h2 className="contact-map-title">Tìm chúng tôi</h2>
              <p className="contact-map-subtitle">Đến thăm cửa hàng của chúng tôi tại Hồ Gươm, Hà Nội</p>
            </div>
            <div className="contact-map-wrapper">
              <div className="contact-map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0966092835137!2d105.85194131526071!3d21.02851189315365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abeb6e4832fd%3A0x6b2d5b8b8c8c8c8c!2zSOG7kyBUaOG6pXUgR8OybiwgSG_DoG4gS2nhu4dtLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1735574400000!5m2!1svi!2s"
                  width="100%"
                  height="700"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hồ Gươm, Hoàn Kiếm, Hà Nội"
                ></iframe>
              </div>
              <div className="contact-map-info-card">
                <div className="contact-map-info-header">
                  <div className="contact-map-info-icon">
                    <i className="fas fa-store"></i>
                  </div>
                  <div>
                    <h3 className="contact-map-info-title">FIAMA Store</h3>
                    <div className="contact-map-info-rating">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <span>5.0 (128 đánh giá)</span>
                    </div>
                  </div>
                </div>
                <div className="contact-map-info-content">
                  <div className="contact-map-info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>Địa chỉ:</strong>
                      <p>Hồ Gươm, Hoàn Kiếm, Hà Nội, Việt Nam</p>
                    </div>
                  </div>
                  <div className="contact-map-info-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <strong>Điện thoại:</strong>
                      <p><a href="tel:+84901234567">+84 901 234 567</a></p>
                    </div>
                  </div>
                  <div className="contact-map-info-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <strong>Giờ mở cửa:</strong>
                      <p>Thứ 2 - Chủ nhật: 8:00 - 20:00</p>
                    </div>
                  </div>
                </div>
                <a href="https://maps.google.com/?q=Hoan+Kiem+Lake,+Hanoi" target="_blank" rel="noopener noreferrer" className="contact-map-direction-btn">
                  <i className="fas fa-directions"></i>
                  Chỉ đường
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ContactPage;
