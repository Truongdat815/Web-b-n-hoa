import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetAllFlowerColorsQuery } from '../../../api/flowers/flowerColorApi';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import '../../../assets/css/product.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: response, isLoading } = useGetAllFlowerColorsQuery();
  const [addToCartMutation] = useAddToCartMutation();

  const products = response?.data || [];

  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [quickViewModal, setQuickViewModal] = useState({ show: false, product: null });
  const [modalQuantity, setModalQuantity] = useState(1);

  const getProductId = (product) => product?.flowerColorId || product?.id || product?.flower_color_id;

  const getProductStock = (product) =>
    product?.quantityInStock ?? product?.quantity_in_stock ?? product?.stockQuantity ?? 0;

  const getProductName = (product) => {
    const flowerName = product?.flower?.name || product?.flower?.flowerName || '';
    const colorName = product?.color?.name || product?.color?.colorName || '';
    return `${flowerName}${colorName ? ` - ${colorName}` : ''}`.trim() || 'Sản phẩm';
  };

  const getProductImage = (product) =>
    product?.imagePath || product?.image_path || 'https://via.placeholder.com/600';

  const getProductDescription = (product) =>
    product?.flower?.description ||
    product?.description ||
    'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.';

  const getBouquetPrice = (product) => {
    const unitPrice = product?.unitPrice ?? product?.unit_price ?? product?.price ?? 0;
    // Default 20 bông/bó như HomePage
    return Number(unitPrice) * 20;
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return '₫' + (Number.isFinite(numPrice) ? numPrice : 0).toLocaleString('vi-VN');
  };

  const showToast = (message, type = 'success') => {
    if (!message) return;
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
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

  const updateQuantity = (productId, next, max) => {
    const clamped = Math.max(1, Math.min(next, max || next));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const goToProductDetail = (productId) => {
    navigate(`/product/detail/${productId}`);
  };

  const openQuickViewModal = (product) => {
    setQuickViewModal({ show: true, product });
    setModalQuantity(1);
  };

  const closeQuickViewModal = () => {
    setQuickViewModal({ show: false, product: null });
  };

  useEffect(() => {
    if (quickViewModal.show) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewModal.show]);

  const handleAddToCart = async (product, quantity) => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
      navigate('/login');
      return;
    }

    const flowerId = product?.flower?.flowerId || product?.flower?.id || product?.flower_id;
    const colorId = product?.color?.colorId || product?.color?.id || product?.color_id;
    if (!flowerId || !colorId) {
      showToast('Sản phẩm không hợp lệ (thiếu flowerId/colorId)', 'error');
      return;
    }

    try {
      await addToCartMutation({
        flowerId,
        colorId,
        unitQuantity: 20,
        quantity,
      }).unwrap();
      showToast('Đã thêm vào giỏ hàng!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!';
      showToast(errorMessage, 'error');
    }
  };

  const toastIconClass =
    toast.type === 'warning'
      ? 'fas fa-exclamation-circle'
      : toast.type === 'error'
        ? 'fas fa-times-circle'
        : 'fas fa-check-circle';

  const modalProduct = quickViewModal.product;
  const modalStock = modalProduct ? getProductStock(modalProduct) : 0;
  const modalRating = modalProduct?.averageRating || modalProduct?.rating || 0;
  const modalReviews = modalProduct?.reviewCount || modalProduct?.reviews || 0;

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
        {isLoading ? (
          <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            Đang tải...
          </div>
        ) : (
          <div className="products-grid" id="productsGrid">
            {products.map((product) => {
              const productId = getProductId(product);
              const productName = getProductName(product);
              const stock = getProductStock(product);
              const price = getBouquetPrice(product);
              const image = getProductImage(product);
              const description = getProductDescription(product);
              const rating = product?.averageRating || product?.rating || 0;
              const reviews = product?.reviewCount || product?.reviews || 0;
              const qty = quantities[productId] || 1;

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

                    <div className="quantity-selector">
                      <button
                        type="button"
                        className="qty-btn minus-btn"
                        onClick={() => updateQuantity(productId, qty - 1, stock)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={qty}
                        min={1}
                        max={stock || undefined}
                        className="qty-input"
                        onChange={(e) => updateQuantity(productId, parseInt(e.target.value || '1', 10), stock)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        className="qty-btn plus-btn"
                        onClick={() => {
                          if (stock && qty >= stock) {
                            showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${stock}`, 'warning');
                            return;
                          }
                          updateQuantity(productId, qty + 1, stock);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, qty);
                      }}
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
      </section>

      {/* Quick View Modal */}
      <div className={`quick-view-modal ${quickViewModal.show ? 'active' : ''}`} id="quickViewModal">
        <div className="modal-overlay" onClick={closeQuickViewModal}></div>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" id="modalCloseBtn" onClick={closeQuickViewModal}>
            <i className="fas fa-times"></i>
          </button>
          <div className="modal-body">
            <div className="modal-product-image">
              <img id="modalProductImage" src={modalProduct ? getProductImage(modalProduct) : ''} alt="Sản phẩm" />
            </div>
            <div className="modal-product-info">
              <h2 className="modal-product-name" id="modalProductName">
                {modalProduct ? getProductName(modalProduct) : ''}
              </h2>

              <div className="modal-price-rating-row">
                <div className="modal-product-price-container">
                  <p className="modal-product-price" id="modalProductPrice">
                    {modalProduct ? formatPrice(getBouquetPrice(modalProduct)) : ''}
                  </p>
                </div>
                <div className="modal-product-rating">
                  <div className="rating-stars">{renderStars(modalRating)}</div>
                  <span className="rating-text">({modalReviews} đánh giá)</span>
                </div>
              </div>

              <div className="modal-product-description">
                <p id="modalProductDescription">{modalProduct ? getProductDescription(modalProduct) : ''}</p>
              </div>

              <div className="modal-product-stock">
                <span className="modal-stock-label">Tình trạng:</span>
                <span
                  className="modal-stock-status"
                  id="modalStockStatus"
                  style={{ color: modalStock > 0 ? '#4caf50' : '#f44336' }}
                >
                  {modalStock > 0 ? `Còn hàng (${modalStock} sản phẩm)` : 'Hết hàng'}
                </span>
              </div>

              <div className="modal-quantity-cart-row">
                <div className="modal-quantity-section">
                  <label className="modal-quantity-label">Số lượng:</label>
                  <div className="modal-quantity-selector" id="modalQuantitySelector">
                    <button
                      type="button"
                      className="modal-qty-btn modal-minus-btn"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                      disabled={modalStock <= 0}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="modalQuantity"
                      value={modalQuantity}
                      min={1}
                      max={modalStock || undefined}
                      className="modal-qty-input"
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '1', 10);
                        if (!Number.isFinite(v)) return;
                        if (modalStock && v > modalStock) {
                          setModalQuantity(modalStock);
                          showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${modalStock}`, 'warning');
                        } else {
                          setModalQuantity(Math.max(1, v));
                        }
                      }}
                      disabled={modalStock <= 0}
                    />
                    <button
                      type="button"
                      className="modal-qty-btn modal-plus-btn"
                      onClick={() => {
                        if (modalStock && modalQuantity >= modalStock) {
                          showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${modalStock}`, 'warning');
                          return;
                        }
                        setModalQuantity((q) => q + 1);
                      }}
                      disabled={modalStock <= 0}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-add-to-cart-btn"
                  id="modalAddToCartBtn"
                  onClick={async () => {
                    if (!modalProduct) return;
                    await handleAddToCart(modalProduct, modalQuantity);
                    if (toast.type !== 'error') closeQuickViewModal();
                  }}
                  disabled={modalStock <= 0}
                  style={{ opacity: modalStock > 0 ? 1 : 0.6, cursor: modalStock > 0 ? 'pointer' : 'not-allowed' }}
                >
                  <i className="fas fa-shopping-cart"></i>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default ProductsPage;
