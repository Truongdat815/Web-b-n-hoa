import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetOrderByIdQuery, useConfirmOrderDeliveredMutation } from '../../../api/orders/orderApi';
import { useGetMeQuery } from '../../../api/users/userApi';
import {
  useGetFeedbacksByOrderDetailQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} from '../../../api/feedbacks/feedbackApi';
import '../../../assets/css/detail.css';
import '../../../assets/css/home.css';
import '../../../assets/css/account.css';
import '../../../assets/css/reviews-elegant.css';
import Toast from '../../../components/ui/Toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmDeliveredModal, setShowConfirmDeliveredModal] = useState(false);

  // Gọi API để lấy chi tiết đơn hàng
  const { data: orderResponse, isLoading: isLoadingOrder, error: orderError } = useGetOrderByIdQuery(id);
  const order = orderResponse?.data || {};

  // Gọi API để lấy thông tin account
  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || {};
  const currentUserId = user.userId || user.id || user.customerId;

  // Feedback mutations
  const [createFeedback, { isLoading: isCreating }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

  // Confirm delivered mutation
  const [confirmOrderDelivered, { isLoading: isConfirmingDelivered }] = useConfirmOrderDeliveredMutation();

  // Get order details
  const orderDetails = order.orderDetails || [];
  
  // Component to handle review for a single order detail
  const OrderDetailReview = ({ orderDetail }) => {
    const { data: feedbackResponse, refetch: refetchFeedback } = useGetFeedbacksByOrderDetailQuery(
      orderDetail.orderDetailId,
      { skip: !orderDetail.orderDetailId }
    );
    // API trả về object trực tiếp, không phải array
    const existingFeedback = feedbackResponse?.data || null;
    
    const [rating, setRating] = useState(existingFeedback?.rating || 5);
    const [comment, setComment] = useState('');
    const [editing, setEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!comment.trim()) {
        showToast('Vui lòng nhập bình luận!', 'warning');
        return;
      }

      try {
        await createFeedback({
          orderDetailId: orderDetail.orderDetailId,
          rating: rating,
          content: comment,
        }).unwrap();
        
        setComment('');
        setRating(5);
        setShowForm(false);
        refetchFeedback();
        showToast('Đánh giá đã được gửi thành công!', 'success');
      } catch (error) {
        const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
        showToast(errorMessage, 'error');
      }
    };

    const handleEdit = () => {
      if (existingFeedback) {
        setEditing(true);
        setRating(existingFeedback.rating);
        setComment(existingFeedback.content || '');
        setShowForm(true);
      }
    };

    const handleSaveEdit = async (e) => {
      e.preventDefault();
      if (!comment.trim()) {
        showToast('Vui lòng nhập bình luận!', 'warning');
        return;
      }

      try {
        await updateFeedback({
          feedbackId: existingFeedback.feedbackId,
          rating: rating,
          content: comment,
        }).unwrap();
        
        setEditing(false);
        setComment('');
        setRating(5);
        setShowForm(false);
        refetchFeedback();
        showToast('Đánh giá đã được cập nhật thành công!', 'success');
      } catch (error) {
        const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá!';
        showToast(errorMessage, 'error');
      }
    };

    const handleCancel = () => {
      setEditing(false);
      setComment('');
      setRating(5);
      setShowForm(false);
    };

    const handleDelete = async () => {
      if (!existingFeedback) return;
      if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
        try {
          await deleteFeedback(existingFeedback.feedbackId).unwrap();
          refetchFeedback();
          showToast('Đánh giá đã được xóa thành công!', 'success');
        } catch (error) {
          const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá!';
          showToast(errorMessage, 'error');
        }
      }
    };

    const renderStarsDisplay = (ratingValue) => {
      return [1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={i <= ratingValue ? 'fas fa-star filled' : 'far fa-star'}
          style={{ color: i <= ratingValue ? '#FFD700' : '#ddd', fontSize: '18px' }}
        ></i>
      ));
    };

    const formatDateDisplay = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '20px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>
            {orderDetail.flowerName}
          </h4>
          {existingFeedback && !showForm && existingFeedback.customerId === currentUserId && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleEdit}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#2c2c2c',
                }}
              >
                Sửa
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fee',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#d32f2f',
                }}
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        {existingFeedback && !showForm ? (
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {renderStarsDisplay(existingFeedback.rating)}
              </div>
              <span style={{ fontSize: '13px', color: '#666' }}>
                {formatDateDisplay(existingFeedback.createdAt)}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: 0 }}>
              {existingFeedback.content}
            </p>
          </div>
        ) : (
          <form onSubmit={editing ? handleSaveEdit : handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                Đánh giá:
              </label>
              <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <i
                    key={i}
                    className={i <= rating ? 'fas fa-star filled' : 'far fa-star'}
                    style={{ color: i <= rating ? '#FFD700' : '#ddd', fontSize: '24px' }}
                    onClick={() => setRating(i)}
                  ></i>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2c2c2c', marginBottom: '8px' }}>
                Bình luận:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e8e8e8',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical',
                }}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#E95473',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isCreating || isUpdating ? 'not-allowed' : 'pointer',
                  opacity: isCreating || isUpdating ? 0.6 : 1,
                }}
              >
                {isCreating || isUpdating ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Gửi đánh giá'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={handleCancel}
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
              )}
              {!existingFeedback && !showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#E95473',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Viết đánh giá
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    );
  };

  // Format price
  const formatPrice = (price) => {
    return '₫' + parseFloat(price || 0).toLocaleString('vi-VN');
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const padZero = (num) => (num < 10 ? '0' + num : String(num));
    return `${padZero(day)}/${padZero(month)}/${year} ${padZero(hours)}:${padZero(minutes)}`;
  };

  // Get status text
  const getStatusText = (status) => {
    if (!status) return 'N/A';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'REQUEST': 'Chờ xác nhận',
      'COMPLETED': 'Đã thanh toán',
      'PROCESSING': 'Đang chuẩn bị hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã nhận hàng',
      'DELIVERY': 'Đang giao',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'REJECTED': 'Đã từ chối',
    };
    return statusMap[normalizedStatus] || status || 'N/A';
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const colorMap = {
      'PENDING': '#f59e0b',
      'REQUEST': '#f59e0b',
      'COMPLETED': '#10b981',
      'PROCESSING': '#3b82f6',
      'SHIPPING': '#8b5cf6',
      'DELIVERED': '#10b981',
      'DELIVERY': '#8b5cf6',
      'CANCELLED': '#ef4444',
      'CANCELED': '#ef4444',
      'REJECTED': '#ef4444',
    };
    return colorMap[normalizedStatus] || '#6b7280';
  };

  // Get status background color
  const getStatusBgColor = (status) => {
    if (!status) return '#f3f4f6';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const colorMap = {
      'PENDING': '#fef3c7',
      'REQUEST': '#fef3c7',
      'COMPLETED': '#d1fae5',
      'PROCESSING': '#dbeafe',
      'SHIPPING': '#ede9fe',
      'DELIVERED': '#d1fae5',
      'DELIVERY': '#ede9fe',
      'CANCELLED': '#fee2e2',
      'CANCELED': '#fee2e2',
      'REJECTED': '#fee2e2',
    };
    return colorMap[normalizedStatus] || '#f3f4f6';
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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

  // Scroll to reviews section when hash is #reviews
  useEffect(() => {
    if (window.location.hash === '#reviews') {
      setTimeout(() => {
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [id]);


  if (isLoadingOrder || isLoadingUser) {
    return (
      <CustomerLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>Đang tải...</div>
      </CustomerLayout>
    );
  }

  if (orderError || !order.orderId) {
    return (
      <CustomerLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#f44336', marginBottom: '10px' }}>
            {orderError?.data?.message || 'Không tìm thấy đơn hàng'}
          </p>
          <button
            onClick={() => navigate('/profile#orders')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#E95473',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Quay lại
          </button>
        </div>
      </CustomerLayout>
    );
  }

  // Lấy thông tin user từ API /users/me
  const customerName = user?.fullName || user?.username || '';
  const customerEmail = user?.email || '';

  return (
    <CustomerLayout>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/home">Trang chủ</Link>
          <span className="separator">›</span>
          <Link to="/profile#orders">Đơn hàng</Link>
          <span className="separator">›</span>
          <span className="current">Chi tiết đơn hàng</span>
        </div>
      </div>

      {/* Order Detail Section */}
      <section className="product-detail-section">
        <div className="container">
          {/* Header with Title and Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2c2c2c', marginBottom: '8px' }}>
                Chi tiết Đơn hàng #{order.orderId}
              </h1>
              <p style={{ fontSize: '14px', color: '#666' }}>Thông tin chi tiết đơn hàng</p>
            </div>
            <button
              onClick={() => navigate('/profile#orders')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                color: '#2c2c2c',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Quay lại
            </button>
          </div>

          {/* Section 1: Thông tin đơn hàng */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '25px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Thông tin đơn hàng
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                  MÃ ĐƠN HÀNG:
                </p>
                <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>{order.orderCode || order.orderId}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                  TRẠNG THÁI:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: getStatusBgColor(order.status),
                      color: getStatusColor(order.status),
                      fontWeight: '600',
                      fontSize: '14px',
                      border: `2px solid ${getStatusColor(order.status)}`,
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {(order.status === 'SHIPPING' || order.status === 'DELIVERY') && (
                    <button
                      onClick={() => setShowConfirmDeliveredModal(true)}
                      disabled={isConfirmingDelivered}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: 'none',
                        cursor: isConfirmingDelivered ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        opacity: isConfirmingDelivered ? 0.6 : 1,
                      }}
                    >
                      {isConfirmingDelivered ? 'Đang xử lý...' : 'Đã nhận hàng'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                  NGÀY ĐẶT:
                </p>
                <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                  {formatDateTime(order.orderDate)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                  TỔNG TIỀN:
                </p>
                <p style={{ fontSize: '15px', color: '#E95473', fontWeight: '600' }}>
                  {formatPrice(order.totalPayment)}
                </p>
              </div>
            </div>
            {order.notes && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#FFF9E6', border: '2px solid #FFD700', borderRadius: '8px' }}>
                <label style={{ fontSize: '13px', color: '#856404', marginBottom: '8px', display: 'block', fontWeight: '700' }}>
                  📝 LƯU Ý CỦA NGƯỜI ĐẶT:
                </label>
                <p style={{ fontSize: '15px', color: '#856404', fontWeight: '500', margin: 0, lineHeight: '1.6' }}>
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Thông tin khách hàng */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '25px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Thông tin khách hàng
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
              }}
            >
              {/* Cột trái: Thông tin account */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    HỌ TÊN:
                  </p>
                  <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                    {customerName}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    EMAIL:
                  </p>
                  <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                    {customerEmail}
                  </p>
                </div>
              </div>

              {/* Cột phải: Thông tin người nhận */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    TÊN NGƯỜI NHẬN:
                  </p>
                  <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                    {order.recipientName || ''}
                  </p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    SỐ ĐIỆN THOẠI:
                  </p>
                  <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                    {order.recipientPhone || ''}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                    ĐỊA CHỈ GIAO HÀNG:
                  </p>
                  <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                    {order.recipientAddress || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Chi tiết sản phẩm */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '25px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Chi tiết sản phẩm
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f8f8f8' }}>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      STT
                    </th>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      SẢN PHẨM
                    </th>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      SỐ BÓ
                    </th>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      ĐƠN GIÁ
                    </th>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      GIẢM GIÁ
                    </th>
                    <th
                      style={{
                        padding: '12px 15px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2c2c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      THÀNH TIỀN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails && order.orderDetails.length > 0 ? (
                    order.orderDetails.map((detail, index) => {
                      const unitPrice = formatPrice(detail.unitPrice);
                      const discountAmount = formatPrice(detail.discountAmount);
                      const totalPrice = formatPrice(detail.totalPrice);
                      return (
                        <tr key={detail.orderDetailId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#2c2c2c' }}>{index + 1}</td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#2c2c2c', fontWeight: '500' }}>
                            {detail.flowerName}
                          </td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#2c2c2c' }}>
                            {detail.quantity || 0}
                          </td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#2c2c2c' }}>{unitPrice}</td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#E95473', fontWeight: '500' }}>
                            {detail.discountAmount > 0 ? `-${discountAmount}` : '-'}
                          </td>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#2c2c2c', fontWeight: '500' }}>
                            {totalPrice}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Không có sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '2px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
                <p style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Phí vận chuyển:</p>
                <p style={{ fontSize: '14px', color: '#E95473', fontWeight: '600' }}>
                  {formatPrice(order.shippingFee)}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
                <p style={{ fontSize: '16px', color: '#2c2c2c', fontWeight: '700' }}>Tổng cộng:</p>
                <p style={{ fontSize: '16px', color: '#E95473', fontWeight: '700' }}>
                  {formatPrice(order.totalPayment)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                onClick={async () => {
                  try {
                    await confirmOrderDelivered(order.orderId).unwrap();
                    showToast('Xác nhận đã nhận hàng thành công!', 'success');
                    setShowConfirmDeliveredModal(false);
                    // Refetch order data
                    window.location.reload();
                  } catch (error) {
                    const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi xác nhận đã nhận hàng!';
                    showToast(errorMessage, 'error');
                  }
                }}
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
    </CustomerLayout>
  );
};

export default OrderDetailPage;
