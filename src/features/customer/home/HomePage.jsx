import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import { useGetAllFlowersQuery, useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/home.css';

const EMPTY_PRODUCTS = [];

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addToCartMutation] = useAddToCartMutation();
  const { data: response, isLoading } = useGetAllFlowersQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  
  // Use ref to cache products and prevent flicker/reload
  const cachedProductsRef = useRef(EMPTY_PRODUCTS);
  const newProducts = response?.data ?? EMPTY_PRODUCTS;
  
  // Only update cached products if we have new data with actual items
  // This prevents the white flash when data array reference changes but content is the same
  if (newProducts.length > 0) {
    cachedProductsRef.current = newProducts;
  }
  
  const products = cachedProductsRef.current;
  const hasCachedData = products.length > 0;
  
  const [activeTab, setActiveTab] = useState('new-arrival');
  const [newArrivalSlide, setNewArrivalSlide] = useState(0);
  const [topSalesSlide, setTopSalesSlide] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [quickViewModal, setQuickViewModal] = useState({ show: false, product: null, flowerId: null });
  const [quantities, setQuantities] = useState({});
  const [heroSlide, setHeroSlide] = useState(0);
  
  // Gọi API để lấy chi tiết flower khi mở modal
  const { data: flowerDetailResponse, isLoading: isLoadingFlowerDetail } = useGetFlowerByIdQuery(
    quickViewModal.flowerId,
    { skip: !quickViewModal.flowerId || !quickViewModal.show }
  );
  const flowerDetail = flowerDetailResponse?.data || null;
  
  const newArrivalTrackRef = useRef(null);
  const topSalesTrackRef = useRef(null);

  // Format price
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return '₫' + numPrice.toLocaleString('vi-VN');
  };

  // Render price with promotion (gạch ngang giá gốc nếu có promotion)
  const renderPrice = (unitPrice, finalPrice) => {
    const unit = typeof unitPrice === 'string' ? parseFloat(unitPrice) : Number(unitPrice || 0);
    const final = typeof finalPrice === 'string' ? parseFloat(finalPrice) : Number(finalPrice || unit);
    
    // Nếu finalPrice khác unitPrice (có promotion), hiển thị cả hai
    if (final !== unit && final > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="product-price" style={{ color: '#2c2c2c', fontWeight: '600' }}>
            {formatPrice(final)}
          </span>
          <span style={{ 
            color: '#999', 
            textDecoration: 'line-through', 
            fontSize: '14px',
            fontWeight: '400'
          }}>
            {formatPrice(unit)}
          </span>
        </div>
      );
    }
    
    // Nếu không có promotion, chỉ hiển thị giá bình thường
    return (
      <span className="product-price">{formatPrice(unit)}</span>
    );
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

  // Get latest products (new arrivals) - filter out of stock
  // Use useMemo to prevent recalculation on every render
  const latestProducts = useMemo(() => 
    products.filter(p => (p.quantityInStock || 0) > 0).slice(0, 10),
    [products]
  );
  
  // Get top ordered products (bán chạy) - filter out of stock
  const topOrderedProducts = useMemo(() => 
    products.filter(p => (p.quantityInStock || 0) > 0).slice(0, 10),
    [products]
  );
  
  // Get top prominent products - filter out of stock
  const topProminentProducts = useMemo(() => 
    products.filter(p => (p.quantityInStock || 0) > 0).slice(0, 8),
    [products]
  );

  // Initialize quantities
  useEffect(() => {
    if (!products || products.length === 0) return;
    const initialQuantities = {};
    [...latestProducts, ...topOrderedProducts, ...topProminentProducts].forEach(product => {
      const productId = product.flowerId;
      initialQuantities[productId] = 1;
    });
    setQuantities(initialQuantities);
  }, [products.length]);

  // Hero banner carousel - auto play every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % 3); // Assuming 3 slides
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initialize carousels khi DOM đã render xong
  useEffect(() => {
    if (latestProducts.length > 0 || topOrderedProducts.length > 0) {
      const initTimer = setTimeout(() => {
        updateNewArrivalCarousel();
        updateTopSalesCarousel();
        syncQuantitySelectorWidth();
      }, 100);
      return () => clearTimeout(initTimer);
    }
  }, [latestProducts.length, topOrderedProducts.length]);

  // Carousel functions - tính toán chính xác dựa trên card width thực tế
  const productsPerView = 3;
  
  // Calculate slide distance based on actual card width
  const calculateSlideDistance = (trackRef) => {
    if (!trackRef.current) return 0;
    const grid = trackRef.current.querySelector('.carousel-grid');
    if (!grid) return 0;
    const productCards = grid.querySelectorAll('.product-card');
    if (productCards.length === 0) return 0;
    
    const cardWidth = productCards[0].offsetWidth;
    const gap = 40; // gap from CSS
    return cardWidth + gap;
  };

  // Update carousel position với tính toán chính xác
  const updateNewArrivalCarousel = () => {
    if (newArrivalTrackRef.current && latestProducts.length > 0) {
      const slideDistance = calculateSlideDistance(newArrivalTrackRef);
      const transformX = -newArrivalSlide * slideDistance;
      newArrivalTrackRef.current.style.transform = `translateX(${transformX}px)`;
    }
  };

  const updateTopSalesCarousel = () => {
    if (topSalesTrackRef.current && topOrderedProducts.length > 0) {
      const slideDistance = calculateSlideDistance(topSalesTrackRef);
      const transformX = -topSalesSlide * slideDistance;
      topSalesTrackRef.current.style.transform = `translateX(${transformX}px)`;
    }
  };

  const nextNewArrivalSlide = () => {
    const maxSlide = Math.max(0, latestProducts.length - productsPerView);
    if (newArrivalSlide < maxSlide) {
      setNewArrivalSlide(prev => prev + 1);
    }
  };

  const prevNewArrivalSlide = () => {
    if (newArrivalSlide > 0) {
      setNewArrivalSlide(prev => prev - 1);
    }
  };

  const nextTopSalesSlide = () => {
    const maxSlide = Math.max(0, topOrderedProducts.length - productsPerView);
    if (topSalesSlide < maxSlide) {
      setTopSalesSlide(prev => prev + 1);
    }
  };

  const prevTopSalesSlide = () => {
    if (topSalesSlide > 0) {
      setTopSalesSlide(prev => prev - 1);
    }
  };

  // Reset carousel về vị trí đầu
  const resetNewArrivalCarousel = () => {
    setNewArrivalSlide(0);
  };

  const resetTopSalesCarousel = () => {
    setTopSalesSlide(0);
  };

  // Update carousel position khi slide thay đổi hoặc products thay đổi
  useEffect(() => {
    if (activeTab === 'new-arrival') {
      const timer = setTimeout(() => {
        updateNewArrivalCarousel();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [newArrivalSlide, latestProducts.length, activeTab]);

  useEffect(() => {
    if (activeTab === 'top-sales') {
      const timer = setTimeout(() => {
        updateTopSalesCarousel();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [topSalesSlide, topOrderedProducts.length, activeTab]);

  // Update carousel khi resize với debounce
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateNewArrivalCarousel();
        updateTopSalesCarousel();
        syncQuantitySelectorWidth();
      }, 250);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [newArrivalSlide, topSalesSlide, latestProducts.length, topOrderedProducts.length, activeTab]);

  // Sync quantity selector width - đồng bộ với image container width
  // Use useCallback to prevent recreation on every render
  const syncQuantitySelectorWidth = useCallback(() => {
    document.querySelectorAll('.product-card').forEach(card => {
      const imageContainer = card.querySelector('.product-image-container');
      const quantitySelectors = card.querySelectorAll('.quantity-selector');
      const addToCartBtn = card.querySelector('.add-to-cart-btn');
      if (imageContainer && quantitySelectors.length > 0) {
        const imageWidth = imageContainer.offsetWidth;
        // Khi có 2 selector cùng hàng, mỗi selector sẽ chiếm một phần (có gap 10px)
        const selectorWidth = quantitySelectors.length === 2 
          ? `calc(${imageWidth}px / 2 - 5px)` 
          : imageWidth + 'px';
        quantitySelectors.forEach((selector) => {
          selector.style.width = selectorWidth;
          selector.style.maxWidth = selectorWidth;
        });
        // Sync width của nút "Thêm vào giỏ hàng" với imageWidth
        if (addToCartBtn) {
          addToCartBtn.style.width = imageWidth + 'px';
          addToCartBtn.style.maxWidth = imageWidth + 'px';
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!products || products.length === 0) return;
    
    // Sync khi load và resize
    syncQuantitySelectorWidth();
    window.addEventListener('resize', syncQuantitySelectorWidth);
    window.addEventListener('load', syncQuantitySelectorWidth);
    
    // Sync sau khi DOM render xong
    const timeoutId = setTimeout(syncQuantitySelectorWidth, 100);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', syncQuantitySelectorWidth);
      window.removeEventListener('load', syncQuantitySelectorWidth);
    };
  }, [products.length, activeTab]); // Chạy khi products.length hoặc tab thay đổi

  // Animate input khi thay đổi số lượng
  const animateInput = (inputElement) => {
    if (inputElement && inputElement.style) {
      inputElement.style.transform = 'scale(1.2)';
      setTimeout(() => {
        inputElement.style.transform = 'scale(1)';
      }, 200);
    }
  };

  // Quantity handlers với animation
  const handleQuantityChange = (productId, delta, inputRef = null) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const product = [...latestProducts, ...topOrderedProducts, ...topProminentProducts]
        .find(p => p.flowerId === productId);
      const max = product?.quantityInStock || 0;
      const min = 1;
      
      let newValue;
      if (delta > 0) {
        // Tăng số lượng
        if (max && current >= max) {
          showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${max}`, 'warning');
          return prev;
        }
        newValue = Math.min(max || 999, current + delta);
      } else {
        // Giảm số lượng
        if (current > min) {
          newValue = current + delta;
        } else {
          return prev;
        }
      }
      
      // Animate input nếu có ref
      if (inputRef?.current) {
        animateInput(inputRef.current);
      }
      
      return { ...prev, [productId]: newValue };
    });
  };

  const handleQuantityInputChange = (productId, value, inputRef = null) => {
    const product = [...latestProducts, ...topOrderedProducts, ...topProminentProducts]
      .find(p => p.flowerId === productId);
    const max = product?.quantityInStock || 0;
    const min = 1;
    const numValue = parseInt(value) || 1;
    
    let finalValue;
    if (numValue < min) {
      finalValue = min;
    } else if (max && numValue > max) {
      finalValue = max;
      showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${max}`, 'warning');
    } else {
      finalValue = numValue;
    }
    
    setQuantities(prev => ({ ...prev, [productId]: finalValue }));
    
    // Animate input nếu có ref
    if (inputRef?.current) {
      animateInput(inputRef.current);
    }
  };


  // Add to cart với animation button
  const handleAddToCart = async (product, buttonRef = null) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
      navigate('/login');
      return;
    }

    const productId = product.flowerId;
    const quantity = product._quantity || quantities[productId] || 1; // Số lượng bó
    
    // Lưu trạng thái ban đầu của button
    let originalText = '';
    let originalDisabled = false;
    if (buttonRef?.current) {
      originalText = buttonRef.current.innerHTML;
      originalDisabled = buttonRef.current.disabled;
      buttonRef.current.disabled = true;
      buttonRef.current.innerHTML = '<span>Đang thêm...</span>';
      buttonRef.current.style.transform = 'scale(0.95)';
    }
    
    try {
      await addToCartMutation({
        flowerId: productId,
        colorId: null, // No colorId for flowers
        quantity: quantity, // Số lượng bó
      }).unwrap();
      
      showToast('Đã thêm vào giỏ hàng!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!';
      showToast(errorMessage, 'error');
    } finally {
      // Khôi phục trạng thái button
      if (buttonRef?.current) {
        setTimeout(() => {
          buttonRef.current.disabled = originalDisabled;
          buttonRef.current.innerHTML = originalText;
          buttonRef.current.style.transform = '';
        }, 150);
      }
    }
  };

  // Quick view modal
  const openQuickViewModal = (product) => {
    setQuickViewModal({ show: true, product, flowerId: product.flowerId });
  };

  const closeQuickViewModal = () => {
    setQuickViewModal({ show: false, product: null, flowerId: null });
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
    const productId = product.flowerId;
    const quantity = quantities[productId] || 1;
    const maxStock = product.quantityInStock || 0;
    const unitPrice = product.unitPrice || 0;
    const finalPrice = product.finalPrice !== undefined ? product.finalPrice : unitPrice;
    const productName = product.flowerName || 'Sản phẩm';
    const imagePath = product.imagePath || 'https://via.placeholder.com/300';
    const averageRating = product.averageRating || 0;
    const numberOfReviews = product.numberOfReviews || 0;
    const description = product.description || '';

    const qtyInputRef = useRef(null);
    const unitQtyInputRef = useRef(null);
    const addToCartBtnRef = useRef(null);

    return (
      <div 
        className="product-card" 
        data-product-id={productId}
        data-product-name={productName}
        data-product-price={unitPrice}
        data-product-image={imagePath}
        data-product-stock={maxStock}
        data-product-rating={averageRating}
        data-product-reviews={numberOfReviews}
        data-product-description={description}
      >
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
            {renderPrice(unitPrice, finalPrice)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Số bó:</label>
            <div className="quantity-selector">
                <button 
                  className="qty-btn minus-btn"
                  onClick={() => handleQuantityChange(productId, -1, qtyInputRef)}
                >
                  -
                </button>
                <input 
                  ref={qtyInputRef}
                  type="number" 
                  value={quantity} 
                  min="1" 
                  max={maxStock}
                  className="qty-input"
                  onChange={(e) => handleQuantityInputChange(productId, e.target.value, qtyInputRef)}
                />
                <button 
                  className="qty-btn plus-btn"
                  onClick={() => handleQuantityChange(productId, 1, qtyInputRef)}
                >
                  +
                </button>
              </div>
            </div>
          <button 
            ref={addToCartBtnRef}
            className="add-to-cart-btn"
            onClick={() => handleAddToCart(product, addToCartBtnRef)}
            disabled={maxStock === 0}
          >
            <span>THÊM VÀO GIỎ</span>
            <i className="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    );
  };

  // Only show loading on initial load when there's no cached data
  // This prevents the white flash/reload when data is already cached
  if (isLoading && !hasCachedData) {
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
                  data-tab="new-arrival"
                  onClick={() => {
                    setActiveTab('new-arrival');
                    resetNewArrivalCarousel();
                    // Sync width sau khi chuyển tab
                    setTimeout(() => {
                      syncQuantitySelectorWidth();
                    }, 100);
                  }}
                >
                  Sản phẩm mới
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'top-sales' ? 'active' : ''}`}
                  data-tab="top-sales"
                  onClick={() => {
                    setActiveTab('top-sales');
                    resetTopSalesCarousel();
                    // Sync width sau khi chuyển tab
                    setTimeout(() => {
                      syncQuantitySelectorWidth();
                    }, 100);
                  }}
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
                  id="newArrivalPrev"
                  onClick={prevNewArrivalSlide}
                  disabled={newArrivalSlide === 0 || latestProducts.length === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="carousel-container">
                  <div className="carousel-track" id="newArrivalTrack" ref={newArrivalTrackRef}>
                    <div className="products-grid carousel-grid">
                      {latestProducts.map((product) => {
                        const productId = product.flowerId;
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
                  id="newArrivalNext"
                  onClick={nextNewArrivalSlide}
                  disabled={newArrivalSlide >= Math.max(0, latestProducts.length - productsPerView) || latestProducts.length === 0}
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
                  id="topSalesPrev"
                  onClick={prevTopSalesSlide}
                  disabled={topSalesSlide === 0 || topOrderedProducts.length === 0}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="carousel-container">
                  <div className="carousel-track" id="topSalesTrack" ref={topSalesTrackRef}>
                    <div className="products-grid carousel-grid">
                      {topOrderedProducts.map((product) => {
                        const productId = product.flowerId;
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
                  id="topSalesNext"
                  onClick={nextTopSalesSlide}
                  disabled={topSalesSlide >= Math.max(0, topOrderedProducts.length - productsPerView) || topOrderedProducts.length === 0}
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
                const productId = product.flowerId;
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
      {quickViewModal.show && (flowerDetail || quickViewModal.product) && (
        <QuickViewModal 
          product={flowerDetail || quickViewModal.product}
          isLoading={isLoadingFlowerDetail}
          onClose={closeQuickViewModal}
          onAddToCart={handleAddToCart}
          quantity={quantities[quickViewModal.product?.flowerId || quickViewModal.flowerId] || 1}
          onQuantityChange={(delta) => handleQuantityChange(quickViewModal.product?.flowerId || quickViewModal.flowerId, delta, null)}
          onQuantityInputChange={(value) => handleQuantityInputChange(quickViewModal.product?.flowerId || quickViewModal.flowerId, value, null)}
          formatPrice={formatPrice}
          renderStars={renderStars}
          animateInput={animateInput}
          renderPrice={renderPrice}
        />
      )}
    </CustomerLayout>
  );
};

// Quick View Modal Component
const QuickViewModal = ({ product, isLoading, onClose, onAddToCart, quantity, onQuantityChange, onQuantityInputChange, formatPrice, renderStars, animateInput, renderPrice }) => {
  if (!product) return null;
  
  const productId = product.flowerId;
  const unitPrice = product.unitPrice || 0;
  const finalPrice = product.finalPrice !== undefined ? product.finalPrice : unitPrice;
  const maxStock = product.quantityInStock || 0;
  const productName = product.flowerName || 'Sản phẩm';
  const imagePath = product.imagePath || 'https://via.placeholder.com/400';
  const averageRating = product.averageRating || 0;
  const numberOfReviews = product.numberOfReviews || 0;
  const description = product.description || 'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.';

  const modalQtyInputRef = useRef(null);
  const modalAddToCartBtnRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleModalQuantityChange = (delta) => {
    onQuantityChange(delta);
    if (modalQtyInputRef.current && animateInput) {
      animateInput(modalQtyInputRef.current);
    }
  };

  const handleModalQuantityInputChange = (value) => {
    onQuantityInputChange(value);
    if (modalQtyInputRef.current && animateInput) {
      animateInput(modalQtyInputRef.current);
    }
  };

  const handleModalAddToCart = () => {
    const productWithQty = { ...product, _quantity: quantity };
    onAddToCart(productWithQty, modalAddToCartBtnRef);
  };

  return (
    <div className="quick-view-modal active" id="quickViewModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close-btn" id="modalCloseBtn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal-body">
          <div className="modal-product-image">
            <img 
              src={imagePath} 
              alt={productName}
              id="modalProductImage"
            />
          </div>
          <div className="modal-product-info">
            <h2 className="modal-product-name" id="modalProductName">
              {productName}
            </h2>
            <div className="modal-price-rating-row">
              <div className="modal-product-price-container">
                <p className="modal-product-price" id="modalProductPrice">
                  {formatPrice(unitPrice)}
                </p>
              </div>
              <div className="modal-product-rating">
                <div className="rating-stars">
                  {renderStars(averageRating)}
                </div>
                <span className="rating-text">({numberOfReviews} đánh giá)</span>
              </div>
            </div>
            <div className="modal-product-description">
              <p id="modalProductDescription">
                {description}
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
            <div className="modal-quantity-section" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '20px' }}>
              <label className="modal-quantity-label">Số bó:</label>
              <div className="modal-quantity-selector" id="modalQuantitySelector">
                  <button 
                    className="modal-qty-btn modal-minus-btn"
                    onClick={() => handleModalQuantityChange(-1)}
                  >
                    -
                  </button>
                  <input 
                    ref={modalQtyInputRef}
                    type="number" 
                    id="modalQuantity" 
                    value={quantity} 
                    min="1" 
                    max={maxStock}
                    className="modal-qty-input"
                    onChange={(e) => handleModalQuantityInputChange(e.target.value)}
                  />
                  <button 
                    className="modal-qty-btn modal-plus-btn"
                    onClick={() => handleModalQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
            </div>
            <button 
              ref={modalAddToCartBtnRef}
              className="modal-add-to-cart-btn" 
              id="modalAddToCartBtn"
              onClick={handleModalAddToCart}
              disabled={maxStock === 0}
            >
              <i className="fas fa-shopping-cart"></i>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
