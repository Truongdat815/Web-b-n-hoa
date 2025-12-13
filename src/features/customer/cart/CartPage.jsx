import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { Minus, Plus, X, ShoppingCart, ArrowRight, Sparkles, Trash2, Gift, Shield, Truck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart, clearCart } from '../../../store/slices/cartSlice';
import { useState } from 'react';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showNotification, setShowNotification] = useState(false);
  const cartItems = useSelector(state => state.cart.items);
  const { totalQuantity, totalUnitQuantity, totalAmount, totalServiceFee } = useSelector(state => state.cart);

  const products = useSelector(state => state.products.flowerColors);
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);

  const handleUpdateQuantity = (flower_color_id, newQuantity) => {
    const product = products.find(p => p.flower_color_id === flower_color_id);
    if (product && newQuantity <= product.quantity_in_stock) {
      dispatch(updateCartItem({
        flower_color_id,
        quantity: newQuantity,
      }));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const handleUpdateUnitQuantity = (flower_color_id, newUnitQuantity) => {
    dispatch(updateCartItem({
      flower_color_id,
      unit_quantity: newUnitQuantity,
    }));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleRemoveItem = (flower_color_id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      dispatch(removeFromCart(flower_color_id));
    }
  };

  const totalPayment = totalAmount + totalServiceFee;

  return (
    <CustomerLayout>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-in">
          <Sparkles size={24} />
          <span className="font-semibold">Đã cập nhật giỏ hàng!</span>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-primary/10 to-green-50 py-4">
          <div className="container mx-auto px-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-bold">Giỏ hàng</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
              Giỏ hàng của bạn
            </h1>
            <p className="text-lg text-gray-600">Kiểm tra và chỉnh sửa đơn hàng của bạn</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary/20 via-green-100 to-pink-100 rounded-full mb-8 shadow-xl">
                <ShoppingCart className="w-20 h-20 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">Giỏ hàng trống</h2>
              <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl"
              >
                Mua sắm ngay <ArrowRight size={24} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => {
                  const product = products.find(p => p.flower_color_id === item.flower_color_id);
                  const flower = product ? flowers.find(f => f.flower_id === product.flower_id) : null;
                  const color = product ? colors.find(c => c.color_id === product.color_id) : null;
                  const productName = product ? `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim() : 'Sản phẩm';
                  const itemTotal = (product?.unit_price || 0) * item.unit_quantity * item.quantity + item.service_fee;

                  return (
                    <div
                      key={item.flower_color_id}
                      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all group"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <Link to={`/products/${item.flower_color_id}`} className="flex-shrink-0">
                          <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all bg-gradient-to-br from-pink-50 to-green-50">
                            <img
                              src={product?.image_path || 'https://via.placeholder.com/160'}
                              alt={productName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.flower_color_id}`}>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                              {productName}
                            </h3>
                          </Link>
                          <p className="text-gray-600 mb-4 font-semibold">
                            {product?.unit_price.toLocaleString('vi-VN')}đ/bông
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex flex-wrap items-center gap-6 mb-6">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Số bông/bó:</span>
                              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white rounded-xl p-1 border-2 border-gray-100">
                                <button
                                  onClick={() => handleUpdateUnitQuantity(item.flower_color_id, Math.max(1, item.unit_quantity - 1))}
                                  className="w-10 h-10 bg-white hover:bg-primary hover:text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="w-16 text-center font-black text-gray-800 text-lg">{item.unit_quantity}</span>
                                <button
                                  onClick={() => handleUpdateUnitQuantity(item.flower_color_id, item.unit_quantity + 1)}
                                  className="w-10 h-10 bg-white hover:bg-primary hover:text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Số bó:</span>
                              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white rounded-xl p-1 border-2 border-gray-100">
                                <button
                                  onClick={() => handleUpdateQuantity(item.flower_color_id, Math.max(1, item.quantity - 1))}
                                  className="w-10 h-10 bg-white hover:bg-primary hover:text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="w-16 text-center font-black text-gray-800 text-lg">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    if (product && item.quantity + 1 <= product.quantity_in_stock) {
                                      handleUpdateQuantity(item.flower_color_id, item.quantity + 1);
                                    } else {
                                      alert('Số lượng vượt quá tồn kho!');
                                    }
                                  }}
                                  className="w-10 h-10 bg-white hover:bg-primary hover:text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-black bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                                {itemTotal.toLocaleString('vi-VN')}đ
                              </div>
                              <div className="text-sm text-gray-500 font-medium mt-1">
                                {item.unit_quantity} bông × {item.quantity} bó
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.flower_color_id)}
                              className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-500 hover:to-red-600 text-red-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center group"
                            >
                              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Clear All Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
                        dispatch(clearCart());
                      }
                    }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-500 hover:to-red-600 text-red-500 hover:text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    <Trash2 size={20} />
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-4 h-fit">
                <div className="bg-gradient-to-br from-white via-pink-50/50 to-green-50/50 rounded-2xl shadow-2xl p-8 border-2 border-primary/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary via-green-600 to-primary rounded-xl flex items-center justify-center shadow-xl">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">TẠM TÍNH</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-4 border-b-2 border-gray-200">
                      <span className="text-gray-700 font-bold text-lg">Tổng số bó:</span>
                      <span className="text-2xl font-black text-gray-900">{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b-2 border-gray-200">
                      <span className="text-gray-700 font-bold text-lg">Tổng số bông:</span>
                      <span className="text-2xl font-black text-gray-900">{totalUnitQuantity}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b-2 border-gray-200">
                      <span className="text-gray-700 font-bold text-lg">Tổng tiền hàng:</span>
                      <span className="text-2xl font-black text-gray-900">{totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {totalServiceFee > 0 && (
                      <div className="flex justify-between items-center py-4 border-b-2 border-gray-200">
                        <span className="text-gray-700 font-bold text-lg">Phí dịch vụ:</span>
                        <span className="text-2xl font-black text-gray-900">{totalServiceFee.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="pt-6">
                      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-green-50 p-4 rounded-xl">
                        <span className="text-2xl font-black text-gray-900">Tổng thanh toán:</span>
                        <span className="text-4xl font-black bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
                          {totalPayment.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full px-8 py-5 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl mb-6"
                  >
                    THANH TOÁN
                    <ArrowRight size={24} />
                  </button>
                  
                  <Link
                    to="/products"
                    className="block text-center text-gray-600 hover:text-primary font-bold transition-colors text-lg"
                  >
                    ← Tiếp tục mua sắm
                  </Link>

                  {/* Service Info */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-200 space-y-4">
                    {[
                      { icon: <Truck className="w-6 h-6" />, text: 'Giao hàng miễn phí cho đơn trên 500k' },
                      { icon: <Shield className="w-6 h-6" />, text: 'Đảm bảo chất lượng 100%' },
                      { icon: <Gift className="w-6 h-6" />, text: 'Tặng kèm thiệp chúc mừng' },
                    ].map((service, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-green-100 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                          {service.icon}
                        </div>
                        <span className="font-semibold text-sm">{service.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </CustomerLayout>
  );
};

export default CartPage;
