import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetOrderByIdQuery } from '../../../api/orders/orderApi';
import { useGetMeQuery } from '../../../api/users/userApi';
import '../../../assets/css/detail.css';
import '../../../assets/css/home.css';
import '../../../assets/css/account.css';
import Toast from '../../../components/ui/Toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Gọi API để lấy chi tiết đơn hàng
  const { data: orderResponse, isLoading: isLoadingOrder, error: orderError } = useGetOrderByIdQuery(id);
  const order = orderResponse?.data || {};

  // Gọi API để lấy thông tin account
  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || {};

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
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'REQUEST': 'Chờ xác nhận',
      'DELIVERY': 'Đang giao',
      'COMPLETED': 'Đã hoàn thành',
      'REJECTED': 'Đã từ chối',
    };
    return statusMap[status] || status || 'N/A';
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
                <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                  {getStatusText(order.status)}
                </p>
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
    </CustomerLayout>
  );
};

export default OrderDetailPage;
