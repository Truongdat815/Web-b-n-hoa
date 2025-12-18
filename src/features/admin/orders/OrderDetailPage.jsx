import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '../../../api/orders/orderApi';
import { useGetUserByIdQuery } from '../../../api/users/userApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Gọi API để lấy chi tiết đơn hàng
  const { data: orderResponse, isLoading, error, refetch } = useGetOrderByIdQuery(id);
  const order = orderResponse?.data || {};
  
  // Debug: Log order structure để kiểm tra
  console.log('Order data:', order);
  
  // Lấy userId/accountId từ order (kiểm tra nhiều field có thể có)
  const userId = order.accountId || 
                 order.userId || 
                 order.account?.accountId ||
                 order.account?.id ||
                 order.user?.userId ||
                 order.user?.id ||
                 order.customerId ||
                 order.customer?.id;
  
  // Gọi API để lấy thông tin user nếu có userId
  const { data: userResponse } = useGetUserByIdQuery(userId, { skip: !userId });
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

  // Get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING_PAYMENT': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status || 'N/A';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING_PAYMENT': '#f59e0b',
      'PAID': '#3b82f6',
      'PROCESSING': '#3b82f6',
      'SHIPPING': '#8b5cf6',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444',
    };
    return colorMap[status] || '#6b7280';
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus({ orderId: id, status: newStatus }).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update status error:', error);
      showToast(error?.data?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Lấy thông tin người đặt (account/user) - ưu tiên từ API getUserById, sau đó từ order object
  const ordererName = userInfo?.fullName || 
                      order.account?.fullName || 
                      order.user?.fullName || 
                      order.customer?.fullName ||
                      userInfo?.email ||
                      order.account?.email || 
                      order.user?.email ||
                      order.customer?.email ||
                      'N/A';
  const ordererEmail = userInfo?.email || 
                       order.account?.email || 
                       order.user?.email || 
                       order.customer?.email || 
                       'N/A';

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
              <select
                className="status-select"
                value={order.status || 'PENDING_PAYMENT'}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `2px solid ${getStatusColor(order.status)}`,
                  backgroundColor: '#ffffff',
                  color: getStatusColor(order.status),
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
              >
                <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="SHIPPING">Đang giao hàng</option>
                <option value="DELIVERED">Đã giao hàng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
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
                {formatPrice(order.totalAmount || order.totalPrice || order.amount || 0)}
              </p>
            </div>
          </div>
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
                  <th>Số bông/bó</th>
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
                      <td>{detail.unitQuantity || 0}</td>
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
                    <td colSpan="7" className="text-center">
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

