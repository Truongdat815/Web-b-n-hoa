import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { MapPin, Phone, User, Mail, CreditCard, Truck, Shield, Check, ArrowLeft } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../../../store/slices/cartSlice';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const { totalAmount, totalServiceFee } = useSelector(state => state.cart);
  const products = useSelector(state => state.products.flowerColors);
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPayment = totalAmount + totalServiceFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng nhập quận/huyện';
    if (!formData.ward.trim()) newErrors.ward = 'Vui lòng nhập phường/xã';
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      dispatch(clearCart());
      setIsSubmitting(false);
      navigate('/orders?success=true');
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-black text-gray-800 mb-4">Giỏ hàng trống</h1>
            <p className="text-lg text-gray-600 mb-8">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-black hover:shadow-xl transition-all"
            >
              <ArrowLeft size={20} />
              Quay lại mua sắm
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-primary/10 to-green-50 py-4">
          <div className="container mx-auto px-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
              <span className="text-gray-400">/</span>
              <Link to="/cart" className="hover:text-primary transition-colors font-medium">Giỏ hàng</Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-bold">Thanh toán</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
              Thanh toán
            </h1>
            <p className="text-lg text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Thông tin khách hàng</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Nhập email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                          errors.district ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Nhập quận/huyện"
                      />
                      {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                          errors.ward ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Nhập phường/xã"
                      />
                      {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      placeholder="Ghi chú cho người giao hàng..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-4">
                  {[
                    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: <Truck className="w-6 h-6" /> },
                    { value: 'bank', label: 'Chuyển khoản ngân hàng', icon: <CreditCard className="w-6 h-6" /> },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.paymentMethod === method.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary"
                      />
                      <div className="text-primary">{method.icon}</div>
                      <span className="font-bold text-gray-800">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="bg-gradient-to-br from-white via-pink-50/50 to-green-50/50 rounded-2xl shadow-2xl p-8 border-2 border-primary/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary via-green-600 to-primary rounded-xl flex items-center justify-center shadow-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Đơn hàng</h2>
                </div>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => {
                    const product = products.find(p => p.flower_color_id === item.flower_color_id);
                    const flower = product ? flowers.find(f => f.flower_id === product.flower_id) : null;
                    const color = product ? colors.find(c => c.color_id === product.color_id) : null;
                    const productName = product ? `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim() : 'Sản phẩm';
                    const itemTotal = (product?.unit_price || 0) * item.unit_quantity * item.quantity + item.service_fee;

                    return (
                      <div key={item.flower_color_id} className="flex items-center gap-4 pb-4 border-b border-gray-200">
                        <img
                          src={product?.image_path || 'https://via.placeholder.com/80'}
                          alt={productName}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{productName}</h4>
                          <p className="text-sm text-gray-600">{item.unit_quantity} bông × {item.quantity} bó</p>
                          <p className="text-lg font-black text-primary mt-1">{itemTotal.toLocaleString('vi-VN')}đ</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 mb-6 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold">Tổng tiền hàng:</span>
                    <span className="text-xl font-black text-gray-900">{totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {totalServiceFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-bold">Phí dịch vụ:</span>
                      <span className="text-xl font-black text-gray-900">{totalServiceFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="pt-4">
                    <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-green-50 p-4 rounded-xl">
                      <span className="text-2xl font-black text-gray-900">Tổng thanh toán:</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
                        {totalPayment.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-5 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check size={24} />
                      HOÀN TẤT ĐẶT HÀNG
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="block text-center text-gray-600 hover:text-primary font-bold transition-colors text-lg mt-4"
                >
                  ← Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CheckoutPage;
