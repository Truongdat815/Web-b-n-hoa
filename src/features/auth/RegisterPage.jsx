import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import Toast from '../../components/ui/Toast';
import { useRegisterMutation } from '../../api/auth/authApi';
import '../../assets/css/login.css';
import '../../assets/css/signup.css';
import '../../assets/css/home.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin!', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Public customer registration endpoint
      const result = await register({
        fullName: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }).unwrap();

      console.log('Register API response:', result);

      // Success codes: backend may return 0 or 200/201
      if (result.code === 0 || result.code === 200 || result.code === 201) {
        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = 
        err?.data?.message ||
        err.message ||
        'Đăng ký thất bại. Vui lòng thử lại!';
      showToast(errorMessage, 'error');
      
      // Set field-specific errors if available
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  return (
    <CustomerLayout>
      <div className="login-container" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản mới để trải nghiệm FIAMA</p>
        </div>

        <form className="login-form" id="signupForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Họ và tên</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập họ và tên"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <i className="fas fa-user"></i>
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
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
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
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
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <i className="fas fa-lock"></i>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <i className="fas fa-lock"></i>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>

            <div className="remember-forgot">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span>
                  Tôi đồng ý với{' '}
                  <a href="#" style={{ color: '#E95473', textDecoration: 'underline' }}>
                    điều khoản sử dụng
                  </a>
                </span>
              </label>
              {errors.agreeTerms && <p className="error-text">{errors.agreeTerms}</p>}
            </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="divider">hoặc</div>

        <div className="register-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </CustomerLayout>
  );
};

export default RegisterPage;
