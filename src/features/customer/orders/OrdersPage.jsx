import { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetMyOrdersQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from '../../../api/orders/orderApi';
import '../../../assets/css/orders.css';

const OrdersPage = () => {
  const { data: ordersResponse, isLoading, error } = useGetMyOrdersQuery();
  const [cancelOrder] = useCancelOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  
  const orders = ordersResponse?.data || [];

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase().replace(/\s+/g, '-');
    if (statusLower.includes('da-nhan') || statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'delivered';
    }
    if (statusLower.includes('dang-giao') || statusLower.includes('shipping') || statusLower.includes('processing')) {
      return 'shipping';
    }
    if (statusLower.includes('cho-xac-nhan') || statusLower.includes('pending')) {
      return 'pending';
    }
    if (statusLower.includes('da-xac-nhan') || statusLower.includes('approved')) {
      return 'approved';
    }
    if (statusLower.includes('huy') || statusLower.includes('cancelled')) {
      return 'cancelled';
    }
    return 'default';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    try {
      await cancelOrder(orderId).unwrap();
      alert('Hủy đơn hàng thành công!');
    } catch (error) {
      alert(error?.data?.message || 'Hủy đơn hàng thất bại!');
    }
  };

  // Handle received order
  const handleReceivedOrder = async (orderId) => {
    if (!window.confirm('Bạn đã nhận được đơn hàng này?')) {
      return;
    }
    try {
      await updateOrderStatus({ orderId, status: 'DA_NHAN' }).unwrap();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      alert(error?.data?.message || 'Cập nhật trạng thái thất bại!');
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="orders-page-container">
          <div className="orders-loading">Đang tải đơn hàng...</div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="orders-page-container">
          <div className="orders-empty-state">
            <div className="orders-empty-title">Lỗi tải đơn hàng</div>
            <div className="orders-empty-text">Vui lòng thử lại sau.</div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="orders-page-container">
        <h1 className="orders-page-title">Đơn hàng của bạn</h1>

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <div className="orders-empty-icon">📦</div>
            <div className="orders-empty-title">Chưa có đơn hàng nào</div>
            <div className="orders-empty-text">Hãy mua sắm để tạo đơn hàng đầu tiên của bạn!</div>
          </div>
        ) : (
          <div className="orders-cards-container">
            {orders.map((order) => {
              // Debug: log order structure (remove after debugging)
              // console.log('Order:', order);
              
              // Get first order detail for main product display
              const firstOrderDetail = order.orderDetails?.[0] || order.orderDetailList?.[0];
              
              // Try multiple possible paths for product data
              // OrderDetail might have flowerName and imagePath directly, or nested in flower object
              const productImage = firstOrderDetail?.imagePath || 
                                   firstOrderDetail?.flower?.imagePath || 
                                   firstOrderDetail?.flowerColor?.flower?.imagePath ||
                                   'https://via.placeholder.com/400?text=No+Image';
              const productName = firstOrderDetail?.flowerName || 
                                  firstOrderDetail?.flower?.flowerName ||
                                  firstOrderDetail?.flowerColor?.flower?.flowerName ||
                                  'Sản phẩm';
              const quantity = firstOrderDetail?.quantity || 1;
              
              // Try multiple possible fields for total amount
              const totalAmount = order.totalPayment || order.totalAmount || order.total || 0;
              
              // Get all products in order for summary
              const orderDetails = order.orderDetails || order.orderDetailList || [];
              const totalItems = orderDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || quantity;
              
              // Check if order is completed for review button
              const statusLower = (order.status || '').toLowerCase();
              const isCompleted = statusLower.includes('completed') || 
                                  statusLower.includes('da-nhan') ||
                                  statusLower.includes('delivered') ||
                                  statusLower === 'completed';
              
              return (
                <div key={order.id || order.orderId} className="order-card">
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-card-header-left">
                      <div className="order-card-date">{formatDate(order.createdAt || order.date)}</div>
                      <div className="order-card-id">Mã đơn: #{order.id || order.orderId}</div>
                    </div>
                    <div className="order-card-header-right">
                      <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'Đang xử lý'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Product Display */}
                  <div className="order-card-body">
                    <div className="order-product-image-container">
                      {productImage && productImage !== 'https://via.placeholder.com/400?text=No+Image' ? (
                        <img 
                          src={productImage} 
                          alt={productName} 
                          className="order-product-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            if (!e.target.parentElement.querySelector('.order-product-image-placeholder')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'order-product-image-placeholder';
                              placeholder.textContent = '🌹';
                              e.target.parentElement.appendChild(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="order-product-image-placeholder">🌹</div>
                      )}
                    </div>
                    <div className="order-product-info">
                      <h3 className="order-product-name">{productName}</h3>
                      {totalItems > quantity ? (
                        <div className="order-product-quantity">
                          {quantity} sản phẩm đầu tiên + {totalItems - quantity} sản phẩm khác
                        </div>
                      ) : (
                        <div className="order-product-quantity">Số lượng: {quantity}</div>
                      )}
                      {order.recipientAddress && (
                        <div className="order-product-meta">
                          <div className="order-meta-item">
                            <strong>Địa chỉ:</strong> {order.recipientAddress}
                          </div>
                          {order.recipientPhone && (
                            <div className="order-meta-item">
                              <strong>Điện thoại:</strong> {order.recipientPhone}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="order-card-footer">
                    <div className="order-total-section">
                      <div className="order-total-label">Tổng tiền</div>
                      <div className="order-total-price">{formatPrice(totalAmount)}₫</div>
                    </div>
                    <div className="order-card-actions">
                      {order.status && !order.status.toLowerCase().includes('huy') && !order.status.toLowerCase().includes('cancelled') && (
                        <button
                          className="order-btn-cancel"
                          onClick={() => handleCancelOrder(order.id || order.orderId)}
                        >
                          Hủy đơn
                        </button>
                      )}
                      {order.status && (order.status.toLowerCase().includes('dang-giao') || order.status.toLowerCase().includes('shipping')) && (
                        <button
                          className="order-btn-received"
                          onClick={() => handleReceivedOrder(order.id || order.orderId)}
                        >
                          Đã nhận
                        </button>
                      )}
                      {isCompleted && (
                        <Link
                          to={`/orders/${order.id || order.orderId}#reviews`}
                          className="order-btn-review"
                          style={{ textDecoration: 'none', display: 'inline-block' }}
                        >
                          Đánh giá
                        </Link>
                      )}
                      <Link
                        to={`/orders/${order.id || order.orderId}`}
                        className="order-btn-received"
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default OrdersPage;
