import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, Minus, Plus, Check, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectProductById, selectFlowerById, selectColorById, selectActivePromotions } from '../../../store/slices/productsSlice';
import { addToCart } from '../../../store/slices/cartSlice';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [unitQuantity, setUnitQuantity] = useState(20);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const product = useSelector(state => selectProductById(state, id));
  const flower = useSelector(state => product ? selectFlowerById(state, product.flower_id) : null);
  const color = useSelector(state => product ? selectColorById(state, product.color_id) : null);
  const promotions = useSelector(selectActivePromotions);
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);

  const applicablePromotion = promotions.find(p => 
    (p.is_for_all || p.flower_color_id === product?.flower_color_id) && p.is_active
  );

  const calculatePrice = () => {
    if (!product) return { unitPrice: 0, totalPrice: 0, discount: 0 };
    const unitPrice = product.unit_price;
    const totalUnitPrice = unitPrice * unitQuantity * quantity;
    
    let discount = 0;
    if (applicablePromotion) {
      if (applicablePromotion.type_of_promotion === 'perc') {
        discount = (totalUnitPrice * applicablePromotion.amount) / 100;
      } else {
        discount = applicablePromotion.amount;
      }
    }
    
    return {
      unitPrice,
      totalPrice: totalUnitPrice,
      discount,
      finalPrice: totalUnitPrice - discount,
    };
  };

  const { unitPrice, totalPrice, discount, finalPrice } = calculatePrice();

  useEffect(() => {
    if (!product) {
      navigate('/products');
    }
  }, [product, navigate]);

  if (!product) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm không tồn tại</h1>
            <Link to="/products" className="text-primary hover:underline">Quay lại danh sách sản phẩm</Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();
  const images = [product.image_path, product.image_path, product.image_path];

  const handleAddToCart = () => {
    dispatch(addToCart({
      flower_color_id: product.flower_color_id,
      unit_quantity: unitQuantity * quantity,
      quantity,
      service_fee: 0,
      product: {
        ...product,
        name: productName,
      },
    }));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <CustomerLayout>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-slide-in">
          <Check size={24} />
          <span className="font-semibold">Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/10 to-green-50 py-4">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
            <span className="text-gray-400">/</span>
            <span className="text-primary font-semibold">{productName}</span>
          </div>
        </div>
      </div>

      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 aspect-square shadow-xl group">
                <img
                  src={images[selectedImage]}
                  alt={productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Favorite Button */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
                    isFavorite 
                      ? 'bg-red-500 text-white scale-110' 
                      : 'bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                >
                  <Heart className={isFavorite ? 'fill-current' : ''} size={24} />
                </button>

                {/* Promotion Badge */}
                {applicablePromotion && (
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Sparkles size={18} />
                    <span className="font-bold text-sm">
                      -{applicablePromotion.amount}{applicablePromotion.type_of_promotion === 'perc' ? '%' : 'đ'}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                      selectedImage === index 
                        ? 'border-primary shadow-lg scale-105' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  {productName}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-lg font-bold text-gray-700 ml-2">4.7</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">{product.quantity_in_stock} sản phẩm có sẵn</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-primary/10 via-green-50 to-pink-50 p-8 rounded-2xl border-2 border-primary/20">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="text-5xl md:text-6xl font-black text-primary">
                    {finalPrice.toLocaleString('vi-VN')}đ
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        {totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="px-4 py-2 bg-red-500 text-white rounded-full font-bold text-sm shadow-lg">
                        Tiết kiệm {discount.toLocaleString('vi-VN')}đ
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 text-lg mb-2">
                  Giá: <span className="font-semibold">{unitPrice.toLocaleString('vi-VN')}đ/bông</span> × {unitQuantity} bông/bó × {quantity} bó
                </p>
                {applicablePromotion && (
                  <div className="flex items-center gap-2 mt-3 text-green-700 font-semibold">
                    <Check size={20} className="text-green-600" />
                    <span>Đang áp dụng khuyến mãi: {applicablePromotion.promotion_name}</span>
                  </div>
                )}
              </div>

              {/* Quantity Selection */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Số bó:</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 bg-gray-100 hover:bg-primary hover:text-white rounded-xl font-bold text-xl transition-all flex items-center justify-center"
                      >
                        <Minus size={20} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity_in_stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity_in_stock, parseInt(e.target.value) || 1)))}
                        className="w-24 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.quantity_in_stock, quantity + 1))}
                        className="w-12 h-12 bg-gray-100 hover:bg-primary hover:text-white rounded-xl font-bold text-xl transition-all flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Số bông mỗi bó:</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setUnitQuantity(Math.max(1, unitQuantity - 1))}
                        className="w-12 h-12 bg-gray-100 hover:bg-primary hover:text-white rounded-xl font-bold text-xl transition-all flex items-center justify-center"
                      >
                        <Minus size={20} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={unitQuantity}
                        onChange={(e) => setUnitQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        onClick={() => setUnitQuantity(unitQuantity + 1)}
                        className="w-12 h-12 bg-gray-100 hover:bg-primary hover:text-white rounded-xl font-bold text-xl transition-all flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-primary via-green-600 to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 transform hover:scale-105"
                  >
                    <ShoppingCart size={24} />
                    THÊM VÀO GIỎ
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    MUA NGAY
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Truck className="w-8 h-8" />, title: 'Giao nhanh 2H', desc: 'Trong nội thành', color: 'from-blue-500 to-blue-600' },
                  { icon: <Shield className="w-8 h-8" />, title: 'Đảm bảo chất lượng', desc: '100% tươi ngon', color: 'from-green-500 to-green-600' },
                  { icon: <Package className="w-8 h-8" />, title: 'Đổi trả dễ dàng', desc: 'Trong 24 giờ', color: 'from-purple-500 to-purple-600' },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl text-center border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${service.color} text-white mb-3`}>
                      {service.icon}
                    </div>
                    <div className="font-bold text-sm text-gray-800 mb-1">{service.title}</div>
                    <div className="text-xs text-gray-600">{service.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex gap-4 mb-8 border-b-2 border-gray-100">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 font-bold text-lg transition-all relative ${
                    activeTab === tab 
                      ? 'text-primary' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' ? 'Mô tả sản phẩm' : 'Đánh giá'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-green-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-3xl font-black text-gray-900 mb-6">Mô tả sản phẩm</h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Loại hoa', value: flower?.flower_name },
                      { label: 'Màu sắc', value: color?.color_name },
                      { label: 'Giá', value: `${unitPrice.toLocaleString('vi-VN')}đ/bông` },
                      { label: 'Tồn kho', value: `${product.quantity_in_stock} sản phẩm` },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Check className="text-primary" size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">{item.label}</div>
                          <div className="font-bold text-gray-900">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-6">Đánh giá từ khách hàng</h3>
                  <div className="space-y-6">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {review === 1 ? 'N' : review === 2 ? 'L' : 'T'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-bold text-gray-900">Khách hàng {review}</div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">2 ngày trước</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              Hoa đẹp tuyệt vời, tươi lâu, rất hài lòng! Giao hàng nhanh chóng, đóng gói cẩn thận. Sẽ quay lại mua tiếp!
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-4xl font-black text-gray-900 mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {useSelector(state => state.products.flowerColors)
                .filter(p => p.category === product.category && p.flower_color_id !== product.flower_color_id)
                .slice(0, 4)
                .map((item) => {
                  const itemFlower = flowers.find(f => f.flower_id === item.flower_id);
                  const itemColor = colors.find(c => c.color_id === item.color_id);
                  const itemName = `${itemFlower?.flower_name || ''} ${itemColor?.color_name || ''}`.trim();
                  const itemPrice = item.unit_price * 20;

                  return (
                    <Link
                      key={item.flower_color_id}
                      to={`/products/${item.flower_color_id}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.image_path}
                          alt={itemName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {itemName}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <p className="text-primary font-black text-lg">{itemPrice.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
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
        .bg-size-200 {
          background-size: 200% 200%;
        }
        .bg-pos-0 {
          background-position: 0% 0%;
        }
        .bg-pos-100 {
          background-position: 100% 100%;
        }
      `}</style>
    </CustomerLayout>
  );
};

export default ProductDetailPage;
