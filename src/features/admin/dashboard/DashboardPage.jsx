import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { Package, Users, ShoppingBag, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useGetAllFlowersQuery } from '../../../api/flowers/flowerApi';
import { useGetAllOrdersQuery } from '../../../api/orders/orderApi';
import { useGetAllUsersQuery } from '../../../api/users/userApi';
import '../../../assets/css/admin.css';

const DashboardPage = () => {
  const { data: flowersData } = useGetAllFlowersQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    revenueGrowth: 12.5, // Fake growth percentage for demo
    ordersGrowth: 8.3,
    usersGrowth: 15.2,
    productsGrowth: 5.1,
  });

  // Calculate stats from API data
  useEffect(() => {
    if (flowersData?.data) {
      setStats(prev => ({ ...prev, totalProducts: flowersData.data.length || 0 }));
    }
    if (ordersData?.data) {
      const orders = ordersData.data;
      setStats(prev => ({ 
        ...prev, 
        totalOrders: orders.length || 0,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      }));
    }
    if (usersData?.data) {
      setStats(prev => ({ ...prev, totalUsers: usersData.data.length || 0 }));
    }
  }, [flowersData, ordersData, usersData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatCompactCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}T`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return formatCurrency(value);
  };

  // Stats Cards with improved design
  const statsCards = [
    { 
      title: 'Tổng doanh thu', 
      value: formatCompactCurrency(stats.totalRevenue),
      fullValue: formatCurrency(stats.totalRevenue),
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-500',
      bgIconColor: 'rgba(16, 185, 129, 0.1)',
      growth: stats.revenueGrowth,
    },
    { 
      title: 'Tổng đơn hàng', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag, 
      gradient: 'from-pink-500 to-rose-500',
      bgIconColor: 'rgba(236, 72, 153, 0.1)',
      growth: stats.ordersGrowth,
    },
    { 
      title: 'Tổng tài khoản', 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      gradient: 'from-cyan-500 to-blue-500',
      bgIconColor: 'rgba(6, 182, 212, 0.1)',
      growth: stats.usersGrowth,
    },
    { 
      title: 'Tổng sản phẩm', 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      gradient: 'from-indigo-500 to-purple-500',
      bgIconColor: 'rgba(99, 102, 241, 0.1)',
      growth: stats.productsGrowth,
    },
  ];

  // Process chart data from orders (monthly revenue)
  const revenueChartData = ordersData?.data ? (() => {
    const orders = ordersData.data;
    const monthlyData = {};
    orders.forEach(order => {
      if (order.orderDate || order.createdAt) {
        const date = new Date(order.orderDate || order.createdAt);
        const month = date.getMonth() + 1;
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const monthName = monthNames[month - 1] || `T${month}`;
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = 0;
        }
        monthlyData[monthName] += order.totalAmount || 0;
      }
    });
    // Get last 6 months or all available months
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(monthNames[monthIndex]);
    }
    return last6Months.map(name => ({
      name,
      sales: monthlyData[name] || Math.random() * 2000000 + 1000000, // Fake data for demo
    }));
  })() : [
    { name: 'T7', sales: 1500000 },
    { name: 'T8', sales: 2200000 },
    { name: 'T9', sales: 1800000 },
    { name: 'T10', sales: 2500000 },
    { name: 'T11', sales: 3000000 },
    { name: 'T12', sales: 2800000 },
  ];

  // Process order status data for bar chart
  const orderStatusData = ordersData?.data ? (() => {
    const orders = ordersData.data;
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusMap = {
      'DELIVERED': { name: 'Đã giao', color: '#10b981' },
      'DA_NHAN': { name: 'Đã nhận', color: '#10b981' },
      'SHIPPING': { name: 'Đang giao', color: '#3b82f6' },
      'DANG_GIAO': { name: 'Đang giao', color: '#3b82f6' },
      'PROCESSING': { name: 'Đang xử lý', color: '#f59e0b' },
      'DANG_XU_LY': { name: 'Đang xử lý', color: '#f59e0b' },
      'PAID': { name: 'Đã thanh toán', color: '#3b82f6' },
      'PENDING_PAYMENT': { name: 'Chờ thanh toán', color: '#f59e0b' },
      'CANCELLED': { name: 'Đã hủy', color: '#ef4444' },
      'HUY': { name: 'Đã hủy', color: '#ef4444' },
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusMap[status]?.name || status,
      value: count,
      color: statusMap[status]?.color || '#F25C78',
    }));
  })() : [
    { name: 'Đã giao', value: 15 },
    { name: 'Đang giao', value: 8 },
    { name: 'Đang xử lý', value: 5 },
    { name: 'Đã hủy', value: 2 },
  ];

  // Get recent orders (last 5)
  const recentOrders = ordersData?.data ? ordersData.data
    .sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, 5) : [];

  // Get top selling products (products that appear most in order details)
  const topProducts = ordersData?.data ? (() => {
    const productCounts = {};
    ordersData.data.forEach(order => {
      if (order.orderDetails) {
        order.orderDetails.forEach(detail => {
          const productId = detail.flowerId || detail.productId;
          const productName = detail.flowerName || detail.productName || 'Unknown';
          const imagePath = detail.flower?.imagePath || detail.imagePath || '';
          if (!productCounts[productId]) {
            productCounts[productId] = {
              id: productId,
              name: productName,
              image: imagePath,
              quantity: 0,
              revenue: 0,
            };
          }
          productCounts[productId].quantity += detail.quantity || 0;
          productCounts[productId].revenue += detail.totalPrice || (detail.unitPrice || 0) * (detail.quantity || 0);
        });
      }
    });
    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  })() : [];

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge-default';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('da-nhan') || statusLower.includes('da_nhan')) {
      return 'status-badge-success';
    }
    if (statusLower.includes('shipping') || statusLower.includes('dang-giao') || statusLower.includes('dang_giao')) {
      return 'status-badge-info';
    }
    if (statusLower.includes('processing') || statusLower.includes('dang-xu-ly') || statusLower.includes('dang_xu_ly')) {
      return 'status-badge-warning';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('huy')) {
      return 'status-badge-danger';
    }
    return 'status-badge-default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="admin-content-wrapper" style={{ background: '#f3f4f6', minHeight: '100vh' }}>
        {/* Content Header */}
        <div className="content-header" style={{ background: 'transparent', border: 'none', paddingBottom: '0' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Quản lý hệ thống</p>
          </div>
        </div>

        {/* Stats Section - Top Row */}
        <div className="stats-section" style={{ marginTop: '0' }}>
          <div className="stats-grid stats-grid-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const isPositive = stat.growth >= 0;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="stat-card-premium"
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {/* Background Icon */}
                  <div 
                    style={{ 
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: 0.08,
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={80} color="#E95473" strokeWidth={1.5} />
                  </div>
                  
                  <div className="stat-content">
                    <div 
                      className="stat-icon-premium"
                      style={{
                        background: stat.gradient.includes('emerald') ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' :
                                   stat.gradient.includes('pink') ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                                   stat.gradient.includes('cyan') ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' :
                                   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      }}
                    >
                      <Icon size={24} color="#ffffff" strokeWidth={2} />
                    </div>
                    <div className="stat-info-premium">
                      <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#2c2c2c', margin: '0 0 8px 0' }}>
                        {stat.value}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0', fontWeight: '500' }}>
                        {stat.title}
                      </p>
                      {/* Trend Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isPositive ? (
                          <TrendingUp size={16} color="#10b981" />
                        ) : (
                          <TrendingDown size={16} color="#ef4444" />
                        )}
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: '600',
                          color: isPositive ? '#10b981' : '#ef4444'
                        }}>
                          {isPositive ? '+' : ''}{stat.growth}% vs tháng trước
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Charts Section - 2 Columns (70/30) */}
        <div className="charts-section-premium" style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '24px',
          marginTop: '32px'
        }}>
          {/* Left: Revenue Chart (70%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="chart-card-premium"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>Doanh thu theo tháng</h3>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F25C78" stopOpacity={0.4}/>
                      <stop offset="50%" stopColor="#F472B6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FCE7F3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}} 
                    tickFormatter={(value) => {
                      if (value === 0) return '0';
                      const millions = value / 1000000;
                      return millions < 1 ? `${millions.toFixed(1)}M` : `${Math.round(millions)}M`;
                    }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#F25C78" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right: Top Products Widget (30%) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="chart-card-premium"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>Sản phẩm bán chạy</h3>
            </div>
            <div className="top-products-list">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <Link
                    key={product.id || index}
                    to={`/admin/products/edit/${product.id}`}
                    className="top-product-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#2c2c2c',
                      transition: 'all 0.2s ease',
                      marginBottom: index < topProducts.length - 1 ? '8px' : '0',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f3f4f6',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="font-size: 24px;">🌹</div>';
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '24px' }}>🌹</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#2c2c2c',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        Đã bán: {product.quantity} • {formatCompactCurrency(product.revenue)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Status Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="chart-card-premium"
          style={{ marginTop: '24px' }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c2c2c', marginBottom: '24px' }}>Đơn hàng theo trạng thái</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              {orderStatusData.length > 0 ? (
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}} 
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F25C78" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="chart-card-premium"
          style={{ marginTop: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c2c2c', margin: 0 }}>Đơn hàng mới nhất</h3>
            <Link 
              to="/admin/orders" 
              style={{ 
                fontSize: '14px', 
                color: '#F25C78', 
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Xem tất cả
              <ArrowUpRight size={16} color="#F25C78" />
            </Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const customerName = order.account?.fullName || 
                                        order.user?.fullName || 
                                        order.customer?.fullName || 
                                        order.recipientName || 
                                        'N/A';
                    const totalAmount = order.totalAmount || 0;
                    return (
                      <tr key={order.id || order.orderId}>
                        <td style={{ fontWeight: '600' }}>#{order.id || order.orderId}</td>
                        <td>{customerName}</td>
                        <td>{formatDate(order.orderDate || order.createdAt)}</td>
                        <td style={{ fontWeight: '600', color: '#F25C78' }}>
                          {formatCurrency(totalAmount)}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(order.status)}>
                            {order.status || 'Đang xử lý'}
                          </span>
                        </td>
                        <td>
                          <Link 
                            to={`/admin/orders/${order.id || order.orderId}`}
                            style={{ 
                              color: '#F25C78', 
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="empty-state">
                        <p>Chưa có đơn hàng nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
