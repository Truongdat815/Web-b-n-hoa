import { useState, useEffect } from 'react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/home.css';
import '../../../assets/css/login.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      showToast('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  return (
    <CustomerLayout>
      <div style={{ width: '100%' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '60px' }}>
            {/* Contact Information Section */}
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#2c2c2c', marginBottom: '20px' }}>
                Thông Tin Liên Hệ
              </h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px' }}>
                Chúng tôi rất vui được hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các thông tin dưới đây hoặc điền form bên cạnh.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#E95473', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                      Địa chỉ
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      114 Dương Quang Đông, Phường 5, Quận 8, TP.HCM (Online)
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-phone" style={{ color: '#E95473', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                      Điện thoại
                    </h3>
                    <a href="tel:0859336677" style={{ color: '#E95473', fontSize: '16px', fontWeight: '600', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                      0859336677
                    </a>
                    <p style={{ color: '#666', fontSize: '14px' }}>Hotline: 0862775939</p>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-envelope" style={{ color: '#E95473', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                      Email
                    </h3>
                    <a href="mailto:gochoaxinh@gmail.com" style={{ color: '#E95473', fontSize: '14px', textDecoration: 'none' }}>
                      gochoaxinh@gmail.com
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-clock" style={{ color: '#E95473', fontSize: '20px' }}></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                      Giờ làm việc
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                      Thứ 2 - Chủ nhật: 8:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', marginBottom: '20px' }}>
                  Theo dõi chúng tôi
                </h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <a
                    href="https://facebook.com/gochoaxinh"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: '#1877f2',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <i className="fab fa-facebook-f" style={{ fontSize: '20px' }}></i>
                  </a>
                  <a
                    href="https://instagram.com/gochoaxinh"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <i className="fab fa-instagram" style={{ fontSize: '20px' }}></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#2c2c2c', marginBottom: '30px' }}>
                Gửi Tin Nhắn
              </h2>
              <form className="login-form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
                <div className="form-group">
                  <label htmlFor="name">Họ và tên *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <i className="fas fa-user"></i>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <i className="fas fa-envelope"></i>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <i className="fas fa-phone"></i>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Chủ đề *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Nhập chủ đề"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                  <i className="fas fa-tag"></i>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Tin nhắn *</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Nhập tin nhắn của bạn"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '14px 45px 14px 16px',
                      border: '1px solid #d4d8d0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      transition: 'all 0.3s',
                      backgroundColor: '#fafafa',
                      color: '#2c2c2c',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#E95473';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 143, 163, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d4d8d0';
                      e.target.style.backgroundColor = '#fafafa';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <i className="fas fa-comment" style={{ position: 'absolute', right: '15px', top: '42px', color: '#E95473' }}></i>
                </div>

                <button 
                  type="submit" 
                  className="login-button" 
                  disabled={isSubmitting}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </CustomerLayout>
  );
};

export default ContactPage;
