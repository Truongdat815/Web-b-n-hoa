import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import { useGetAllFlowerColorsQuery } from '../../../api/flowers/flowerColorApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/home.css';

const EMPTY_PRODUCTS = [];

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addToCartMutation] = useAddToCartMutation();
  const { data: response, isLoading } = useGetAllFlowerColorsQuery();
  
  // API returns {code, message, data: [...]}
  // IMPORTANT: keep stable reference when data is not loaded yet to avoid useEffect loops
  const products = response?.data ?? EMPTY_PRODUCTS;
  
  const [activeTab, setActiveTab] = useState('new-arrival');
  const [newArrivalSlide, setNewArrivalSlide] = useState(0);
  const [topSalesSlide, setTopSalesSlide] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [quickViewModal, setQuickViewModal] = useState({ show: false, product: null });
  const [quantities, setQuantities] = useState({});
  
  const newArrivalTrackRef = useRef(null);
  const topSalesTrackRef = useRef(null);

  // Format price
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return '₫' + numPrice.toLocaleString('vi-VN');
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  // Get latest products (new arrivals)
  const latestProducts = products.slice(0, 10);
  
  // Get top ordered products (bán chạy) - giả sử lấy từ API hoặc sort theo số lượng đã bán
  const topOrderedProducts = products.slice(0, 10);
  
  // Get top prominent products
  const topProminentProducts = products.slice(0, 8);

  // Initialize quantities (avoid infinite loop when products is the default empty array)
  useEffect(() => {
    if (!products || products.length === 0) return;
    const initialQuantities = {};
    [...latestProducts, ...topOrderedProducts, ...topProminentProducts].forEach(product => {
      const productId = product.flowerColorId || product.id || product.flower_color_id;
      initialQuantities[productId] = 1;
    });
    setQuantities(initialQuantities);
  }, [products, latestProducts, topOrderedProducts, topProminentProducts]);

  // Carousel functions
  const productsPerView = 3;
  
  const nextNewArrivalSlide = () => {
    const maxSlide = Math.max(0, latestProducts.length - productsPerView);
    setNewArrivalSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevNewArrivalSlide = () => {
    setNewArrivalSlide(prev => Math.max(prev - 1, 0));
  };

  const nextTopSalesSlide = () => {
    const maxSlide = Math.max(0, topOrderedProducts.length - productsPerView);
    setTopSalesSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevTopSalesSlide = () => {
    setTopSalesSlide(prev => Math.max(prev - 1, 0));
  };

  // Update carousel position
  useEffect(() => {
    if (newArrivalTrackRef.current) {
      const slideDistance = newArrivalTrackRef.current.offsetWidth / productsPerView + 40;
      newArrivalTrackRef.current.style.transform = `translateX(-${newArrivalSlide * slideDistance}px)`;
    }
  }, [newArrivalSlide]);

  useEffect(() => {
    if (topSalesTrackRef.current) {
      const slideDistance = topSalesTrackRef.current.offsetWidth / productsPerView + 40;
      topSalesTrackRef.current.style.transform = `translateX(-${topSalesSlide * slideDistance}px)`;
    }
  }, [topSalesSlide]);

  // Helper to get product ID
  const getProductId = (product) => {
    return product.flowerColorId || product.id || product.flower_color_id;
  };

  // Quantity handlers
  const handleQuantityChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const product = [...latestProducts, ...topOrderedProducts, ...topProminentProducts]
        .find(p => getProductId(p) === productId);
      const max = product?.quantityInStock || product?.quantity_in_stock || 999;
      const newValue = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [productId]: newValue };
    });
  };

  const handleQuantityInputChange = (productId, value) => {
    const product = [...latestProducts, ...topOrderedProducts, ...topProminentProducts]
      .find(p => getProductId(p) === productId);
    const max = product?.quantityInStock || product?.quantity_in_stock || 999;
    const numValue = parseInt(value) || 1;
    const finalValue = Math.max(1, Math.min(max, numValue));
    setQuantities(prev => ({ ...prev, [productId]: finalValue }));
    
    if (numValue > max) {
      showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${max}`, 'warning');
    }
  };

  // Add to cart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
      navigate('/login');
      return;
    }

    const productId = getProductId(product);
    const quantity = quantities[productId] || 1;
    const flowerId = product.flower?.flowerId || product.flower?.id || product.flower_id;
    const colorId = product.color?.colorId || product.color?.id || product.color_id;
    
    try {
      await addToCartMutation({
        flowerId: flowerId,
        colorId: colorId,
        unitQuantity: 20, // Default 20 bông/bó
        quantity: quantity, // Số lượng bó
      }).unwrap();
      
      showToast('Đã thêm vào giỏ hàng!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!';
      showToast(errorMessage, 'error');
    }
  };

  // Quick view modal
  const openQuickViewModal = (product) => {
    setQuickViewModal({ show: true, product });
  };

  const closeQuickViewModal = () => {
    setQuickViewModal({ show: false, product: null });
  };

  // Toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Navigate to product detail
  const goToProductDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Product Card Component
  const ProductCard = ({ product, onQuickView }) => {
    const productId = getProductId(product);
    const quantity = quantities[productId] || 1;
    const maxStock = product.quantityInStock || product.quantity_in_stock || 999;
    const unitPrice = product.unitPrice || product.unit_price || 0;
    const price = unitPrice * 20; // Default 20 bông/bó
    const flowerName = product.flower?.name || product.flower?.flowerName || '';
    const colorName = product.color?.name || product.color?.colorName || '';
    const productName = `${flowerName}${colorName ? ` - ${colorName}` : ''}` || 'Sản phẩm';
    const imagePath = product.imagePath || product.image_path || 'https://via.placeholder.com/300';

    return (
      <div className="product-card" data-product-id={productId}>
        <div 
          className="product-image-container" 
          onClick={() => goToProductDetail(productId)}
        >
          <img src={imagePath} alt={productName} className="product-image" />
          <div className="product-overlay">
            <button 
              className="quick-view-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              Xem nhanh
            </button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{productName}</h3>
          <div className="product-price-container">
            <span className="product-price">{formatPrice(price)}</span>
          </div>
          <div className="quantity-selector">
            <button 
              className="qty-btn minus-btn"
              onClick={() => handleQuantityChange(productId, -1)}
            >
              -
            </button>
            <input 
              type="number" 
              value={quantity} 
              min="1" 
              max={maxStock}
              className="qty-input"
              onChange={(e) => handleQuantityInputChange(productId, e.target.value)}
            />
            <button 
              className="qty-btn plus-btn"
              onClick={() => handleQuantityChange(productId, 1)}
            >
              +
            </button>
          </div>
          <button 
            className="add-to-cart-btn"
            onClick={() => handleAddToCart(product)}
          >
            <span>THÊM VÀO GIỎ</span>
            <i className="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <CustomerLayout><div>Loading...</div></CustomerLayout>;
  }

  return (
    <CustomerLayout>
      <div className="home-page-content" data-is-logged-in={isAuthenticated}>
        {/* Hero Banner */}
        <section className="hero-banner-section">
          <div className="hero-banner-container">
            <div className="hero-banner-content">
              <div className="hero-text-section">
                <div className="hero-divider"></div>
                <span className="hero-category">HOA & QUÀ TẶNG</span>
                <h1 className="hero-title">GIẢM GIÁ LÊN ĐẾN 75%</h1>
                <p className="hero-description">
                  Khám phá bộ sưu tập hoa tươi đẹp nhất với giá ưu đãi đặc biệt. Từ những bó hoa lãng mạn đến những món quà tinh tế, chúng tôi mang đến cho bạn những khoảnh khắc đáng nhớ với chất lượng cao và dịch vụ tận tâm.
                </p>
                <a href="#products" className="hero-shop-btn">Mua Ngay</a>
              </div>
              <div className="hero-image-section">
                <div className="hero-floral-image">
                  <img 
                    src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600" 
                    alt="Flower & Gift" 
                    className="hero-main-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Tabs Section */}
        <section className="product-tabs-section" id="products">
          <div className="container">
            <div className="section-header">
              <div className="product-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'new-arrival' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new-arrival')}
                >
                  Sản phẩm mới
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'top-sales' ? 'active' : ''}`}
                  onClick={() => setActiveTab('top-sales')}
                >
                  Bán chạy
                </button>
              </div>
            </div>

            {/* New Arrival Tab */}
            <div className={`tab-content ${activeTab === 'new-arrival' ? 'active' : ''}`} id="new-arrival">
              <div className="product-carousel">
                <button 
                  className="carousel-nav-btn prev-btn"
                  onClick={prevNewArrivalSlide}
                  disabled={newArrivalSlide === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="carousel-container">
                  <div className="carousel-track" ref={newArrivalTrackRef}>
                    <div className="products-grid carousel-grid">
                      {latestProducts.map((product) => {
                        const productId = getProductId(product);
                        return (
                          <ProductCard 
                            key={productId} 
                            product={product}
                            onQuickView={openQuickViewModal}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <button 
                  className="carousel-nav-btn next-btn"
                  onClick={nextNewArrivalSlide}
                  disabled={newArrivalSlide >= Math.max(0, latestProducts.length - productsPerView)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            {/* Top Sales Tab */}
            <div className={`tab-content ${activeTab === 'top-sales' ? 'active' : ''}`} id="top-sales">
              <div className="product-carousel">
                <button 
                  className="carousel-nav-btn prev-btn"
                  onClick={prevTopSalesSlide}
                  disabled={topSalesSlide === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="carousel-container">
                  <div className="carousel-track" ref={topSalesTrackRef}>
                    <div className="products-grid carousel-grid">
                      {topOrderedProducts.map((product) => {
                        const productId = getProductId(product);
                        return (
                          <ProductCard 
                            key={productId} 
                            product={product}
                            onQuickView={openQuickViewModal}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
                <button 
                  className="carousel-nav-btn next-btn"
                  onClick={nextTopSalesSlide}
                  disabled={topSalesSlide >= Math.max(0, topOrderedProducts.length - productsPerView)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Top Products Section */}
        <section className="top-products-section">
          <div className="container">
            <h2 className="section-title">SẢN PHẨM NỔI BẬT</h2>
            <div className="products-grid">
              {topProminentProducts.map((product) => {
                const productId = getProductId(product);
                return (
                  <ProductCard 
                    key={productId} 
                    product={product}
                    onQuickView={openQuickViewModal}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="container">
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <h3 className="benefit-title">Miễn phí vận chuyển</h3>
                <p className="benefit-text">Cho đơn hàng trên 1.000.000₫</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-undo"></i>
                </div>
                <h3 className="benefit-title">Đổi trả 15 ngày</h3>
                <p className="benefit-text">Đảm bảo hoàn tiền</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h3 className="benefit-title">Thanh toán an toàn</h3>
                <p className="benefit-text">Được bảo vệ bởi Paypal</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-gift"></i>
                </div>
                <h3 className="benefit-title">Ưu đãi & quà tặng</h3>
                <p className="benefit-text">Cho mọi đơn hàng</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}

      {/* Quick View Modal */}
      {quickViewModal.show && quickViewModal.product && (() => {
        const productId = getProductId(quickViewModal.product);
        return (
          <QuickViewModal 
            key={productId}
            product={quickViewModal.product}
            onClose={closeQuickViewModal}
            onAddToCart={handleAddToCart}
            quantity={quantities[productId] || 1}
            onQuantityChange={(delta) => handleQuantityChange(productId, delta)}
          />
        );
      })()}
    </CustomerLayout>
  );
};

// Quick View Modal Component
const QuickViewModal = ({ product, onClose, onAddToCart, quantity, onQuantityChange }) => {
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return '₫' + numPrice.toLocaleString('vi-VN');
  };
  
  const price = product.unit_price * 20;
  const maxStock = product.quantity_in_stock || 999;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="quick-view-modal active" id="quickViewModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal-body">
          <div className="modal-product-image">
            <img 
              src={product.image_path || 'https://via.placeholder.com/400'} 
              alt={product.name || 'Product'}
              id="modalProductImage"
            />
          </div>
          <div className="modal-product-info">
            <h2 className="modal-product-name" id="modalProductName">
              {product.name || 'Sản phẩm'}
            </h2>
            <div className="modal-price-rating-row">
              <div className="modal-product-price-container">
                <p className="modal-product-price" id="modalProductPrice">
                  {formatPrice(price)}
                </p>
              </div>
              <div className="modal-product-rating">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <span className="rating-text">(0 đánh giá)</span>
              </div>
            </div>
            <div className="modal-product-description">
              <p id="modalProductDescription">
                {product.description || 'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.'}
              </p>
            </div>
            <div className="modal-product-stock">
              <span className="modal-stock-label">Tình trạng:</span>
              <span 
                className="modal-stock-status" 
                id="modalStockStatus"
                style={{ color: maxStock > 0 ? '#4caf50' : '#f44336' }}
              >
                {maxStock > 0 ? `Còn hàng (${maxStock} sản phẩm)` : 'Hết hàng'}
              </span>
            </div>
            <div className="modal-quantity-cart-row">
              <div className="modal-quantity-section">
                <label className="modal-quantity-label">Số lượng:</label>
                <div className="modal-quantity-selector" id="modalQuantitySelector">
                  <button 
                    className="modal-qty-btn modal-minus-btn"
                    onClick={() => onQuantityChange(-1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="modalQuantity" 
                    value={quantity} 
                    min="1" 
                    max={maxStock}
                    className="modal-qty-input"
                    readOnly
                  />
                  <button 
                    className="modal-qty-btn modal-plus-btn"
                    onClick={() => onQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button 
                className="modal-add-to-cart-btn" 
                id="modalAddToCartBtn"
                onClick={() => onAddToCart(product)}
                disabled={maxStock === 0}
              >
                <i className="fas fa-shopping-cart"></i>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
