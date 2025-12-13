import { useState } from 'react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { User, Mail, Phone, MapPin, Edit, Save, X, Lock, ShoppingBag, Heart, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const user = useSelector(state => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Call API to update profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  const stats = [
    { icon: <ShoppingBag className="w-6 h-6" />, label: 'Đơn hàng', value: '12', color: 'from-blue-500 to-blue-600' },
    { icon: <Heart className="w-6 h-6" />, label: 'Yêu thích', value: '8', color: 'from-red-500 to-pink-500' },
    { icon: <Package className="w-6 h-6" />, label: 'Đang giao', value: '2', color: 'from-green-500 to-green-600' },
  ];

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-primary/10 to-green-50 py-4">
          <div className="container mx-auto px-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-bold">Hồ sơ</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
              Hồ sơ của tôi
            </h1>
            <p className="text-lg text-gray-600">Quản lý thông tin cá nhân và đơn hàng</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Thông tin cá nhân</h2>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                    >
                      <Edit size={18} />
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                      >
                        <Save size={18} />
                        Lưu
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        <X size={18} />
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                        {formData.fullName || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail size={18} className="text-primary" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                        {formData.email || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={18} className="text-primary" />
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                        {formData.phone || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      Địa chỉ
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                        {formData.address || 'Chưa cập nhật'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Đổi mật khẩu</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-bold hover:shadow-xl transition-all">
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-4">Thao tác nhanh</h3>
                <div className="space-y-3">
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all group"
                  >
                    <Package className="w-5 h-5 text-primary group-hover:text-white" />
                    <span className="font-bold">Đơn hàng của tôi</span>
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all group"
                  >
                    <Heart className="w-5 h-5 text-primary group-hover:text-white" />
                    <span className="font-bold">Sản phẩm yêu thích</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ProfilePage;
