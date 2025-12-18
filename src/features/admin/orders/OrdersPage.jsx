import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllOrdersQuery, useUpdateOrderToProcessingMutation, useUpdateOrderToShippingMutation } from '../../../api/orders/orderApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const OrdersPage = () => {
  const { data: response, isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrderToProcessing] = useUpdateOrderToProcessingMutation();
  const [updateOrderToShipping] = useUpdateOrderToShippingMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const orders = response?.data || [];

  const filteredOrders = orders.filter(order => {
    const customerName = order.customerName || '';
    const orderCode = order.orderCode || '';
    const matchesSearch = !searchQuery || 
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId?.toString().includes(searchQuery);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Chờ thanh toán',
      'PROCESSING': 'Đang chuẩn bị hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'COMPLETED': 'Đã thanh toán',
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

  const handleUpdateToProcessing = async (orderId) => {
    try {
      await updateOrderToProcessing(orderId).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update to processing error:', error);
      showToast(error?.data?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  const handleUpdateToShipping = async (orderId) => {
    try {
      await updateOrderToShipping(orderId).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update to shipping error:', error);
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
            <option value="PENDING">Chờ thanh toán</option>
            <option value="COMPLETED">Đã thanh toán</option>
            <option value="PROCESSING">Đang chuẩn bị hàng</option>
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
                <th>MÃ ĐƠN HÀNG</th>
                <th>KHÁCH HÀNG</th>
                <th>NGÀY ĐẶT</th>
                <th>TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
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
                  const orderId = order.orderId;
                  const orderCode = order.orderCode || order.orderId;
                  const customerName = order.customerName || 'N/A';
                  const totalPayment = order.totalPayment || 0;
                  const status = order.status || 'PENDING';
                  
                  const getStatusColor = (status) => {
                    const colorMap = {
                      'PENDING': '#f59e0b',
                      'COMPLETED': '#10b981',
                      'PROCESSING': '#3b82f6',
                      'SHIPPING': '#8b5cf6',
                      'DELIVERED': '#10b981',
                      'CANCELLED': '#ef4444',
                    };
                    return colorMap[status] || '#6b7280';
                  };

                  // Determine which button to show based on status
                  const renderStatusButton = () => {
                    if (status === 'COMPLETED') {
                      return (
                        <button
                          onClick={() => handleUpdateToProcessing(orderId)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#3b82f6';
                          }}
                        >
                          Đang chuẩn bị hàng
                        </button>
                      );
                    } else if (status === 'PROCESSING') {
                      return (
                        <button
                          onClick={() => handleUpdateToShipping(orderId)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#8b5cf6',
                            color: '#ffffff',
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#7c3aed';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#8b5cf6';
                          }}
                        >
                          Đang giao hàng
                        </button>
                      );
                    }
                    // PENDING, SHIPPING, DELIVERED, CANCELLED - no button
                    return null;
                  };
                  
                  return (
                    <tr key={orderId}>
                      <td>{orderCode}</td>
                      <td>{customerName}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{formatCurrency(totalPayment)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: getStatusColor(status) + '20',
                              color: getStatusColor(status),
                              fontWeight: '500',
                              fontSize: '13px',
                              border: `1px solid ${getStatusColor(status)}`,
                            }}
                          >
                            {getStatusLabel(status)}
                          </span>
                          {renderStatusButton()}
                        </div>
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
