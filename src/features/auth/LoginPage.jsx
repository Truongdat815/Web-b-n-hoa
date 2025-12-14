import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useLoginMutation } from '../../api/auth/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import Toast from '../../components/ui/Toast';
import '../../assets/css/login.css';
import '../../assets/css/home.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin!');
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      }).unwrap();

      // Save credentials to Redux store
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
        role: result.user?.role || 'CUSTOMER',
      }));

      showToast('Đăng nhập thành công!', 'success');
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      const errorMessage = err.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
      <main className="main-content">
        <div className="login-container">
          <div className="login-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng trở lại FIAMA</p>
          </div>

          {error && (
            <div className="error-message show" id="errorMessage">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <i className="fas fa-user"></i>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i className="fas fa-lock"></i>
            </div>

            <div className="remember-forgot">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="divider">hoặc</div>

          <div className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </main>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </CustomerLayout>
  );
};

export default LoginPage;
