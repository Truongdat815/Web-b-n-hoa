import { motion } from 'framer-motion';
import AdminLayout from '../../../layouts/AdminLayout';
import { Package, Users, ShoppingBag, TrendingUp, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const stats = [
    { title: 'Tổng Doanh Thu', value: '125.8M ₫', color: 'bg-gradient-to-br from-green-600 to-green-700', icon: DollarSign, trend: '+12.5%' },
    { title: 'Đơn Hàng Mới', value: '24', color: 'bg-gradient-to-br from-primary to-green-600', icon: ShoppingBag, trend: '+4' },
    { title: 'Sản Phẩm', value: '48', color: 'bg-gradient-to-br from-pink-500 to-rose-500', icon: Package, trend: 'Hoa Hồng, Lan...' },
    { title: 'Khách Hàng', value: '156', color: 'bg-gradient-to-br from-blue-500 to-indigo-600', icon: Users, trend: 'Thành viên mới' },
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-800"
            >
              Tổng Quan
            </motion.h1>
            <p className="text-gray-500 mt-1">Chào mừng trở lại, chúc bạn một ngày tốt lành!</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-gray-600">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`${stat.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Icon size={24} className="text-white" />
                    </div>
                    {stat.trend && (
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-white/80 font-medium">{stat.title}</p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Icon size={120} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Doanh Thu Tuần Này</h3>
              <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none">
                <option>7 ngày qua</option>
                <option>Tháng này</option>
                <option>Tháng trước</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#81A296" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#81A296" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `${value/1000000}M`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#81A296" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Orders - Replaced Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Đơn Hàng Gần Đây</h3>
            <div className="space-y-4">
              {[
                { name: 'Nguyễn Văn A', item: 'Bó Hoa Hồng Đỏ', time: '5 phút trước', price: '450.000₫', status: 'Mới' },
                { name: 'Trần Thị B', item: 'Lẵng Hoa Khai Trương', time: '15 phút trước', price: '1.200.000₫', status: 'Xử lý' },
                { name: 'Lê Văn C', item: 'Hộp Hoa Baby', time: '30 phút trước', price: '350.000₫', status: 'Giao' },
                { name: 'Phạm Thị D', item: 'Bó Tulip', time: '1 giờ trước', price: '550.000₫', status: 'Hoàn thành' },
              ].map((order, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                    {order.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{order.name}</h4>
                    <p className="text-xs text-gray-500">{order.item}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{order.price}</div>
                    <span className="text-[10px] text-gray-400">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-primary font-medium hover:bg-secondary/30 rounded-lg transition-colors">
              Xem Tất Cả Đơn Hàng
            </button>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
