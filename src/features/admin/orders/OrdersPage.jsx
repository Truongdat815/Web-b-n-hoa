import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../api/orders/orderApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const OrdersPage = () => {
  const { data: response, isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const orders = response?.data || [];

  const filteredOrders = orders.filter(order => {
    const customerName = order.account?.fullName || order.account?.email || '';
    const matchesSearch = !searchQuery || 
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toString().includes(searchQuery);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString) => {
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

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING_PAYMENT': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update status error:', error);
      showToast(error?.data?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>Quản lý Đơn hàng</h1>
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
            <h1>Quản lý Đơn hàng</h1>
            <p>Danh sách tất cả đơn hàng</p>
          </div>
        </div>

        {/* Filter */}
        <div className="admin-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="searchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm đơn hàng..."
            />
          </div>
          <select
            className="filter-select"
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao hàng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="ordersTableBody">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="empty-state">
                      <i className="fas fa-shopping-cart"></i>
                      <p>Không tìm thấy đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  // Lấy tên khách hàng từ nhiều nguồn có thể
                  const customerName = order.account?.fullName || 
                                      order.account?.email || 
                                      order.user?.fullName || 
                                      order.user?.email ||
                                      order.customer?.fullName ||
                                      order.customer?.email ||
                                      order.recipientName ||
                                      'N/A';
                  
                  // Lấy tổng tiền từ nhiều nguồn có thể
                  const totalAmount = order.totalAmount || 
                                     order.totalPrice || 
                                     order.amount || 
                                     (order.orderItems && order.orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)) ||
                                     0;
                  
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

                  const orderId = order.id || order.orderId;
                  
                  return (
                    <tr key={orderId}>
                      <td>{orderId}</td>
                      <td>{customerName}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{formatCurrency(totalAmount)}</td>
                      <td>
                        <select
                          className="status-select"
                          data-id={orderId}
                          value={order.status || 'PENDING_PAYMENT'}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: `2px solid ${getStatusColor(order.status)}`,
                            backgroundColor: '#ffffff',
                            color: getStatusColor(order.status),
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = getStatusColor(order.status);
                            e.target.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.color = getStatusColor(order.status);
                          }}
                        >
                          <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                          <option value="PAID">Đã thanh toán</option>
                          <option value="PROCESSING">Đang xử lý</option>
                          <option value="SHIPPING">Đang giao hàng</option>
                          <option value="DELIVERED">Đã giao hàng</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/orders/${orderId}`}
                          className="btn-view"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {toast.show && (
          <Toast message={toast.message} type={toast.type} />
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
