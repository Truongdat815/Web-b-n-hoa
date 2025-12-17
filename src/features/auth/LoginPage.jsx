import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useLoginMutation, decodeJWT } from '../../api/auth/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { isAdminEmail } from '../../config/admin';
import Toast from '../../components/ui/Toast';
import '../../assets/css/login.css';
import '../../assets/css/home.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://160.25.232.214:8080/api';

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
        email: formData.username, // API expects 'email' field
        password: formData.password,
      }).unwrap();

      console.log('Login API response:', result);

      // API response format after baseQuery transform: { code, message, data: { accessToken, refreshToken, ... } }
      // result is already the full response object from baseQuery
      const responseData = result.data?.data || result.data;
      
      console.log('Response data:', responseData);
      
      if (!responseData || !responseData.accessToken) {
        console.error('Invalid response:', { responseData, result });
        throw new Error('Invalid response from server');
      }

      // Decode JWT token to get user info and role
      const decodedToken = decodeJWT(responseData.accessToken);
      const email = decodedToken?.sub || formData.username;

      // IMPORTANT: backend currently may assign ADMIN incorrectly.
      // Only allow real admin emails to be treated as ADMIN in the UI.
      const tokenRole = decodedToken?.roleName || 'CUSTOMER';
      const role = tokenRole === 'ADMIN' && isAdminEmail(email) ? 'ADMIN' : 'CUSTOMER';

      console.log('Login successful:', { email, role, decodedToken });

      // Save tokens to localStorage
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);

      // Save credentials to Redux store
      dispatch(setCredentials({
        user: {
          email: email,
          role: role,
        },
        token: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        role: role,
      }));

      // Extra safety: if account is INACTIVE, block login UX (backend should ideally block earlier)
      try {
        const meRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${responseData.accessToken}`,
          },
        });
        const meJson = await meRes.json();
        const me = meJson?.data;
        const status = (me?.status || '').toString().toUpperCase();
        if (status === 'INACTIVE') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          showToast('Bạn đã bị chặn bởi admin', 'error');
          setError('Bạn đã bị chặn bởi admin');
          return;
        }
      } catch (e) {
        // ignore - if /users/me fails, continue with token-based role flow
        console.warn('users/me check skipped:', e);
      }

      showToast('Đăng nhập thành công!', 'success');
      
      // Redirect based on role
      setTimeout(() => {
        if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error response formats
      const rawMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.error?.data?.message ||
        err?.error?.data?.error ||
        err?.message ||
        '';

      const normalized = rawMessage.toString().toLowerCase();
      const isBlocked =
        err?.status === 403 ||
        normalized.includes('inactive') ||
        normalized.includes('blocked') ||
        normalized.includes('ban') ||
        normalized.includes('bị chặn') ||
        normalized.includes('blocked by') ||
        normalized.includes('disable');

      const errorMessage = isBlocked
        ? 'Bạn đã bị chặn bởi admin'
        : (rawMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
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
