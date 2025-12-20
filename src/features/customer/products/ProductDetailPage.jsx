import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { ShoppingCart, Heart, Star, Truck, Shield, Package, Minus, Plus, Check, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import { useAddToCartMutation } from '../../../api/cart/cartApi';
import { useGetMeQuery } from '../../../api/users/userApi';
import { 
  useGetFeedbacksByFlowerQuery, 
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation 
} from '../../../api/feedbacks/feedbackApi';
import '../../../assets/css/detail.css';
import '../../../assets/css/reviews-fix.css';
import '../../../assets/css/reviews-modern.css';
import '../../../assets/css/reviews-elegant.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Reviews state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [orderDetailId, setOrderDetailId] = useState(null); // For creating feedback
  const [showReviewForm, setShowReviewForm] = useState(false); // Control review form visibility

  // Fetch product data from API
  const { data: response, isLoading, error } = useGetFlowerByIdQuery(id);
  const product = response?.data || null;
  const [addToCartMutation] = useAddToCartMutation();
  const currentUser = useSelector(state => state.auth.user);
  
  // Get current user info from API to compare with feedback customerId
  const { data: userResponse } = useGetMeQuery();
  const currentUserInfo = userResponse?.data || {};

  // Fetch feedbacks for this flower
  const { data: feedbacksResponse, isLoading: feedbacksLoading, refetch: refetchFeedbacks } = useGetFeedbacksByFlowerQuery(id, {
    skip: !id,
  });
  const feedbacks = feedbacksResponse?.data || [];

  // Feedback mutations
  const [createFeedback, { isLoading: isCreating }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();

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

  // Calculate average rating from feedbacks
  const averageRating = feedbacks.length > 0
    ? feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / feedbacks.length
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

  // Feedbacks are loaded via useGetFeedbacksByFlowerQuery hook

  // Function to scroll to review by orderDetailId
  const scrollToReview = (orderDetailId) => {
    if (!orderDetailId || feedbacks.length === 0) return;
    
    // Find the feedback that matches this orderDetailId
    const matchingFeedback = feedbacks.find(f => f.orderDetailId === orderDetailId);
    
    if (matchingFeedback) {
      // Try multiple times to find the element (wait for DOM to render)
      let attempts = 0;
      const maxAttempts = 10;
      
      const tryScroll = () => {
        attempts++;
        const reviewElement = document.querySelector(`[data-review-id="${matchingFeedback.feedbackId}"]`);
        
        if (reviewElement) {
          // Scroll to the review
          reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight with pink background and flash effect
          const reviewDisplay = reviewElement.querySelector('.review-display');
          if (reviewDisplay) {
            reviewDisplay.style.backgroundColor = '#FFE5EA';
            reviewDisplay.style.transition = 'background-color 0.3s';
            reviewDisplay.style.borderRadius = '8px';
            reviewDisplay.style.padding = '16px';
            
            // Flash effect - fade out after 3 seconds
            setTimeout(() => {
              reviewDisplay.style.backgroundColor = '';
            }, 3000);
          }
        } else if (attempts < maxAttempts) {
          // Retry after a short delay
          setTimeout(tryScroll, 200);
        }
      };
      
      // Start trying after a short initial delay
      setTimeout(tryScroll, 100);
    }
  };

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    // Check if we need to scroll to a specific review
    const hash = window.location.hash;
    if (hash && hash.startsWith('#review-')) {
      // Extract orderDetailId from hash (format: #review-{orderDetailId})
      const orderDetailIdStr = hash.replace('#review-', '');
      const orderDetailId = parseInt(orderDetailIdStr);
      
      if (!isNaN(orderDetailId)) {
        if (feedbacks.length > 0) {
          // Feedbacks already loaded, scroll immediately
          scrollToReview(orderDetailId);
        }
        // If feedbacks not loaded yet, wait for them to load (handled in next useEffect)
      }
    } else {
      // Normal scroll to top
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Scroll to review when feedbacks are loaded and hash exists
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#review-') && feedbacks.length > 0) {
      const orderDetailIdStr = hash.replace('#review-', '');
      const orderDetailId = parseInt(orderDetailIdStr);
      
      if (!isNaN(orderDetailId)) {
        scrollToReview(orderDetailId);
      }
    }
  }, [feedbacks]);

  // Listen for hash changes (when navigating within the same page)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#review-') && feedbacks.length > 0) {
        const orderDetailIdStr = hash.replace('#review-', '');
        const orderDetailId = parseInt(orderDetailIdStr);
        
        if (!isNaN(orderDetailId)) {
          scrollToReview(orderDetailId);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [feedbacks]);

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
    
    if (!orderDetailId) {
      showToast('Vui lòng chọn đơn hàng để đánh giá!', 'warning');
      return;
    }

    try {
      await createFeedback({
        orderDetailId: orderDetailId,
        rating: reviewRating,
        content: reviewComment,
      }).unwrap();
      
      setReviewComment('');
      setReviewRating(5);
      setOrderDetailId(null);
      refetchFeedbacks();
      showToast('Đánh giá đã được gửi thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!';
      showToast(errorMessage, 'error');
    }
  };

  // Handle edit review
  const handleEditReview = (feedbackId) => {
    const feedback = feedbacks.find(f => f.feedbackId === feedbackId);
    if (feedback) {
      setEditingReviewId(feedbackId);
      setEditRating(feedback.rating);
      setEditComment(feedback.content || '');
    }
  };

  // Handle save edited review
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReviewId) return;

    try {
      await updateFeedback({
        feedbackId: editingReviewId,
        rating: editRating,
        content: editComment,
      }).unwrap();
      
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment('');
      refetchFeedbacks();
      showToast('Đánh giá đã được cập nhật thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá!';
      showToast(errorMessage, 'error');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  // Handle delete review
  const handleDeleteReview = (feedbackId) => {
    setReviewToDelete(feedbackId);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteFeedback(reviewToDelete).unwrap();
      setShowDeleteModal(false);
      setReviewToDelete(null);
      refetchFeedbacks();
      showToast('Đánh giá đã được xóa thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá!';
      showToast(errorMessage, 'error');
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
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
                  src={imagePath} 
                  alt={productName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600?text=No+Image';
                  }}
                />
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
                  <span className="rating-count">({feedbacks.length} đánh giá)</span>
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

          {/* Reviews Section - Elegant Minimalist Design */}
          <div className="product-tabs elegant-reviews-section" id="reviews">
            <div className="elegant-reviews-container">
              <h2 className="elegant-reviews-title">Đánh giá từ khách hàng</h2>
              
              {feedbacksLoading ? (
                <div className="elegant-empty-state">
                  <div className="elegant-empty-icon">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                  <p className="elegant-empty-text">Đang tải đánh giá...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="elegant-empty-state">
                  <div className="elegant-empty-icon">
                    <i className="fas fa-star elegant-star-icon"></i>
                    <i className="fas fa-flower elegant-flower-icon"></i>
                  </div>
                  <p className="elegant-empty-text">
                    Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận về bó hoa này nhé!
                  </p>
                  {!currentUser ? (
                    <button 
                      className="elegant-cta-button"
                      onClick={() => navigate('/login')}
                    >
                      <i className="fas fa-pen"></i>
                      Viết đánh giá ngay
                    </button>
                  ) : (
                    <button 
                      className="elegant-cta-button"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <i className="fas fa-pen"></i>
                      Viết đánh giá ngay
                    </button>
                  )}
                </div>
              ) : (
                <div className="elegant-reviews-list">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.feedbackId} className="review-item" data-review-id={feedback.feedbackId}>
                      {/* Display Mode */}
                      {editingReviewId !== feedback.feedbackId ? (
                        <div className="review-display" id={`review-display-${feedback.feedbackId}`}>
                          <div className="review-item-header">
                            <div className="reviewer-info">
                              <img 
                                className="reviewer-avatar-img"
                                src={getAvatarUrl(feedback.customerName || 'User')}
                                alt={feedback.customerName || 'User'}
                              />
                              <div className="reviewer-details">
                                <div className="reviewer-name-wrapper">
                                  <h4 className="reviewer-name">
                                    {feedback.customerName || 'Anonymous'}
                                  </h4>
                                  {/* Edit/Delete Buttons - Only show if user owns this review */}
                                  {currentUser && (feedback.customerId === currentUserInfo.userId || feedback.customerId === currentUserInfo.id || feedback.customerId === currentUser?.id) && (
                                    <div className="review-actions">
                                      <button 
                                        type="button" 
                                        className="edit-review-btn"
                                        data-review-id={feedback.feedbackId}
                                        onClick={() => handleEditReview(feedback.feedbackId)}
                                      >
                                        <i className="fas fa-edit"></i>
                                        <span className="tooltip-text">Chỉnh sửa</span>
                                      </button>
                                      <button 
                                        type="button" 
                                        className="delete-review-btn"
                                        data-review-id={feedback.feedbackId}
                                        data-product-id={product.flowerId}
                                        onClick={() => handleDeleteReview(feedback.feedbackId)}
                                      >
                                        <i className="fas fa-trash"></i>
                                        <span className="tooltip-text">Xóa</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="review-stars">
                                  {renderStars(feedback.rating || 0)}
                                </div>
                              </div>
                            </div>
                            <span className="review-date-pill">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                          <p className="review-text">{feedback.content || ''}</p>
                        </div>
                      ) : (
                        /* Edit Mode */
                        <div className="review-edit" id={`review-edit-${feedback.feedbackId}`}>
                          <form 
                            onSubmit={handleSaveEdit}
                          >
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                                Đánh giá (sao):
                              </label>
                              <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <i
                                    key={i}
                                    className={i <= editRating ? 'fas fa-star' : 'far fa-star'}
                                    style={{ 
                                      color: i <= editRating ? '#FFD700' : '#ddd', 
                                      fontSize: '28px',
                                    }}
                                    onClick={() => setEditRating(i)}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                                Nội dung đánh giá:
                              </label>
                              <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows="5"
                                required
                                style={{
                                  width: '100%',
                                  padding: '12px',
                                  border: '2px solid #e8e8e8',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  boxSizing: 'border-box',
                                }}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: '#f0f0f0',
                                  color: '#2c2c2c',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Hủy
                              </button>
                              <button
                                type="submit"
                                disabled={isUpdating}
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: '#E95473',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                                  opacity: isUpdating ? 0.6 : 1,
                                }}
                              >
                                {isUpdating ? 'Đang lưu...' : 'Lưu'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                  {!currentUser ? (
                    <div className="elegant-write-review-prompt">
                      <button 
                        className="elegant-cta-button"
                        onClick={() => navigate('/login')}
                      >
                        <i className="fas fa-pen"></i>
                        Viết đánh giá ngay
                      </button>
                    </div>
                  ) : (
                    <div className="elegant-write-review-prompt">
                      <button 
                        className="elegant-cta-button"
                        onClick={() => setShowReviewForm(true)}
                      >
                        <i className="fas fa-pen"></i>
                        Viết đánh giá ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
              <div className="elegant-review-modal-overlay" onClick={() => setShowReviewForm(false)}>
                <div className="elegant-review-modal" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="elegant-modal-close"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <h3 className="elegant-modal-title">Viết đánh giá</h3>
                  {!currentUser ? (
                    <div className="elegant-modal-login-prompt">
                      <p>Vui lòng đăng nhập để đánh giá sản phẩm</p>
                      <Link to="/login" className="elegant-cta-button">
                        Đăng nhập
                      </Link>
                    </div>
                  ) : (
                    <div className="elegant-modal-login-prompt">
                      <p>Để đánh giá sản phẩm, vui lòng truy cập trang <Link to="/profile#orders" style={{ color: '#E95473', fontWeight: '600' }}>Đơn hàng</Link> của bạn và chọn đánh giá từ đơn hàng đã mua.</p>
                      <Link to="/profile#orders" className="elegant-cta-button">
                        Xem đơn hàng
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default ProductDetailPage;
