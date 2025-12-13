import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomerLayout from '../../layouts/CustomerLayout';
import { setCredentials } from '../../store/slices/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    ho: '',
    ten: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ho.trim()) {
      newErrors.ho = 'Vui lòng nhập họ';
    }

    if (!formData.ten.trim()) {
      newErrors.ten = 'Vui lòng nhập tên';
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

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const mockUser = {
        user_id: Date.now(),
        full_name: `${formData.ho} ${formData.ten}`,
        email: formData.email,
        phone: formData.phone,
        role_id: 2, // CUSTOMER
      };

      dispatch(
        setCredentials({
          user: mockUser,
          token: 'mock-token-' + Date.now(),
          role: 'CUSTOMER',
        })
      );

      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-800">Đăng ký tài khoản</span>
          </div>

          {/* Register Form */}
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-primary mb-4 text-center uppercase">ĐĂNG KÝ</h1>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              Đã có tài khoản,{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                đăng nhập tại đây
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                <input
                  type="text"
                  value={formData.ho}
                  onChange={(e) => setFormData({ ...formData, ho: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.ho ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ của bạn"
                  required
                />
                {errors.ho && <p className="mt-1 text-sm text-red-500">{errors.ho}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                <input
                  type="text"
                  value={formData.ten}
                  onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.ten ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên của bạn"
                  required
                />
                {errors.ten && <p className="mt-1 text-sm text-red-500">{errors.ten}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập email của bạn"
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số điện thoại"
                  required
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu"
                  required
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Hoặc đăng nhập bằng</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default RegisterPage;
