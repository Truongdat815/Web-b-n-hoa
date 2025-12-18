import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetAllFlowersQuery, useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import '../../../assets/css/product.css';
import '../../../assets/css/home.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: response, isLoading, error, refetch } = useGetAllFlowersQuery();
  const [addToCartMutation] = useAddToCartMutation();

  const products = response?.data || [];

  // Filter products with stock > 0
  const availableProducts = products.filter((p) => (p.quantityInStock || 0) > 0);

  const [quantities, setQuantities] = useState({});
  const [unitQuantities, setUnitQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [quickViewModal, setQuickViewModal] = useState({ show: false, product: null, flowerId: null });
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalUnitQuantity, setModalUnitQuantity] = useState(1);
  
  // Gọi API để lấy chi tiết flower khi mở modal
  const { data: flowerDetailResponse, isLoading: isLoadingFlowerDetail } = useGetFlowerByIdQuery(
    quickViewModal.flowerId,
    { skip: !quickViewModal.flowerId || !quickViewModal.show }
  );
  const flowerDetail = flowerDetailResponse?.data || null;

  // Initialize quantities and unitQuantities for all products
  useEffect(() => {
    if (availableProducts.length > 0) {
      const initialQuantities = {};
      const initialUnitQuantities = {};
      availableProducts.forEach((product) => {
        const productId = product.flowerId;
        initialQuantities[productId] = 1;
        initialUnitQuantities[productId] = 1; // Default 1 bông hoa
      });
      setQuantities(initialQuantities);
      setUnitQuantities(initialUnitQuantities);
    }
  }, [availableProducts.length]);

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return '₫' + (Number.isFinite(numPrice) ? numPrice : 0).toLocaleString('vi-VN');
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      if (r >= i) stars.push(<i key={i} className="fas fa-star" />);
      else if (r >= i - 0.5) stars.push(<i key={i} className="fas fa-star-half-alt" />);
      else stars.push(<i key={i} className="far fa-star" />);
    }
    return stars;
  };

  const showToast = (message, type = 'success') => {
    if (!message || message.trim() === '') return;
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Animate input when quantity changes
  const animateInput = (inputElement) => {
    if (inputElement && inputElement.style) {
      inputElement.style.transform = 'scale(1.2)';
      setTimeout(() => {
        inputElement.style.transform = 'scale(1)';
      }, 200);
    }
  };

  // Quantity handlers with animation
  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const product = availableProducts.find((p) => p.flowerId === productId);
      const max = product?.quantityInStock || 0;
      const min = 1;

      let newValue;
      if (delta > 0) {
        if (max && current >= max) {
          showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${max}`, 'warning');
          return prev;
        }
        newValue = Math.min(max || 999, current + delta);
      } else {
        if (current > min) {
          newValue = current + delta;
        } else {
          return prev;
        }
      }

      return { ...prev, [productId]: newValue };
    });
  };

  const handleQuantityInputChange = (productId, value) => {
    const product = availableProducts.find((p) => p.flowerId === productId);
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

    setQuantities((prev) => ({ ...prev, [productId]: finalValue }));
  };

  // Unit quantity handlers (số lượng bông hoa)
  const handleUnitQuantityChange = (productId, delta) => {
    setUnitQuantities((prev) => {
      const current = prev[productId] || 1;
      const min = 1;
      const max = 999; // No stock limit for unit quantity

      let newValue;
      if (delta > 0) {
        newValue = Math.min(max, current + delta);
      } else {
        if (current > min) {
          newValue = current + delta;
        } else {
          return prev;
        }
      }

      return { ...prev, [productId]: newValue };
    });
  };

  const handleUnitQuantityInputChange = (productId, value) => {
    const min = 1;
    const max = 999;
    const numValue = parseInt(value) || 1;

    let finalValue;
    if (numValue < min) {
      finalValue = min;
    } else if (numValue > max) {
      finalValue = max;
      showToast(`Số lượng bông hoa tối đa: ${max}`, 'warning');
    } else {
      finalValue = numValue;
    }

    setUnitQuantities((prev) => ({ ...prev, [productId]: finalValue }));

    if (inputRef?.current) {
      animateInput(inputRef.current);
    }
  };

  const goToProductDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  const openQuickViewModal = (product) => {
    setQuickViewModal({ show: true, product, flowerId: product.flowerId });
    setModalQuantity(1);
    setModalUnitQuantity(1);
  };

  const closeQuickViewModal = () => {
    setQuickViewModal({ show: false, product: null, flowerId: null });
  };

  useEffect(() => {
    if (quickViewModal.show) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeQuickViewModal();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [quickViewModal.show]);

  const handleAddToCart = async (product, buttonElement = null) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
      navigate('/login');
      return;
    }

    const productId = product.flowerId;
    // Support both modal and product card (modal passes _unitQuantity and _quantity)
    const quantity = product._quantity || quantities[productId] || 1; // Số lượng bó
    const unitQuantity = product._unitQuantity || unitQuantities[productId] || 1; // Số lượng bông hoa trong 1 bó

    let originalText = '';
    let originalDisabled = false;
    // Support both ref (from modal) and direct element (from product card)
    const button = buttonElement?.current || buttonElement;
    if (button) {
      originalText = button.innerHTML;
      originalDisabled = button.disabled;
      button.disabled = true;
      button.innerHTML = '<span>Đang thêm...</span>';
      button.style.transform = 'scale(0.95)';
    }

    try {
      await addToCartMutation({
        flowerId: productId,
        colorId: null, // No colorId for flowers
        unitQuantity: unitQuantity, // Số lượng bông hoa trong 1 bó
        quantity: quantity, // Số lượng bó
      }).unwrap();

      showToast('Đã thêm vào giỏ hàng!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!';
      showToast(errorMessage, 'error');
    } finally {
      const button = buttonElement?.current || buttonElement;
      if (button) {
        setTimeout(() => {
          button.disabled = originalDisabled;
          button.innerHTML = originalText;
          button.style.transform = '';
        }, 150);
      }
    }
  };

  // Sync quantity selector width with image width
  useEffect(() => {
    const syncQuantitySelectorWidth = () => {
      document.querySelectorAll('.product-card').forEach((card) => {
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
    };

    const debouncedSync = () => {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(syncQuantitySelectorWidth, 250);
    };

    const initialSyncTimeout = setTimeout(syncQuantitySelectorWidth, 100);
    window.addEventListener('resize', debouncedSync);

    return () => {
      clearTimeout(initialSyncTimeout);
      clearTimeout(window.resizeTimer);
      window.removeEventListener('resize', debouncedSync);
    };
  }, [availableProducts.length]);

  const toastIconClass =
    toast.type === 'warning'
      ? 'fas fa-exclamation-circle'
      : toast.type === 'error'
        ? 'fas fa-times-circle'
        : 'fas fa-check-circle';

  const modalProduct = quickViewModal.product;
  const modalStock = modalProduct?.quantityInStock || 0;
  const modalRating = modalProduct?.averageRating || 0;
  const modalReviews = modalProduct?.numberOfReviews || 0;

  return (
    <CustomerLayout>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/home">Trang chủ</Link>
          <span className="separator">›</span>
          <span className="current">Sản phẩm</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="hero-section">
        <h1 className="page-title">Tất cả sản phẩm</h1>
        <p className="page-subtitle">Khám phá bộ sưu tập hoa tươi đẹp nhất của chúng tôi</p>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>Đang tải...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: '#f44336', marginBottom: '10px' }}>
                {error?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm'}
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Thử lại
              </button>
            </div>
          ) : availableProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>Không có sản phẩm nào</div>
          ) : (
            <div className="products-grid" id="productsGrid">
              {availableProducts.map((product) => {
                const productId = product.flowerId;
                const productName = product.flowerName || 'Sản phẩm';
                const stock = product.quantityInStock || 0;
                const price = product.unitPrice || 0;
                const image = product.imagePath || 'https://via.placeholder.com/600';
                const description = product.description || 'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.';
                const rating = product.averageRating || 0;
                const reviews = product.numberOfReviews || 0;
                const qty = quantities[productId] || 1;
                const unitQty = unitQuantities[productId] || 1;

                return (
                  <div
                    key={productId}
                    className="product-card"
                    data-product-id={productId}
                    data-product-name={productName}
                    data-product-price={price}
                    data-product-image={image}
                    data-product-stock={stock}
                    data-product-description={description}
                    data-product-rating={rating}
                    data-product-reviews={reviews}
                  >
                    <div className="product-image-container" onClick={() => goToProductDetail(productId)}>
                      <img src={image} alt={productName} className="product-image" />
                      <div className="product-overlay">
                        <button
                          className="quick-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickViewModal(product);
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

                      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%', maxWidth: '100%', alignItems: 'flex-end', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Số bông/bó:</label>
                          <div className="quantity-selector">
                            <button
                              type="button"
                              className="qty-btn minus-btn"
                              onClick={() => handleUnitQuantityChange(productId, -1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={unitQty}
                              min={1}
                              max={999}
                              className="qty-input"
                              onChange={(e) => {
                                handleUnitQuantityInputChange(productId, e.target.value);
                                animateInput(e.target);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="qty-btn plus-btn"
                              onClick={() => handleUnitQuantityChange(productId, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Số bó:</label>
                          <div className="quantity-selector">
                            <button
                              type="button"
                              className="qty-btn minus-btn"
                              onClick={() => handleQuantityChange(productId, -1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={qty}
                              min={1}
                              max={stock}
                              className="qty-input"
                              onChange={(e) => {
                                handleQuantityInputChange(productId, e.target.value);
                                animateInput(e.target);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="qty-btn plus-btn"
                              onClick={() => handleQuantityChange(productId, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, e.target);
                        }}
                        disabled={stock === 0}
                      >
                        <span>THÊM VÀO GIỎ</span>
                        <i className="fas fa-shopping-bag"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewModal.show && (flowerDetail || quickViewModal.product) && (
        <QuickViewModal
          product={flowerDetail || quickViewModal.product}
          isLoading={isLoadingFlowerDetail}
          onClose={closeQuickViewModal}
          onAddToCart={handleAddToCart}
          quantity={modalQuantity}
          unitQuantity={modalUnitQuantity}
          onQuantityChange={(delta) => {
            const stock = flowerDetail?.quantityInStock || quickViewModal.product?.quantityInStock || 0;
            if (delta > 0) {
              if (stock && modalQuantity >= stock) {
                showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${stock}`, 'warning');
                return;
              }
              setModalQuantity((q) => q + 1);
            } else {
              setModalQuantity((q) => Math.max(1, q - 1));
            }
          }}
          onQuantityInputChange={(value) => {
            const stock = flowerDetail?.quantityInStock || quickViewModal.product?.quantityInStock || 0;
            const v = parseInt(value || '1', 10);
            if (!Number.isFinite(v)) return;
            if (stock && v > stock) {
              setModalQuantity(stock);
              showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${stock}`, 'warning');
            } else {
              setModalQuantity(Math.max(1, v));
            }
          }}
          onUnitQuantityChange={(delta) => {
            if (delta > 0) {
              setModalUnitQuantity((q) => Math.min(999, q + 1));
            } else {
              setModalUnitQuantity((q) => Math.max(1, q - 1));
            }
          }}
          onUnitQuantityInputChange={(value) => {
            const v = parseInt(value || '1', 10);
            if (!Number.isFinite(v)) return;
            if (v > 999) {
              setModalUnitQuantity(999);
              showToast('Số lượng bông hoa tối đa: 999', 'warning');
            } else {
              setModalUnitQuantity(Math.max(1, v));
            }
          }}
          formatPrice={formatPrice}
          renderStars={renderStars}
          animateInput={animateInput}
        />
      )}

      {/* Toast */}
      <div
        className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}
        id="toast"
        style={{ display: toast.show ? 'flex' : 'none' }}
      >
        <i className={toastIconClass}></i>
        <span>{toast.message}</span>
      </div>
    </CustomerLayout>
  );
};

// Quick View Modal Component
const QuickViewModal = ({ product, onClose, onAddToCart, quantity, unitQuantity, onQuantityChange, onQuantityInputChange, onUnitQuantityChange, onUnitQuantityInputChange, formatPrice, renderStars, animateInput }) => {
  const productId = product.flowerId;
  const unitPrice = product.unitPrice || 0;
  const maxStock = product.quantityInStock || 0;
  const productName = product.flowerName || 'Sản phẩm';
  const imagePath = product.imagePath || 'https://via.placeholder.com/400';
  const averageRating = product.averageRating || 0;
  const numberOfReviews = product.numberOfReviews || 0;
  const description = product.description || 'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.';

  const modalQtyInputRef = useRef(null);
  const modalUnitQtyInputRef = useRef(null);
  const modalAddToCartBtnRef = useRef(null);
  const modalQuantitySectionRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    
    // Sync width của nút với container quantity section
    const syncModalButtonWidth = () => {
      if (modalQuantitySectionRef.current && modalAddToCartBtnRef.current) {
        const sectionWidth = modalQuantitySectionRef.current.offsetWidth;
        // Override CSS flex và set width cụ thể
        modalAddToCartBtnRef.current.style.flex = 'none';
        modalAddToCartBtnRef.current.style.width = sectionWidth + 'px';
        modalAddToCartBtnRef.current.style.maxWidth = sectionWidth + 'px';
        modalAddToCartBtnRef.current.style.minWidth = sectionWidth + 'px';
      }
    };
    
    // Sync sau khi modal render - dùng multiple timeouts để đảm bảo
    setTimeout(syncModalButtonWidth, 50);
    setTimeout(syncModalButtonWidth, 200);
    setTimeout(syncModalButtonWidth, 500);
    window.addEventListener('resize', syncModalButtonWidth);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', syncModalButtonWidth);
    };
  }, [onClose]);

  return (
    <div className="quick-view-modal active" id="quickViewModal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close-btn" id="modalCloseBtn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal-body">
          <div className="modal-product-image">
            <img src={imagePath} alt={productName} id="modalProductImage" />
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
                <div className="rating-stars">{renderStars(averageRating)}</div>
                <span className="rating-text">({numberOfReviews} đánh giá)</span>
              </div>
            </div>
            <div className="modal-product-description">
              <p id="modalProductDescription">{description}</p>
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
            <div ref={modalQuantitySectionRef} className="modal-quantity-section" style={{ display: 'flex', flexDirection: 'row', gap: '12px', width: '100%', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label className="modal-quantity-label">Số bông/bó:</label>
                <div className="modal-quantity-selector">
                  <button
                    className="modal-qty-btn modal-minus-btn"
                    onClick={() => {
                      onUnitQuantityChange(-1);
                      if (modalUnitQtyInputRef.current) {
                        animateInput(modalUnitQtyInputRef.current);
                      }
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={unitQuantity}
                    min="1"
                    max={999}
                    className="modal-qty-input"
                    onChange={(e) => {
                      onUnitQuantityInputChange(e.target.value);
                      if (modalUnitQtyInputRef.current) {
                        animateInput(modalUnitQtyInputRef.current);
                      }
                    }}
                    ref={modalUnitQtyInputRef}
                  />
                  <button
                    className="modal-qty-btn modal-plus-btn"
                    onClick={() => {
                      onUnitQuantityChange(1);
                      if (modalUnitQtyInputRef.current) {
                        animateInput(modalUnitQtyInputRef.current);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label className="modal-quantity-label">Số bó:</label>
                <div className="modal-quantity-selector" id="modalQuantitySelector">
                  <button
                    className="modal-qty-btn modal-minus-btn"
                    onClick={() => {
                      onQuantityChange(-1);
                      if (modalQtyInputRef.current) {
                        animateInput(modalQtyInputRef.current);
                      }
                    }}
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
                    onChange={(e) => {
                      onQuantityInputChange(e.target.value);
                      if (modalQtyInputRef.current) {
                        animateInput(modalQtyInputRef.current);
                      }
                    }}
                    ref={modalQtyInputRef}
                  />
                  <button
                    className="modal-qty-btn modal-plus-btn"
                    onClick={() => {
                      onQuantityChange(1);
                      if (modalQtyInputRef.current) {
                        animateInput(modalQtyInputRef.current);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              className="modal-add-to-cart-btn"
              id="modalAddToCartBtn"
              onClick={() => {
                // Pass unitQuantity to onAddToCart
                const productWithUnitQty = { ...product, _unitQuantity: unitQuantity, _quantity: quantity };
                onAddToCart(productWithUnitQty, modalAddToCartBtnRef);
                setTimeout(() => {
                  onClose();
                }, 500);
              }}
              disabled={maxStock === 0}
              ref={modalAddToCartBtnRef}
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

export default ProductsPage;
