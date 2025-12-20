import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, Minus, Plus, Check, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import '../../../assets/css/detail.css';
import '../../../assets/css/reviews-fix.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Fetch product data from API
  const { data: response, isLoading, error } = useGetFlowerByIdQuery(id);
  const product = response?.data || null;
  const [addToCartMutation] = useAddToCartMutation();
  const currentUser = useSelector(state => state.auth.user);

  // Get unitPrice and finalPrice from product (API sẽ trả về finalPrice đã apply promotion)
  const unitPrice = product?.unitPrice || 0;
  const productFinalPrice = product?.finalPrice !== undefined ? product.finalPrice : unitPrice;
  
  // Calculate total prices based on quantity
  const calculatePrice = () => {
    if (!product) return { totalPrice: 0, discount: 0 };
    const totalUnitPrice = unitPrice * quantity;
    const totalFinalPrice = productFinalPrice * quantity;
    const discount = totalUnitPrice - totalFinalPrice;
    
    return {
      totalPrice: totalUnitPrice,
      totalFinalPrice,
      discount,
    };
  };

  const { totalPrice, totalFinalPrice, discount } = calculatePrice();

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
    : 0;

  // Render stars helper
  const renderStars = (rating, size = 'normal') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star filled"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage('');
    }, 3000);
  };

  // Load reviews (placeholder - replace with actual API call)
  useEffect(() => {
    // TODO: Replace with actual API call to fetch reviews
    // For now, using empty array
    setReviews([]);
  }, [id]);

  useEffect(() => {
    if (error || (!isLoading && !product)) {
      // Don't navigate immediately, show loading/error state first
    }
  }, [product, error, isLoading, navigate]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-4">Đang tải...</div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !product) {
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

  const productName = product.flowerName || 'Sản phẩm';
  const imagePath = product.imagePath || 'https://via.placeholder.com/600';
  const images = [imagePath, imagePath, imagePath, imagePath];

  const handleAddToCart = async () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tiếp tục', 'warning');
      navigate('/login');
      return;
    }

    try {
      await addToCartMutation({
        flowerId: product.flowerId,
        colorId: null, // No colorId for flowers
        quantity: quantity,
      }).unwrap();
      showToast('Đã thêm vào giỏ hàng thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!';
      showToast(errorMessage, 'error');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để đánh giá!', 'warning');
      return;
    }
    
    // TODO: Replace with actual API call
    const newReview = {
      id: Date.now(),
      account: {
        id: currentUser.id,
        getDisplayName: () => currentUser.name || currentUser.email,
      },
      rating: reviewRating,
      comment: reviewComment,
      reviewDate: new Date(),
    };
    
    setReviews([...reviews, newReview]);
    setReviewComment('');
    setReviewRating(5);
    showToast('Đánh giá đã được gửi thành công!', 'success');
  };

  // Handle edit review
  const handleEditReview = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setEditingReviewId(reviewId);
      setEditRating(review.rating);
      setEditComment(review.comment);
    }
  };

  // Handle save edited review
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    // TODO: Replace with actual API call
    setReviews(reviews.map(review => 
      review.id === editingReviewId
        ? { ...review, rating: editRating, comment: editComment }
        : review
    ));
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
    showToast('Đánh giá đã được cập nhật thành công!', 'success');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  // Handle delete review
  const handleDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    // TODO: Replace with actual API call
    setReviews(reviews.filter(review => review.id !== reviewToDelete));
    setShowDeleteModal(false);
    setReviewToDelete(null);
    showToast('Đánh giá đã được xóa thành công!', 'success');
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get avatar URL
  const getAvatarUrl = (name) => {
    const encodedName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${encodedName}&size=60&background=E95473&color=fff&bold=true`;
  };

  return (
    <CustomerLayout>
      {/* Toast Notification */}
      {showNotification && (
        <div className={`toast ${notificationType} ${showNotification ? 'show' : ''}`}>
          <i className={notificationType === 'error' ? 'fas fa-times-circle' : notificationType === 'warning' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-confirm-modal show" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-modal-header">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Xác nhận xóa đánh giá</h3>
            </div>
            <div className="delete-confirm-modal-body">
              <p>Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="delete-confirm-modal-footer">
              <button type="button" className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button type="button" className="confirm-delete-btn" onClick={confirmDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="separator">›</span>
          <Link to="/products">Sản phẩm</Link>
          <span className="separator">›</span>
          <span className="current">Chi tiết sản phẩm</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <section className="product-detail-section">
        <div className="container">
          <div className="product-detail-grid">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  id="mainProductImage" 
                  src={images[selectedImage] || imagePath} 
                  alt={productName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600?text=No+Image';
                  }}
                />
              </div>
              <div className="thumbnail-images">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img || imagePath}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    data-index={index}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div 
              className="product-info-detail"
              data-product-id={product.flowerId}
              data-product-name={productName}
              data-product-price={productFinalPrice}
              data-product-image={imagePath}
              data-product-stock={product.quantityInStock}
            >
              <h1 className="product-title" id="productTitle">{productName}</h1>
              
              <div className="price-rating-row">
                <div className="product-price-wrapper">
                  {productFinalPrice !== unitPrice ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="product-price" id="productPrice" style={{ color: '#2c2c2c', fontWeight: '600' }}>
                        ₫{productFinalPrice.toLocaleString('vi-VN')}
                      </span>
                      <span style={{ 
                        color: '#999', 
                        textDecoration: 'line-through', 
                        fontSize: '16px',
                        fontWeight: '400'
                      }}>
                        ₫{unitPrice.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ) : (
                    <span className="product-price" id="productPrice">
                      ₫{unitPrice.toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    {renderStars(averageRating)}
                  </div>
                  <span className="rating-count">({reviews.length} đánh giá)</span>
                </div>
              </div>

              <div className="product-short-description">
                <p>{product.description || 'Hoa tươi cao cấp được chọn lọc kỹ lưỡng từ vườn ươm uy tín. Mỗi bông hoa đều được chăm sóc cẩn thận để đảm bảo độ tươi và vẻ đẹp hoàn hảo.'}</p>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <span className="meta-label">Danh mục:</span>
                  <span className="meta-value">{product.category || 'Hoa hồng'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Tình trạng:</span>
                  <span 
                    className={`meta-value stock-status ${product.quantityInStock > 0 ? '' : 'out-of-stock'}`}
                    id="stockStatus"
                    style={{ color: product.quantityInStock > 0 ? '#4caf50' : '#f44336' }}
                  >
                    {product.quantityInStock > 0 
                      ? `Còn hàng (${product.quantityInStock} sản phẩm)` 
                      : 'Hết hàng'}
                  </span>
                </div>
              </div>

              <div className="quantity-cart-row">
                <div className="quantity-section">
                  <label className="quantity-label">Số lượng:</label>
                  <div className="quantity-selector-detail">
                    <button 
                      className="qty-btn-detail minus-btn-detail"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >-</button>
                    <input 
                      type="number" 
                      id="productQuantity" 
                      value={quantity} 
                      min="1" 
                      max={product.quantityInStock}
                      className="qty-input-detail"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(product.quantityInStock, val)));
                      }}
                    />
                    <button 
                      className="qty-btn-detail plus-btn-detail"
                      onClick={() => setQuantity(Math.min(product.quantityInStock, quantity + 1))}
                    >+</button>
                  </div>
                </div>
                <button 
                  className="add-to-cart-btn-detail" 
                  id="addToCartBtn"
                  onClick={handleAddToCart}
                  disabled={product.quantityInStock === 0}
                >
                  <i className="fas fa-shopping-cart"></i>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="product-tabs" id="reviews">
            <div className="reviews-container">
              {/* Left Column: Reviews List */}
              <div className="reviews-list-column">
                <h3 className="reviews-section-title">Đánh giá từ khách hàng</h3>
                
                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <p>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="review-item" data-review-id={review.id}>
                      {/* Display Mode */}
                      {editingReviewId !== review.id ? (
                        <div className="review-display" id={`review-display-${review.id}`}>
                          <div className="review-item-header">
                            <div className="reviewer-info">
                              <img 
                                className="reviewer-avatar-img"
                                src={getAvatarUrl(review.account?.getDisplayName?.() || 'User')}
                                alt={review.account?.getDisplayName?.() || 'User'}
                              />
                              <div className="reviewer-details">
                                <div className="reviewer-name-wrapper">
                                  <h4 className="reviewer-name">
                                    {review.account?.getDisplayName?.() || 'Anonymous'}
                                  </h4>
                                  {/* Edit/Delete Buttons - Only show if user owns this review */}
                                  {currentUser && review.account?.id === currentUser.id && (
                                    <div className="review-actions">
                                      <button 
                                        type="button" 
                                        className="edit-review-btn"
                                        data-review-id={review.id}
                                        onClick={() => handleEditReview(review.id)}
                                      >
                                        <i className="fas fa-edit"></i>
                                        <span className="tooltip-text">Chỉnh sửa</span>
                                      </button>
                                      <button 
                                        type="button" 
                                        className="delete-review-btn"
                                        data-review-id={review.id}
                                        data-product-id={product.flowerId}
                                        onClick={() => handleDeleteReview(review.id)}
                                      >
                                        <i className="fas fa-trash"></i>
                                        <span className="tooltip-text">Xóa</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="review-stars">
                                  {renderStars(review.rating || 0)}
                                </div>
                              </div>
                            </div>
                            <span className="review-date-pill">
                              {formatDate(review.reviewDate)}
                            </span>
                          </div>
                          <p className="review-text">{review.comment || ''}</p>
                        </div>
                      ) : (
                        /* Edit Mode */
                        <div className="review-edit" id={`review-edit-${review.id}`}>
                          <form 
                            className="edit-review-form"
                            data-review-id={review.id}
                            data-product-id={product.flowerId}
                            onSubmit={handleSaveEdit}
                          >
                            <div className="form-group">
                              <label className="form-label">Đánh giá:</label>
                              <div className="rating-input">
                                <input 
                                  type="hidden" 
                                  name="rating"
                                  id={`editRating-${review.id}`}
                                  value={editRating}
                                  required
                                />
                                <div className="rating-stars-input edit-rating-stars" data-review-id={review.id}>
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <i
                                      key={i}
                                      className={i <= editRating ? 'fas fa-star filled active' : 'far fa-star'}
                                      data-rating={i}
                                      onClick={() => setEditRating(i)}
                                      onMouseEnter={() => setEditRating(i)}
                                    ></i>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Bình luận:</label>
                              <textarea 
                                className="form-textarea edit-comment"
                                name="comment"
                                id={`editComment-${review.id}`}
                                rows="4"
                                required
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                              ></textarea>
                            </div>
                            <div className="edit-form-actions">
                              <button type="submit" className="save-review-btn">Lưu</button>
                              <button 
                                type="button" 
                                className="cancel-edit-btn"
                                data-review-id={review.id}
                                onClick={handleCancelEdit}
                              >Hủy</button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Right Column: Add Review Form */}
              <div className="add-review-column">
                <h3 className="add-review-title">Thêm đánh giá</h3>
                <form id="addReviewForm" className="add-review-form" onSubmit={handleSubmitReview}>
                  <div className="form-group">
                    <label className="form-label">Đánh giá của bạn:</label>
                    <div className="rating-input">
                      <input 
                        type="hidden" 
                        name="rating" 
                        id="reviewRating" 
                        value={reviewRating}
                        required
                      />
                      <div className="rating-stars-input" id="ratingStarsInput">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <i
                            key={i}
                            className={i <= reviewRating ? 'fas fa-star filled active' : 'far fa-star'}
                            data-rating={i}
                            onClick={() => setReviewRating(i)}
                            onMouseEnter={() => setReviewRating(i)}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reviewComment">Bình luận:</label>
                    <textarea 
                      id="reviewComment" 
                      name="comment" 
                      className="form-textarea" 
                      placeholder="Nhập bình luận của bạn..." 
                      rows="6" 
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-review-btn">GỬI ĐÁNH GIÁ</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default ProductDetailPage;
