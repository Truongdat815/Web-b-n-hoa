import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../../api/users/userApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Gọi API để lấy thông tin user nếu đang edit
  const { data: userResponse, isLoading: isLoadingUser } = useGetUserByIdQuery(id, { skip: !isEditMode });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Load dữ liệu user vào form khi có dữ liệu
  useEffect(() => {
    if (userResponse?.data) {
      const user = userResponse.data;
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [userResponse]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditMode) {
      showToast('Chức năng tạo tài khoản không khả dụng', 'error');
      return;
    }

    try {
      await updateUser({
        userId: id,
        ...formData
      }).unwrap();
      
      showToast('Cập nhật thông tin tài khoản thành công!', 'success');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      console.error('Update user error:', error);
      showToast(error?.data?.message || 'Cập nhật thông tin thất bại!', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  if (isLoadingUser) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>{isEditMode ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h1>
            <p>Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="content-header">
          <div>
            <h1>{isEditMode ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h1>
            <p>{isEditMode ? 'Chỉnh sửa thông tin tài khoản' : 'Tạo tài khoản mới'}</p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
        </div>

        <div className="admin-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">
                Họ tên <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isUpdating}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isUpdating || isEditMode}
                placeholder="Nhập email"
                style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
              />
              {isEditMode && (
                <p className="form-helper" style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                  Email không thể thay đổi
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isUpdating}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdating}
                style={{ minWidth: '150px' }}
              >
                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="btn-secondary"
                disabled={isUpdating}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>

        {toast.show && (
          <Toast message={toast.message} type={toast.type} />
        )}
      </div>
    </AdminLayout>
  );
};

export default UserFormPage;


