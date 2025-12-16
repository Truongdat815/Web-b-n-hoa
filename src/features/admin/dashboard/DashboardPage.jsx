import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { Package, Users, ShoppingBag, DollarSign, PlusCircle, List, UserPlus, Edit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../../assets/css/admin.css';

const DashboardPage = () => {
  // Quick Actions
  const quickActions = [
    { icon: PlusCircle, label: 'Thêm sản phẩm', path: '/admin/products/new', color: 'from-blue-500 to-indigo-500' },
    { icon: List, label: 'Xem đơn hàng', path: '/admin/orders', color: 'from-green-500 to-emerald-500' },
    { icon: UserPlus, label: 'Thêm tài khoản', path: '/admin/users/new', color: 'from-purple-500 to-pink-500' },
    { icon: Edit, label: 'Quản lý sản phẩm', path: '/admin/products', color: 'from-orange-500 to-red-500' },
  ];

  // Stats Cards
  const stats = [
    { 
      title: 'Tổng sản phẩm', 
      value: '48', 
      icon: Package, 
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'Tổng đơn hàng', 
      value: '24', 
      icon: ShoppingBag, 
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      title: 'Tổng tài khoản', 
      value: '156', 
      icon: Users, 
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      title: 'Tổng doanh thu', 
      value: '125.8M ₫', 
      icon: DollarSign, 
      gradient: 'from-emerald-500 to-teal-500'
    },
  ];

  const chartData = [
    { name: 'T2', sales: 4000000 },
    { name: 'T3', sales: 3000000 },
    { name: 'T4', sales: 2000000 },
    { name: 'T5', sales: 2780000 },
    { name: 'T6', sales: 1890000 },
    { name: 'T7', sales: 2390000 },
    { name: 'CN', sales: 3490000 },
  ];

  const orderStatusData = [
    { name: 'Đã giao hàng', value: 45, color: '#10b981' },
    { name: 'Đang xử lý', value: 30, color: '#3b82f6' },
    { name: 'Chờ thanh toán', value: 15, color: '#f59e0b' },
    { name: 'Đã hủy', value: 10, color: '#ef4444' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

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
          <div className="stats-grid">
            {stats.map((stat, index) => {
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
                    <h3>{stat.value}</h3>
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
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
