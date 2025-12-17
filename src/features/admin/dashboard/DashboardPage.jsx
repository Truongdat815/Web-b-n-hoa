import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { Package, Users, ShoppingBag, DollarSign, PlusCircle, List, UserPlus, Edit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useGetAllFlowerColorsQuery } from '../../../api/flowers/flowerColorApi';
import { useGetAllOrdersQuery } from '../../../api/orders/orderApi';
import { useGetAllUsersQuery } from '../../../api/users/userApi';
import '../../../assets/css/admin.css';

const DashboardPage = () => {
  const { data: flowerColorsData } = useGetAllFlowerColorsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  // Quick Actions
  const quickActions = [
    { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/admin/products/new', color: 'from-blue-500 to-indigo-500' },
    { icon: List, label: 'Xem đơn hàng', path: '/admin/orders', color: 'from-green-500 to-emerald-500' },
    { icon: UserPlus, label: 'Thêm tài khoản', path: '/admin/users/new', color: 'from-purple-500 to-pink-500' },
    { icon: Edit, label: 'Quản lý sản phẩm', path: '/admin/products', color: 'from-orange-500 to-red-500' },
  ];

  // Calculate stats from API data
  useEffect(() => {
    // "Sản phẩm" trong admin list là FlowerColor (biến thể màu/giá), nên dashboard cũng đếm theo đó
    if (flowerColorsData?.data) {
      setStats(prev => ({ ...prev, totalProducts: flowerColorsData.data.length || 0 }));
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
  }, [flowerColorsData, ordersData, usersData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return value.toString();
  };

  // Stats Cards
  const statsCards = [
    { 
      title: 'Tổng sản phẩm', 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'Tổng đơn hàng', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingBag, 
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      title: 'Tổng tài khoản', 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      title: 'Tổng doanh thu', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-500'
    },
  ];

  // Process chart data from orders
  const chartData = ordersData?.data ? (() => {
    const orders = ordersData.data;
    const weeklyData = {};
    orders.forEach(order => {
      if (order.orderDate) {
        const date = new Date(order.orderDate);
        const dayOfWeek = date.getDay();
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[dayOfWeek];
        if (!weeklyData[dayName]) {
          weeklyData[dayName] = { sales: 0, orders: 0 };
        }
        weeklyData[dayName].sales += order.totalAmount || 0;
        weeklyData[dayName].orders += 1;
      }
    });
    return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(name => ({
      name,
      sales: weeklyData[name]?.sales || 0,
      orders: weeklyData[name]?.orders || 0,
    }));
  })() : [
    { name: 'T2', sales: 0, orders: 0 },
    { name: 'T3', sales: 0, orders: 0 },
    { name: 'T4', sales: 0, orders: 0 },
    { name: 'T5', sales: 0, orders: 0 },
    { name: 'T6', sales: 0, orders: 0 },
    { name: 'T7', sales: 0, orders: 0 },
    { name: 'CN', sales: 0, orders: 0 },
  ];

  // Process order status data
  const orderStatusData = ordersData?.data ? (() => {
    const orders = ordersData.data;
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusMap = {
      'DELIVERED': { name: 'Đã giao hàng', color: '#10b981' },
      'SHIPPING': { name: 'Đang giao hàng', color: '#3b82f6' },
      'PROCESSING': { name: 'Đang xử lý', color: '#3b82f6' },
      'PAID': { name: 'Đã thanh toán', color: '#3b82f6' },
      'PENDING_PAYMENT': { name: 'Chờ thanh toán', color: '#f59e0b' },
      'CANCELLED': { name: 'Đã hủy', color: '#ef4444' },
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusMap[status]?.name || status,
      value: count,
      color: statusMap[status]?.color || '#8884d8',
    }));
  })() : [];

  return (
    <AdminLayout>
      <div className="admin-content-wrapper">
        {/* Content Header */}
        <div className="content-header">
          <div>
            <h1>Dashboard</h1>
            <p>Quản lý hệ thống</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Thao tác nhanh</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Link to={action.path} className={`action-card bg-gradient-to-br ${action.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                    <span>{action.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2>Thống kê tổng quan</h2>
          <div className="stats-grid stats-grid-4">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="stat-card"
                >
                  <div className={`stat-icon bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="stat-info">
                    <h3 id={stat.title === 'Tổng sản phẩm' ? 'totalProducts' : 
                            stat.title === 'Tổng đơn hàng' ? 'totalOrders' :
                            stat.title === 'Tổng tài khoản' ? 'totalAccounts' :
                            'totalRevenue'}>
                      {stat.value}
                    </h3>
                    <p>{stat.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="chart-container"
          >
            <h3>Doanh thu theo tháng</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
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
                    tickFormatter={(value) => `${value/1000000}M`} 
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#EC4899" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="chart-container"
          >
            <h3>Đơn hàng theo trạng thái</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                {orderStatusData.length > 0 ? (
                  <BarChart data={chartData}>
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
                    />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" />
                  </BarChart>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p>Chưa có dữ liệu</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
