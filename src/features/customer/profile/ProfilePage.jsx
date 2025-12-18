import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetMyOrdersQuery } from '../../../api/orders/orderApi';
import { useGetMeQuery, useUpdateUserMutation } from '../../../api/users/userApi';
import { useGetAllRecipientInfosQuery, useCreateRecipientInfoMutation, useUpdateRecipientInfoMutation } from '../../../api/recipientInfos/recipientInfoApi';
import { useChangePasswordMutation } from '../../../api/auth/authApi';
import { logout } from '../../../store/slices/authSlice';
import '../../../assets/css/account.css';
import Toast from '../../../components/ui/Toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Gọi API để lấy thông tin user
  const { data: userResponse, isLoading: isLoadingUser, refetch: refetchUser } = useGetMeQuery();
  const user = userResponse?.data || {};

  // Gọi API để lấy danh sách đơn hàng
  const { data: ordersResponse, isLoading: isLoadingOrders } = useGetMyOrdersQuery();
  const orders = ordersResponse?.data || [];

  // Gọi API để cập nhật user
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Gọi API để lấy danh sách recipient infos
  const { data: recipientInfosResponse, isLoading: isLoadingRecipientInfos, refetch: refetchRecipientInfos } = useGetAllRecipientInfosQuery();
  const recipientInfos = recipientInfosResponse?.data || [];

  // Gọi API để tạo recipient info
  const [createRecipientInfo, { isLoading: isCreatingRecipientInfo }] = useCreateRecipientInfoMutation();

  // Gọi API để cập nhật recipient info
  const [updateRecipientInfo, { isLoading: isUpdatingRecipientInfo }] = useUpdateRecipientInfoMutation();
  
  // Gọi API để đổi mật khẩu
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  const [showAddRecipientForm, setShowAddRecipientForm] = useState(false);
  const [editingInfoId, setEditingInfoId] = useState(null);
  const [newRecipientData, setNewRecipientData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    isDefault: false,
  });
  
  // Change password state
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const defaultValuesRef = useRef({});

  // Update form data when user data loads
  useEffect(() => {
    if (user && user.userId) {
      const newFormData = {
        fullName: user.fullName || '',
        phone: user.phone || '',
      };
      setFormData(newFormData);
      defaultValuesRef.current = { ...newFormData };
    }
  }, [user]);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setActiveSection(hash);
    }
  }, []);

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

  const showSection = (sectionId) => {
    setActiveSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra thay đổi
    const hasChanges = 
      formData.fullName !== (defaultValuesRef.current.fullName || '') ||
      formData.phone !== (defaultValuesRef.current.phone || '');

    if (!hasChanges) {
      showToast('Không có thay đổi nào để lưu!', 'warning');
      return;
    }

    // Validate
    if (!formData.fullName || !formData.fullName.trim()) {
      showToast('Vui lòng nhập họ và tên!', 'error');
      return;
    }

    try {
      await updateUser({
        userId: user.userId,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: user.email, // Giữ nguyên email
      }).unwrap();

      showToast('Cập nhật thông tin thành công!', 'success');
      defaultValuesRef.current = { ...formData };
      refetchUser();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Cập nhật thông tin thất bại!';
      showToast(errorMessage, 'error');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleUpdateOrderStatus = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận đã giao hàng không?')) {
      // TODO: Gọi API cập nhật trạng thái đơn hàng ở đây
      showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
    }
  };

  const handleRecipientInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRecipientData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateRecipientInfo = async (e) => {
    e.preventDefault();

    // Validate
    if (!newRecipientData.recipientName || !newRecipientData.recipientName.trim()) {
      showToast('Vui lòng nhập tên người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientPhone || !newRecipientData.recipientPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientAddress || !newRecipientData.recipientAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ người nhận!', 'error');
      return;
    }

    try {
      await createRecipientInfo({
        recipientName: newRecipientData.recipientName.trim(),
        recipientPhone: newRecipientData.recipientPhone.trim(),
        recipientAddress: newRecipientData.recipientAddress.trim(),
        isDefault: newRecipientData.isDefault,
      }).unwrap();

      showToast('Thêm thông tin người nhận thành công!', 'success');
      setNewRecipientData({
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        isDefault: false,
      });
      setShowAddRecipientForm(false);
      refetchRecipientInfos();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Thêm thông tin người nhận thất bại!';
      showToast(errorMessage, 'error');
    }
  };

  const handleCancelAddRecipient = () => {
    setShowAddRecipientForm(false);
    setEditingInfoId(null);
    setNewRecipientData({
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      isDefault: false,
    });
  };

  const handleEditRecipientInfo = (info) => {
    setEditingInfoId(info.infoId);
    setShowAddRecipientForm(true);
    setNewRecipientData({
      recipientName: info.recipientName || '',
      recipientPhone: info.recipientPhone || '',
      recipientAddress: info.recipientAddress || '',
      isDefault: info.default || false,
    });
  };

  const handleUpdateRecipientInfo = async (e) => {
    e.preventDefault();

    // Validate
    if (!newRecipientData.recipientName || !newRecipientData.recipientName.trim()) {
      showToast('Vui lòng nhập tên người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientPhone || !newRecipientData.recipientPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientAddress || !newRecipientData.recipientAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ người nhận!', 'error');
      return;
    }

    try {
      await updateRecipientInfo({
        infoId: editingInfoId,
        recipientName: newRecipientData.recipientName.trim(),
        recipientPhone: newRecipientData.recipientPhone.trim(),
        recipientAddress: newRecipientData.recipientAddress.trim(),
        isDefault: newRecipientData.isDefault,
      }).unwrap();

      showToast('Cập nhật thông tin người nhận thành công!', 'success');
      setNewRecipientData({
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        isDefault: false,
      });
      setShowAddRecipientForm(false);
      setEditingInfoId(null);
      refetchRecipientInfos();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Cập nhật thông tin người nhận thất bại!';
      showToast(errorMessage, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle password input change
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordErrors({});
    
    // Validate
    if (!passwordData.oldPassword || !passwordData.oldPassword.trim()) {
      setPasswordErrors({ oldPassword: 'Vui lòng nhập mật khẩu cũ!' });
      return;
    }
    
    if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
      setPasswordErrors({ newPassword: 'Vui lòng nhập mật khẩu mới!' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    
    if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
      setPasswordErrors({ confirmPassword: 'Vui lòng nhập lại mật khẩu mới!' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    
    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordErrors({ newPassword: 'Mật khẩu mới phải khác mật khẩu cũ!' });
      return;
    }
    
    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      
      showToast('Đổi mật khẩu thành công!', 'success');
      setShowChangePasswordForm(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      const errorMessage = error?.data?.message || 'Đổi mật khẩu thất bại!';
      showToast(errorMessage, 'error');
    }
  };

  // Handle toggle change password form
  const handleToggleChangePasswordForm = () => {
    setShowChangePasswordForm(prev => !prev);
    if (showChangePasswordForm) {
      // Reset form when closing
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    }
  };

  // Calculate stats - theo API structure
  const totalOrders = orders.length || 0;
  const totalSpending = orders.reduce((sum, order) => sum + (order.totalPayment || 0), 0);
  const rewardPoints = Math.floor(totalSpending / 1000) || 0;
  const recentOrders = orders.slice(0, 5);

  // Format price
  const formatPrice = (price) => {
    return '₫' + parseFloat(price || 0).toLocaleString('vi-VN');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Get status text - theo API structure
  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'DELIVERY': 'Đang giao',
      'COMPLETED': 'Đã hoàn thành',
      'REJECTED': 'Đã từ chối',
    };
    return statusMap[status] || status || 'N/A';
  };

  // Get status class
  const getStatusClass = (status) => {
    const classMap = {
      'PENDING': 'pending',
      'REQUEST': 'pending',
      'DELIVERY': 'processing',
      'COMPLETED': 'completed',
      'REJECTED': 'pending',
    };
    return classMap[status] || 'default';
  };

  return (
    <CustomerLayout>
      <main className="main-content">
        <div className="account-container">
          {/* Sidebar */}
          <div className="account-sidebar">
            <div className="user-profile">
              <div className="avatar">
                <i className="fas fa-user"></i>
              </div>
              <h2 className="user-name">{user?.fullName || user?.username || 'User'}</h2>
              <p className="user-email">{user?.email || ''}</p>
            </div>

            <nav className="account-nav">
              <a
                href="#overview"
                className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  showSection('overview');
                }}
              >
                <i className="fas fa-home"></i>
                <span>Tổng quan</span>
              </a>
              <a
                href="#orders"
                className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  showSection('orders');
                }}
              >
                <i className="fas fa-shopping-bag"></i>
                <span>Đơn hàng</span>
              </a>
              <a
                href="#profile"
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  showSection('profile');
                }}
              >
                <i className="fas fa-user-circle"></i>
                <span>Hồ sơ</span>
              </a>
              <a
                href="#settings"
                className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  showSection('settings');
                }}
              >
                <i className="fas fa-cog"></i>
                <span>Cài đặt</span>
              </a>
              <a
                href="#"
                className="nav-item logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
              </a>
            </nav>
          </div>

          {/* Content */}
          <div className="account-content">
            {/* Overview Section */}
            <div className={`content-section ${activeSection === 'overview' ? 'active' : ''}`} id="overview">
              <h1 className="section-title">Tổng quan tài khoản</h1>
              
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon orders">
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <div className="card-content">
                    <h3>Tổng đơn hàng</h3>
                    <p className="card-value">{totalOrders}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon spending">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="card-content">
                    <h3>Tổng chi tiêu</h3>
                    <p className="card-value">{formatPrice(totalSpending)}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <div className="card-icon points">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="card-content">
                    <h3>Điểm thưởng</h3>
                    <p className="card-value">{rewardPoints}</p>
                  </div>
                </div>
              </div>

              <div className="recent-orders">
                <h2 className="subsection-title">Đơn hàng gần đây</h2>
                {recentOrders.length > 0 ? (
                  <div className="orders-list">
                    {recentOrders.map((order) => (
                      <div key={order.orderId} className="order-item">
                        <div className="order-info">
                          <span className="order-id">#{order.orderCode || `ORD-${order.orderId}`}</span>
                          <span className="order-date">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className={`order-status ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </div>
                        <div className="order-total">{formatPrice(order.totalPayment)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="orders-list">
                    <p className="no-orders-message">Bạn chưa có đơn hàng nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Orders Section */}
            <div className={`content-section ${activeSection === 'orders' ? 'active' : ''}`} id="orders">
              <h1 className="section-title">Đơn hàng của tôi</h1>
              
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Đơn hàng</th>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody id="ordersTableBody">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="no-orders">Bạn chưa có đơn hàng nào</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.orderId}>
                          <td>#{order.orderCode || `ORD-${order.orderId}`}</td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            {order.status === 'DELIVERY' && (
                              <button
                                className="view-details-btn updateStatus"
                                style={{ marginLeft: '10px' }}
                                onClick={() => handleUpdateOrderStatus(order.orderId)}
                              >
                                Xác nhận đã giao hàng
                              </button>
                            )}
                          </td>
                          <td>{formatPrice(order.totalPayment)}</td>
                          <td>
                            <Link
                              to={`/orders/${order.orderId}`}
                              className="view-details-btn"
                              style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                              Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile Section */}
            <div className={`content-section ${activeSection === 'profile' ? 'active' : ''}`} id="profile">
              <h1 className="section-title">Chỉnh sửa hồ sơ</h1>

              {isLoadingUser ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Đang tải thông tin...</p>
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <div className="form-group full-width">
                    <label htmlFor="fullName">Họ và tên</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isUpdating}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isUpdating}
                    />
                  </div>

                  <button type="submit" className="save-btn" disabled={isUpdating}>
                    <span>{isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    <i className="fas fa-check"></i>
                  </button>
                </form>
              )}

              {/* Recipient Infos Section */}
              <div style={{ marginTop: '40px' }}>
                <h2 className="subsection-title" style={{ marginBottom: '20px' }}>
                  Thông tin người nhận
                </h2>

                {isLoadingRecipientInfos ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Đang tải thông tin người nhận...</p>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                        marginBottom: '20px',
                      }}
                    >
                      {recipientInfos.map((info) => (
                        <div
                          key={info.infoId}
                          onClick={() => handleEditRecipientInfo(info)}
                          style={{
                            border: `2px solid ${info.default ? '#E95473' : '#e0e0e0'}`,
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: info.default ? '#FFF5F7' : '#ffffff',
                            position: 'relative',
                            boxShadow: info.default ? '0 2px 8px rgba(233, 84, 115, 0.15)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = info.default 
                              ? '0 4px 12px rgba(233, 84, 115, 0.25)' 
                              : '0 2px 8px rgba(0, 0, 0, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = info.default 
                              ? '0 2px 8px rgba(233, 84, 115, 0.15)' 
                              : 'none';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <p style={{ margin: '0', fontSize: '14px' }}>
                              <strong>Tên:</strong> {info.recipientName}
                            </p>
                            {info.default && (
                              <div
                                style={{
                                  backgroundColor: '#E95473',
                                  color: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                }}
                              >
                                Mặc định
                              </div>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                              <strong>Điện thoại:</strong> {info.recipientPhone}
                            </p>
                            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                              <strong>Địa chỉ:</strong> {info.recipientAddress}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add New Recipient Info Card */}
                      <div
                        style={{
                          border: '2px dashed #ccc',
                          borderRadius: '8px',
                          padding: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          backgroundColor: '#f9f9f9',
                        }}
                        onClick={() => {
                          setEditingInfoId(null);
                          setShowAddRecipientForm(true);
                          setNewRecipientData({
                            recipientName: '',
                            recipientPhone: '',
                            recipientAddress: '',
                            isDefault: false,
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#E95473';
                          e.currentTarget.style.backgroundColor = '#FFE5EA';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#ccc';
                          e.currentTarget.style.backgroundColor = '#f9f9f9';
                        }}
                      >
                        <i
                          className="fas fa-plus"
                          style={{
                            fontSize: '32px',
                            color: '#E95473',
                          }}
                        />
                      </div>
                    </div>

                    {/* Add Recipient Form - Display below grid */}
                    {showAddRecipientForm && (
                      <div
                        style={{
                          border: '2px solid #E95473',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: '#ffffff',
                          marginTop: '20px',
                        }}
                      >
                          <form onSubmit={editingInfoId ? handleUpdateRecipientInfo : handleCreateRecipientInfo}>
                            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#2c2c2c' }}>
                              {editingInfoId ? 'Chỉnh sửa thông tin người nhận' : 'Thêm thông tin người nhận mới'}
                            </h3>
                            <div style={{ marginBottom: '15px' }}>
                              <label
                                htmlFor="recipientName"
                                style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}
                              >
                                Tên người nhận *
                              </label>
                              <input
                                type="text"
                                id="recipientName"
                                name="recipientName"
                                value={newRecipientData.recipientName}
                                onChange={handleRecipientInputChange}
                                required
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                }}
                                disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                              />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                              <label
                                htmlFor="recipientPhone"
                                style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}
                              >
                                Số điện thoại *
                              </label>
                              <input
                                type="tel"
                                id="recipientPhone"
                                name="recipientPhone"
                                value={newRecipientData.recipientPhone}
                                onChange={handleRecipientInputChange}
                                required
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                }}
                                disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                              />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                              <label
                                htmlFor="recipientAddress"
                                style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}
                              >
                                Địa chỉ *
                              </label>
                              <textarea
                                id="recipientAddress"
                                name="recipientAddress"
                                value={newRecipientData.recipientAddress}
                                onChange={handleRecipientInputChange}
                                required
                                rows="3"
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  resize: 'vertical',
                                }}
                                disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                              />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  name="isDefault"
                                  checked={newRecipientData.isDefault}
                                  onChange={handleRecipientInputChange}
                                  style={{ marginRight: '8px', cursor: 'pointer' }}
                                  disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                                />
                                <span>Đặt làm mặc định</span>
                              </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="submit"
                                disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                                style={{
                                  flex: 1,
                                  padding: '10px',
                                  backgroundColor: '#E95473',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: (isCreatingRecipientInfo || isUpdatingRecipientInfo) ? 'not-allowed' : 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  opacity: (isCreatingRecipientInfo || isUpdatingRecipientInfo) ? 0.6 : 1,
                                  transition: 'background-color 0.3s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isCreatingRecipientInfo && !isUpdatingRecipientInfo) {
                                    e.currentTarget.style.backgroundColor = '#FF7694';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isCreatingRecipientInfo && !isUpdatingRecipientInfo) {
                                    e.currentTarget.style.backgroundColor = '#E95473';
                                  }
                                }}
                              >
                                {isUpdatingRecipientInfo 
                                  ? 'Đang cập nhật...' 
                                  : isCreatingRecipientInfo 
                                    ? 'Đang thêm...' 
                                    : editingInfoId 
                                      ? 'Lưu thay đổi' 
                                      : 'Thêm'}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelAddRecipient}
                                disabled={isCreatingRecipientInfo || isUpdatingRecipientInfo}
                                style={{
                                  flex: 1,
                                  padding: '10px',
                                  backgroundColor: '#ccc',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: (isCreatingRecipientInfo || isUpdatingRecipientInfo) ? 'not-allowed' : 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  opacity: (isCreatingRecipientInfo || isUpdatingRecipientInfo) ? 0.6 : 1,
                                }}
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div className={`content-section ${activeSection === 'settings' ? 'active' : ''}`} id="settings">
              <h1 className="section-title">Cài đặt tài khoản</h1>
              
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Thông báo Email</h3>
                    <p>Nhận cập nhật qua email về đơn hàng của bạn</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Thông báo SMS</h3>
                    <p>Nhận cập nhật qua SMS về đơn hàng của bạn</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Bản tin</h3>
                    <p>Nhận bản tin hàng tuần của chúng tôi</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Đổi mật khẩu</h3>
                    <p>Cập nhật mật khẩu tài khoản của bạn</p>
                  </div>
                  <button
                    className="change-password-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleChangePasswordForm();
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                </div>

                {/* Change Password Form - Inline below the card */}
                {showChangePasswordForm && (
                  <div
                    className="password-change-section"
                    style={{
                      marginTop: '10px',
                      padding: '20px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px',
                      animation: 'slideDown 0.3s ease-out',
                    }}
                  >
                    <form onSubmit={handleChangePassword}>
                      <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                        <label htmlFor="oldPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Mật khẩu cũ *
                        </label>
                        <input
                          type="password"
                          id="oldPassword"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordInputChange}
                          required
                          disabled={isChangingPassword}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: passwordErrors.oldPassword ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                        {passwordErrors.oldPassword && (
                          <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                            {passwordErrors.oldPassword}
                          </span>
                        )}
                      </div>

                      <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                        <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Mật khẩu mới *
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          required
                          disabled={isChangingPassword}
                          minLength={6}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: passwordErrors.newPassword ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                        {passwordErrors.newPassword && (
                          <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                            {passwordErrors.newPassword}
                          </span>
                        )}
                        <span style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                          Mật khẩu phải có ít nhất 6 ký tự
                        </span>
                      </div>

                      <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Xác nhận mật khẩu mới *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          required
                          disabled={isChangingPassword}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: passwordErrors.confirmPassword ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                        {passwordErrors.confirmPassword && (
                          <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                            {passwordErrors.confirmPassword}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button
                          type="button"
                          onClick={handleToggleChangePasswordForm}
                          disabled={isChangingPassword}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#ccc',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                            opacity: isChangingPassword ? 0.6 : 1,
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#E95473',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                            opacity: isChangingPassword ? 0.6 : 1,
                            transition: 'background-color 0.3s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isChangingPassword) {
                              e.currentTarget.style.backgroundColor = '#FF7694';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isChangingPassword) {
                              e.currentTarget.style.backgroundColor = '#E95473';
                            }
                          }}
                        >
                          {isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </CustomerLayout>
  );
};

export default ProfilePage;
