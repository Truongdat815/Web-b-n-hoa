import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { 
  useGetOrderByIdQuery, 
  useUpdateOrderToProcessingMutation,
  useUpdateOrderToShippingMutation,
  useUpdateOrderToDeliveredMutation,
} from '../../../api/orders/orderApi';
import { useGetUserByIdQuery } from '../../../api/users/userApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [updateOrderToProcessing, { isLoading: isUpdatingToProcessing }] = useUpdateOrderToProcessingMutation();
  const [updateOrderToShipping, { isLoading: isUpdatingToShipping }] = useUpdateOrderToShippingMutation();
  const [updateOrderToDelivered, { isLoading: isUpdatingToDelivered }] = useUpdateOrderToDeliveredMutation();
  
  const isUpdatingStatus = isUpdatingToProcessing || isUpdatingToShipping || isUpdatingToDelivered;

  // Gọi API để lấy chi tiết đơn hàng
  const { data: orderResponse, isLoading, error, refetch } = useGetOrderByIdQuery(id);
  const order = orderResponse?.data || {};
  
  // Debug: Log order structure để kiểm tra
  console.log('Order data:', order);
  
  // Lấy customerId từ order (theo API response structure)
  const customerId = order.customerId;
  
  // Gọi API để lấy thông tin customer nếu có customerId
  const { data: userResponse } = useGetUserByIdQuery(customerId, { skip: !customerId });
  const userInfo = userResponse?.data || {};

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status label - đồng bộ với customer
  const getStatusLabel = (status) => {
    if (!status) return 'N/A';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'PENDING_PAYMENT': 'Chờ thanh toán',
      'COMPLETED': 'Đã thanh toán',
      'PAID': 'Đã thanh toán',
      'PROCESSING': 'Đang chuẩn bị hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'DELIVERY': 'Đang giao',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'REJECTED': 'Đã từ chối',
    };
    return statusMap[normalizedStatus] || status || 'N/A';
  };

  const getStatusColor = (status) => {
    if (!status) return '#6b7280';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const colorMap = {
      'PENDING': '#f59e0b',
      'PENDING_PAYMENT': '#f59e0b',
      'COMPLETED': '#10b981',
      'PAID': '#3b82f6',
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

  const getStatusBgColor = (status) => {
    if (!status) return '#f3f4f6';
    const normalizedStatus = String(status).toUpperCase().trim();
    
    const colorMap = {
      'PENDING': '#fef3c7',
      'PENDING_PAYMENT': '#fef3c7',
      'COMPLETED': '#d1fae5',
      'PAID': '#dbeafe',
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

  const handleStatusChange = async (newStatus) => {
    try {
      let result;
      if (newStatus === 'PROCESSING') {
        result = await updateOrderToProcessing(id).unwrap();
      } else if (newStatus === 'SHIPPING') {
        result = await updateOrderToShipping(id).unwrap();
      } else if (newStatus === 'DELIVERED') {
        result = await updateOrderToDelivered(id).unwrap();
      } else {
        throw new Error('Invalid status');
      }
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update status error:', error);
      showToast(error?.data?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  // Get next status and button text for admin
  const getNextStatusInfo = (currentStatus) => {
    if (!currentStatus) return null;
    const normalizedStatus = String(currentStatus).toUpperCase().trim();
    
    // Flow: PENDING/COMPLETED -> PROCESSING -> SHIPPING -> DELIVERED (customer confirms)
    if (normalizedStatus === 'PENDING' || normalizedStatus === 'COMPLETED' || normalizedStatus === 'PAID') {
      return {
        nextStatus: 'PROCESSING',
        buttonText: 'Đang chuẩn bị hàng',
        buttonColor: '#3b82f6',
      };
    }
    if (normalizedStatus === 'PROCESSING') {
      return {
        nextStatus: 'SHIPPING',
        buttonText: 'Đang giao hàng',
        buttonColor: '#8b5cf6',
      };
    }
    // SHIPPING and DELIVERED don't have next status buttons for admin
    // Customer will confirm DELIVERED themselves
    return null;
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Lấy thông tin người đặt từ customerId (theo API response)
  // Get user info from API response
  const ordererName = userInfo?.fullName || 
                      order.customerName ||
                      userInfo?.username ||
                      'N/A';
  const ordererEmail = userInfo?.email || order.customerEmail || 'N/A';
  const ordererPhone = userInfo?.phone || 'N/A';

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>Chi tiết Đơn hàng</h1>
            <p>Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const orderId = order.id || order.orderId || id;
  
  if (error || (!order.id && !order.orderId)) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>Chi tiết Đơn hàng</h1>
            <p style={{ color: '#ef4444' }}>
              {error?.data?.message || 'Không tìm thấy đơn hàng'}
            </p>
            <button
              onClick={() => navigate('/admin/orders')}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Quay lại danh sách
            </button>
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
            <h1>Chi tiết Đơn hàng #{orderId}</h1>
            <p>Thông tin chi tiết đơn hàng</p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
        </div>

        {/* Section 1: Thông tin đơn hàng */}
        <div className="admin-form-container" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Thông tin đơn hàng</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                MÃ ĐƠN HÀNG:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>{order.orderCode || order.orderId || order.id || orderId}</p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                TRẠNG THÁI:
              </label>
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
                  {getStatusLabel(order.status)}
                </span>
                {(() => {
                  const nextStatusInfo = getNextStatusInfo(order.status);
                  if (!nextStatusInfo) return null;
                  
                  return (
                    <button
                      onClick={() => handleStatusChange(nextStatusInfo.nextStatus)}
                      disabled={isUpdatingStatus}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: nextStatusInfo.buttonColor,
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '14px',
                        border: 'none',
                        cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isUpdatingStatus ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isUpdatingStatus) {
                          e.target.style.opacity = '0.9';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUpdatingStatus) {
                          e.target.style.opacity = '1';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {isUpdatingStatus ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-arrow-right"></i>
                          {nextStatusInfo.buttonText}
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                NGÀY ĐẶT:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                {formatDateTime(order.orderDate)}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                TỔNG TIỀN:
              </label>
              <p style={{ fontSize: '15px', color: '#E95473', fontWeight: '600' }}>
                {formatPrice(order.totalPayment || order.totalAmount || order.totalPrice || order.amount || 0)}
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

        {/* Section 2: Thông tin người đặt */}
        <div className="admin-form-container" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Thông tin người đặt</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                HỌ TÊN:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>{ordererName}</p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                EMAIL:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>{ordererEmail}</p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                SỐ ĐIỆN THOẠI:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>{ordererPhone}</p>
            </div>
          </div>
        </div>

        {/* Section 2b: Thông tin người nhận */}
        <div className="admin-form-container" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Thông tin người nhận</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                TÊN NGƯỜI NHẬN:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                {order.recipientName || 'N/A'}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                SỐ ĐIỆN THOẠI:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                {order.recipientPhone || 'N/A'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                ĐỊA CHỈ GIAO HÀNG:
              </label>
              <p style={{ fontSize: '15px', color: '#2c2c2c', fontWeight: '500' }}>
                {order.recipientAddress || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Chi tiết sản phẩm */}
        <div className="admin-form-container">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Chi tiết sản phẩm</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Số bó</th>
                  <th>Đơn giá</th>
                  <th>Giảm giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.orderDetails && order.orderDetails.length > 0 ? (
                  order.orderDetails.map((detail, index) => (
                    <tr key={detail.orderDetailId || index}>
                      <td>{index + 1}</td>
                      <td>{detail.flowerName || detail.productName || 'N/A'}</td>
                      <td>{detail.quantity || 0}</td>
                      <td>{formatPrice(detail.unitPrice || detail.price)}</td>
                      <td>{detail.discountAmount > 0 ? formatPrice(detail.discountAmount) : '-'}</td>
                      <td style={{ fontWeight: '600', color: '#E95473' }}>
                        {formatPrice(detail.totalPrice || (detail.unitPrice || 0) * (detail.quantity || 0))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="empty-state">
                        <p>Không có sản phẩm nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
              <p style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Phí vận chuyển:</p>
              <p style={{ fontSize: '14px', color: '#E95473', fontWeight: '600' }}>
                {formatPrice(order.shippingFee || 0)}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
              <p style={{ fontSize: '16px', color: '#2c2c2c', fontWeight: '700' }}>Tổng cộng:</p>
              <p style={{ fontSize: '16px', color: '#E95473', fontWeight: '700' }}>
                {formatPrice(order.totalAmount || order.totalPrice || order.amount || 0)}
              </p>
            </div>
          </div>
        </div>

        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;

