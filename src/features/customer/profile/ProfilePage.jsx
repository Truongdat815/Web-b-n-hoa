import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetMyOrdersQuery, useLazyGetVnpayPaymentUrlQuery, useCancelOrderMutation, useConfirmOrderDeliveredMutation } from '../../../api/orders/orderApi';
import { useGetMeQuery, useUpdateUserMutation } from '../../../api/users/userApi';
import { useGetAllRecipientInfosQuery, useCreateRecipientInfoMutation, useUpdateRecipientInfoMutation } from '../../../api/recipientInfos/recipientInfoApi';
import { useChangePasswordMutation } from '../../../api/auth/authApi';
import { useGetFeedbacksByOrderDetailQuery, useGetFeedbacksByOrderQuery, useCreateFeedbackMutation } from '../../../api/feedbacks/feedbackApi';
import { logout } from '../../../store/slices/authSlice';
import '../../../assets/css/account.css';
import Toast from '../../../components/ui/Toast';

const ProfilePage = () => {
  const location = useLocation();
  
  // Early return if not on profile route - must check before any other hooks
  // This prevents component from rendering when not on /profile route
  if (location.pathname !== '/profile') {
    return null;
  }
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('overview');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Gọi API để lấy thông tin user
  const { data: userResponse, isLoading: isLoadingUser, refetch: refetchUser } = useGetMeQuery();
  const user = userResponse?.data || {};

  // Gọi API để lấy danh sách đơn hàng
  const { data: ordersResponse, isLoading: isLoadingOrders, refetch: refetchOrders } = useGetMyOrdersQuery();
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

  // Gọi API để lấy payment URL
  const [getVnpayPaymentUrl, { isLoading: isGettingPaymentUrl }] = useLazyGetVnpayPaymentUrlQuery();

  // Gọi API để hủy đơn hàng
  const [cancelOrder, { isLoading: isCancellingOrder }] = useCancelOrderMutation();

  // Gọi API để xác nhận đã nhận hàng
  const [confirmOrderDelivered, { isLoading: isConfirmingDelivered }] = useConfirmOrderDeliveredMutation();

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

  // State for order details expansion and reviews
  const [expandedOrders, setExpandedOrders] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  // State for confirm delivered modal
  const [showConfirmDeliveredModal, setShowConfirmDeliveredModal] = useState(false);
  const [orderIdToConfirm, setOrderIdToConfirm] = useState(null);

  // Feedback mutation
  const [createFeedback, { isLoading: isCreatingFeedback }] = useCreateFeedbackMutation();

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

  // Handle hash navigation and VNPay callback - Only when on profile route
  useEffect(() => {
    // Only handle when on profile route
    if (location.pathname !== '/profile') {
      return; // Cleanup: do nothing if not on profile route
    }

    const handleHashChange = () => {
      // Always check current pathname - don't handle if navigated away
      if (location.pathname !== '/profile' || window.location.pathname !== '/profile') {
        return;
      }
      
      const hash = window.location.hash.substring(1);
      // Extract section from hash (remove query params if any)
      const section = hash.split('?')[0].split('#')[0];
      if (section && ['overview', 'orders', 'profile', 'settings'].includes(section)) {
        setActiveSection(section);
      } else if (!hash) {
        // Default to overview if no hash
        setActiveSection('overview');
      }
    };
    
    // Check for VNPay callback query params
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const hasVnpayParams = urlParams.has('vnp_Amount') || hashParams.has('vnp_Amount');
    
    // Handle initial load
    handleHashChange();
    
    // If VNPay callback, refetch orders to update status and clean URL
    if (hasVnpayParams) {
      refetchOrders();
      // Clean up URL by removing query params from hash
      const cleanHash = window.location.hash.split('?')[0];
      if (cleanHash) {
        window.history.replaceState(null, '', window.location.pathname + cleanHash);
      }
    }
    
    // Listen for hash changes (only when on profile page)
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup: remove event listener when component unmounts or route changes
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location.pathname, refetchOrders]);

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

  const handleOpenConfirmDeliveredModal = (orderId) => {
    setOrderIdToConfirm(orderId);
    setShowConfirmDeliveredModal(true);
  };

  const handleConfirmDelivered = async () => {
    if (!orderIdToConfirm) return;

    try {
      await confirmOrderDelivered(orderIdToConfirm).unwrap();
      showToast('Xác nhận đã nhận hàng thành công!', 'success');
      setShowConfirmDeliveredModal(false);
      setOrderIdToConfirm(null);
      refetchOrders();
    } catch (error) {
      console.error('Error confirming delivered:', error);
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi xác nhận đã nhận hàng!';
      showToast(errorMessage, 'error');
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
    if (!status) return 'N/A';
    
    // Normalize status to uppercase for consistent matching
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'COMPLETED': 'Đã thanh toán',
      'PROCESSING': 'Đang chuẩn bị hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã nhận hàng',
      'DELIVERY': 'Đang giao',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'REJECTED': 'Đã từ chối',
    };
    
    // Return mapped status or fallback
    return statusMap[normalizedStatus] || 'N/A';
  };

  // Get status class
  const getStatusClass = (status) => {
    const classMap = {
      'PENDING': 'pending',
      'COMPLETED': 'completed',
      'PROCESSING': 'processing',
      'SHIPPING': 'processing',
      'DELIVERED': 'completed',
      'DELIVERY': 'processing',
      'CANCELLED': 'pending',
      'REJECTED': 'pending',
      'REQUEST': 'pending',
    };
    return classMap[status] || 'default';
  };

  // Handle payment for pending orders
  const handlePayment = async (orderId) => {
    try {
      const paymentResponse = await getVnpayPaymentUrl(orderId).unwrap();
      const paymentUrl = paymentResponse.data || paymentResponse;
      
      if (paymentUrl && typeof paymentUrl === 'string') {
        // Redirect to payment URL
        window.location.href = paymentUrl;
      } else {
        showToast('Không nhận được URL thanh toán từ server', 'error');
      }
    } catch (error) {
      console.error('Error getting payment URL:', error);
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi lấy URL thanh toán!';
      showToast(errorMessage, 'error');
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }

    try {
      await cancelOrder(orderId).unwrap();
      showToast('Hủy đơn hàng thành công!', 'success');
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng!';
      showToast(errorMessage, 'error');
    }
  };

  // Toggle order details expansion
  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Component to check if order detail has feedback and return feedback info
  const OrderDetailFeedbackCheck = ({ orderDetailId, children }) => {
    const { data: feedbackResponse } = useGetFeedbacksByOrderDetailQuery(orderDetailId, {
      skip: !orderDetailId
    });
    // API trả về object trực tiếp, không phải array
    const feedback = feedbackResponse?.data || null;
    return children(feedback);
  };

  // Get review count for an order - will be calculated by OrderRow component
  const getOrderReviewStats = (order) => {
    const orderDetails = order.orderDetails || order.orderDetailList || [];
    return { total: orderDetails.length };
  };

  // Handle open review modal
  const handleOpenReviewModal = (orderDetail) => {
    setSelectedOrderDetail(orderDetail);
    setReviewRating(5);
    setReviewContent('');
    setShowReviewModal(true);
  };

  // Handle submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrderDetail || !reviewContent.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá!', 'warning');
      return;
    }

    try {
      await createFeedback({
        orderDetailId: selectedOrderDetail.orderDetailId,
        rating: reviewRating,
        content: reviewContent,
      }).unwrap();
      
      showToast('Đánh giá đã được gửi thành công!', 'success');
      setShowReviewModal(false);
      setSelectedOrderDetail(null);
      setReviewRating(5);
      setReviewContent('');
      refetchOrders();
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
      showToast(errorMessage, 'error');
    }
  };

  // Handle view review - navigate to product detail page
  const handleViewReview = (orderDetail) => {
    // Lấy flowerId từ orderDetail hoặc từ feedback object (theo API response structure)
    const flowerId = orderDetail.flowerId || 
                     orderDetail.feedback?.flowerId || 
                     orderDetail.flower?.flowerId;
    
    if (!flowerId) {
      console.error('OrderDetail missing flowerId:', orderDetail);
      showToast('Không tìm thấy thông tin sản phẩm!', 'error');
      return;
    }
    
    // Use window.location.href to ensure hash is properly handled and page loads
    window.location.href = `/products/${flowerId}#review-${orderDetail.orderDetailId}`;
  };

  // Component for order row with review functionality
  const OrderRow = ({ order }) => {
    const orderDetails = order.orderDetails || order.orderDetailList || [];
    const [reviewCounts, setReviewCounts] = useState({ reviewed: 0, total: orderDetails.length });
    const prevCountsRef = useRef({ reviewed: 0, total: orderDetails.length });
    
    // Fetch all feedbacks for this order
    const { data: feedbacksResponse } = useGetFeedbacksByOrderQuery(order.orderId, {
      skip: !order.orderId || order.status !== 'DELIVERED'
    });
    
    const feedbacks = feedbacksResponse?.data || [];

    // Update review count based on feedbacks - only update if values actually changed
    useEffect(() => {
      // Chỉ đếm review khi order status là DELIVERED
      if (order.status !== 'DELIVERED') {
        const newCounts = { reviewed: 0, total: orderDetails.length };
        // Only update if values changed
        if (prevCountsRef.current.reviewed !== newCounts.reviewed || 
            prevCountsRef.current.total !== newCounts.total) {
          setReviewCounts(newCounts);
          prevCountsRef.current = newCounts;
        }
        return;
      }
      
      // Đếm số lượng feedbacks đã có
      const reviewedCount = feedbacks.length;
      const newCounts = { 
        reviewed: reviewedCount, 
        total: orderDetails.length 
      };
      
      // Only update if values actually changed to prevent infinite loop
      if (prevCountsRef.current.reviewed !== newCounts.reviewed || 
          prevCountsRef.current.total !== newCounts.total) {
        setReviewCounts(newCounts);
        prevCountsRef.current = newCounts;
      }
    }, [feedbacks.length, orderDetails.length, order.status]);

    return (
      <>
        <tr key={order.orderId}>
          <td>#{order.orderCode || `ORD-${order.orderId}`}</td>
          <td>{formatDate(order.orderDate)}</td>
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              {(order.status === 'SHIPPING' || order.status === 'DELIVERY') && (
                <button
                  className="view-details-btn updateStatus"
                  style={{ 
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => handleOpenConfirmDeliveredModal(order.orderId)}
                  disabled={isConfirmingDelivered}
                >
                  {isConfirmingDelivered ? 'Đang xử lý...' : 'Đã nhận hàng'}
                </button>
              )}
            </div>
          </td>
          <td>{formatPrice(order.totalPayment)}</td>
          <td>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px', 
              alignItems: 'flex-end',
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
              }}>
                {order.status === 'PENDING' && (
                  <>
                    <button
                      className="view-details-btn"
                      onClick={() => handlePayment(order.orderId)}
                      disabled={isGettingPaymentUrl}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isGettingPaymentUrl ? 'not-allowed' : 'pointer',
                        opacity: isGettingPaymentUrl ? 0.6 : 1,
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isGettingPaymentUrl ? 'Đang xử lý...' : 'Thanh toán'}
                    </button>
                    <button
                      className="view-details-btn"
                      onClick={() => handleCancelOrder(order.orderId)}
                      disabled={isCancellingOrder}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isCancellingOrder ? 'not-allowed' : 'pointer',
                        opacity: isCancellingOrder ? 0.6 : 1,
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isCancellingOrder ? 'Đang xử lý...' : 'Hủy đơn'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => window.location.href = `/orders/${order.orderId}`}
                  className="view-details-btn"
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#E95473',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => toggleOrderDetails(order.orderId)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {expandedOrders[order.orderId] ? 'Thu gọn' : 'Chi tiết'} <i className={`fas fa-chevron-${expandedOrders[order.orderId] ? 'up' : 'down'}`}></i>
                </button>
              </div>
              {reviewCounts.total > 0 && order.status === 'DELIVERED' && (
                <div style={{ 
                  width: '100%',
                  textAlign: 'center',
                  marginTop: '4px',
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    whiteSpace: 'nowrap',
                  }}>
                    Đã đánh giá {reviewCounts.reviewed}/{reviewCounts.total} sản phẩm
                  </span>
                </div>
              )}
            </div>
          </td>
        </tr>
        {expandedOrders[order.orderId] && (
          <tr>
            <td colSpan="5" style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>CHI TIẾT SẢN PHẨM</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f8f8' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>STT</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>ẢNH</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>SẢN PHẨM</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>SỐ BÓ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>ĐƠN GIÁ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>GIẢM GIÁ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>THÀNH TIỀN</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e0e0e0' }}>ĐÁNH GIÁ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map((detail, index) => (
                        <OrderDetailRow
                          key={detail.orderDetailId}
                          detail={detail}
                          index={index}
                          orderStatus={order.status}
                          onOpenReview={handleOpenReviewModal}
                          onViewReview={handleViewReview}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  // Component for order detail row
  const OrderDetailRow = ({ detail, index, orderStatus, onOpenReview, onViewReview }) => {
    const { data: feedbackResponse } = useGetFeedbacksByOrderDetailQuery(detail.orderDetailId, {
      skip: !detail.orderDetailId
    });
    // API trả về object trực tiếp, không phải array
    const feedback = feedbackResponse?.data || null;

    const imagePath = detail.imagePath || detail.flower?.imagePath || detail.flowerColor?.flower?.imagePath || 'https://via.placeholder.com/100';
    const flowerId = feedback?.flowerId || detail.flowerId || detail.flower?.flowerId;
    
    // Chỉ cho đánh giá khi order status là DELIVERED
    const canReview = orderStatus === 'DELIVERED';

    return (
      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
        <td style={{ padding: '12px', fontSize: '14px' }}>{index + 1}</td>
        <td style={{ padding: '12px' }}>
          <img 
            src={imagePath} 
            alt={detail.flowerName || 'Sản phẩm'} 
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100';
            }}
          />
        </td>
        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{detail.flowerName || 'Sản phẩm'}</td>
        <td style={{ padding: '12px', fontSize: '14px' }}>{detail.quantity || 0}</td>
        <td style={{ padding: '12px', fontSize: '14px' }}>{formatPrice(detail.unitPrice || 0)}</td>
        <td style={{ padding: '12px', fontSize: '14px', color: '#E95473', fontWeight: '500' }}>
          {detail.discountAmount > 0 ? `-${formatPrice(detail.discountAmount)}` : '-'}
        </td>
        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{formatPrice(detail.totalPrice || 0)}</td>
        <td style={{ padding: '12px' }}>
          {canReview ? (
            feedback ? (
              <button
                onClick={() => onViewReview({ ...detail, feedback })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#E95473',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                Xem đánh giá
              </button>
            ) : (
              <button
                onClick={() => onOpenReview(detail)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                Viết đánh giá
              </button>
            )
          ) : (
            <span style={{ fontSize: '13px', color: '#999' }}>-</span>
          )}
        </td>
      </tr>
    );
  };

  // Cleanup effect when route changes away from /profile
  useEffect(() => {
    // Force cleanup when route changes away from /profile
    if (location.pathname !== '/profile') {
      // Reset all state when navigating away
      setActiveSection('overview');
      setToast({ show: false, message: '', type: 'success' });
    }
  }, [location.pathname]);

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
                        <OrderRow key={order.orderId} order={order} />
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

      {/* Confirm Delivered Modal */}
      {showConfirmDeliveredModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            if (!isConfirmingDelivered) {
              setShowConfirmDeliveredModal(false);
              setOrderIdToConfirm(null);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <i className="fas fa-check-circle" style={{ fontSize: '32px', color: '#10b981' }}></i>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#2c2c2c' }}>
                Xác nhận đã nhận hàng
              </h2>
            </div>
            <p style={{ 
              fontSize: '15px', 
              color: '#666', 
              textAlign: 'center', 
              marginBottom: '30px',
              lineHeight: '1.6',
            }}>
              Bạn đã nhận được đơn hàng này?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (!isConfirmingDelivered) {
                    setShowConfirmDeliveredModal(false);
                    setOrderIdToConfirm(null);
                  }
                }}
                disabled={isConfirmingDelivered}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f0f0f0',
                  color: '#2c2c2c',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isConfirmingDelivered ? 'not-allowed' : 'pointer',
                  opacity: isConfirmingDelivered ? 0.6 : 1,
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelivered}
                disabled={isConfirmingDelivered}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isConfirmingDelivered ? 'not-allowed' : 'pointer',
                  opacity: isConfirmingDelivered ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isConfirmingDelivered ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Xác nhận
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrderDetail && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Viết đánh giá</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Sản phẩm: {selectedOrderDetail.flowerName || 'Sản phẩm'}
                </label>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Đánh giá (sao):
                </label>
                <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i
                      key={i}
                      className={i <= reviewRating ? 'fas fa-star' : 'far fa-star'}
                      style={{ 
                        color: i <= reviewRating ? '#FFD700' : '#ddd', 
                        fontSize: '28px',
                      }}
                      onClick={() => setReviewRating(i)}
                    ></i>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                  Nội dung đánh giá:
                </label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows="5"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e8e8e8',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    color: '#2c2c2c',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFeedback}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#E95473',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isCreatingFeedback ? 'not-allowed' : 'pointer',
                    opacity: isCreatingFeedback ? 0.6 : 1,
                  }}
                >
                  {isCreatingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default ProfilePage;
