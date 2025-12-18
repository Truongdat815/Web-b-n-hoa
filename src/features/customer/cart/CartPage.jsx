import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetMyCartQuery, useUpdateCartMutation, useRemoveFromCartMutation } from '../../../api/cart/cartApi';
import { useCreateOrderMutation, useLazyGetVnpayPaymentUrlQuery } from '../../../api/orders/orderApi';
import { useGetAllRecipientInfosQuery, useCreateRecipientInfoMutation } from '../../../api/recipientInfos/recipientInfoApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/cart.css';
import '../../../assets/css/home.css';

// Cart Item Component
const CartItem = ({ item, quantity, onQuantityChange, onQuantityInputChange, onRemove, formatPrice, showToast }) => {
  const cartId = item.cartId || item.id;
  const productId = item.flowerId || item.productId || cartId;
  const productName = item.flowerName || item.productName || item.name || 'Sản phẩm';
  const imageUrl = item.imagePath || item.imageUrl || item.image_path || 'https://via.placeholder.com/120x120?text=Product';
  const unitPrice = item.unitPrice || item.unit_price || item.price || 0; // Giá gốc 1 bó
  const finalPrice = item.finalPrice !== undefined && item.finalPrice !== null ? item.finalPrice : unitPrice; // Giá sau promotion 1 bó
  const stock = item.quantityInStock || item.stock || null;
  const maxQuantity = stock !== null ? stock : 999999;
  // Use totalPrice from API (giá tổng sau promotion), otherwise calculate from finalPrice * quantity
  const totalPrice = item.totalPrice !== undefined && item.totalPrice !== null 
    ? item.totalPrice 
    : finalPrice * quantity;
  const originalTotalPrice = item.originalTotalPrice !== undefined && item.originalTotalPrice !== null
    ? item.originalTotalPrice
    : unitPrice * quantity; // Tổng giá gốc (trước promotion)

  const qtyInputRef = useRef(null);

  const animateInput = (inputElement) => {
    if (inputElement && inputElement.style) {
      inputElement.style.transform = 'scale(1.2)';
      setTimeout(() => {
        inputElement.style.transform = 'scale(1)';
      }, 200);
    }
  };

  return (
    <div className="cart-item" data-product-id={productId}>
      <button
        className="remove-item-btn"
        data-product-id={productId}
        onClick={() => onRemove(cartId)}
      >
        <i className="fas fa-times"></i>
      </button>
      <div className="item-image">
        <img src={imageUrl} alt={productName} />
      </div>
      <div className="item-details">
        <h3 className="item-name">{productName}</h3>
        <div className="item-price">
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Giá bán</div>
          {finalPrice !== unitPrice && finalPrice > 0 && unitPrice > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: '#2c2c2c', fontWeight: '600' }}>
                {formatPrice(finalPrice)}
              </span>
              <span style={{ 
                color: '#999', 
                textDecoration: 'line-through', 
                fontSize: '14px',
                fontWeight: '400'
              }}>
                {formatPrice(unitPrice)}
              </span>
            </div>
          ) : (
            <span>{formatPrice(Math.max(0, unitPrice || finalPrice || 0))}</span>
          )}
        </div>
      </div>
      <div className="item-quantity">
            <button
              className="qty-btn minus-btn"
              data-product-id={productId}
              onClick={() => {
                onQuantityChange(cartId, quantity - 1, qtyInputRef);
                if (qtyInputRef.current) animateInput(qtyInputRef.current);
              }}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              min="1"
              max={maxQuantity}
              className="qty-input"
              data-product-id={productId}
              data-unit-price={unitPrice}
              data-stock={stock !== null ? stock : undefined}
              onChange={(e) => {
                // Call API immediately when value changes
                onQuantityInputChange(cartId, e.target.value, qtyInputRef);
              }}
              ref={qtyInputRef}
            />
            <button
              className="qty-btn plus-btn"
              data-product-id={productId}
              onClick={() => {
                onQuantityChange(cartId, quantity + 1, qtyInputRef);
                if (qtyInputRef.current) animateInput(qtyInputRef.current);
              }}
            >
              +
            </button>
          </div>
      <div className="item-total">
        {totalPrice !== originalTotalPrice ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="total-price" style={{ color: '#2c2c2c', fontWeight: '600' }}>
              {formatPrice(totalPrice)}
            </span>
            <span style={{ 
              color: '#999', 
              textDecoration: 'line-through', 
              fontSize: '14px',
              fontWeight: '400'
            }}>
              {formatPrice(originalTotalPrice)}
            </span>
          </div>
        ) : (
          <span className="total-price">{formatPrice(totalPrice)}</span>
        )}
      </div>
    </div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data: cartResponse, isLoading, refetch } = useGetMyCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCart] = useUpdateCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [createOrder] = useCreateOrderMutation();
  const [getVnpayPaymentUrl] = useLazyGetVnpayPaymentUrlQuery();

  const cartItems = cartResponse?.data || [];

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [selectedRecipientInfoId, setSelectedRecipientInfoId] = useState(null);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [newRecipientData, setNewRecipientData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    isDefault: false,
  });

  // Fetch recipient infos
  const { data: recipientInfosResponse, refetch: refetchRecipientInfos } = useGetAllRecipientInfosQuery(undefined, {
    skip: !isAuthenticated,
  });
  const recipientInfos = recipientInfosResponse?.data || [];
  const [createRecipientInfo] = useCreateRecipientInfoMutation();

  // Initialize quantities from cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialQuantities = {};
      cartItems.forEach((item) => {
        const cartId = item.cartId || item.id;
        initialQuantities[cartId] = item.quantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, [cartItems.length]);

  // Auto-fill recipient info with default: true
  useEffect(() => {
    if (recipientInfos.length > 0 && !selectedRecipientInfoId) {
      const defaultInfo = recipientInfos.find((info) => info.default === true);
      if (defaultInfo) {
        setRecipientName(defaultInfo.recipientName || '');
        setRecipientPhone(defaultInfo.recipientPhone || '');
        setShippingAddress(defaultInfo.recipientAddress || '');
        setSelectedRecipientInfoId(defaultInfo.infoId);
      }
    }
  }, [recipientInfos.length, selectedRecipientInfoId]);

  // Handle select recipient info
  const handleSelectRecipientInfo = (infoId) => {
    const selectedInfo = recipientInfos.find((info) => info.infoId === infoId);
    if (selectedInfo) {
      setRecipientName(selectedInfo.recipientName || '');
      setRecipientPhone(selectedInfo.recipientPhone || '');
      setShippingAddress(selectedInfo.recipientAddress || '');
      setSelectedRecipientInfoId(infoId);
    }
  };

  // Handle create new recipient info
  const handleCreateRecipientInfo = async (e) => {
    e.preventDefault();

    // Validate
    if (!newRecipientData.recipientName || !newRecipientData.recipientName.trim()) {
      showToast('Vui lòng nhập tên người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientPhone || !newRecipientData.recipientPhone.trim()) {
      showToast('Vui lòng nhập số điện thoại người nhận!', 'error');
      return;
    }
    if (!newRecipientData.recipientAddress || !newRecipientData.recipientAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ người nhận!', 'error');
      return;
    }

    try {
      const result = await createRecipientInfo({
        recipientName: newRecipientData.recipientName.trim(),
        recipientPhone: newRecipientData.recipientPhone.trim(),
        recipientAddress: newRecipientData.recipientAddress.trim(),
        isDefault: newRecipientData.isDefault,
      }).unwrap();

      showToast('Thêm thông tin người nhận thành công!', 'success');
      
      setNewRecipientData({
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        isDefault: false,
      });
      setShowAddRecipientModal(false);
      
      // Refetch and then auto-select the newly created info
      const refetchResult = await refetchRecipientInfos();
      if (result?.data?.infoId && refetchResult?.data?.data) {
        const newInfoId = result.data.infoId;
        setTimeout(() => {
          handleSelectRecipientInfo(newInfoId);
        }, 100);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Thêm thông tin người nhận thất bại!';
      showToast(errorMessage, 'error');
    }
  };

  const handleCancelAddRecipient = () => {
    setShowAddRecipientModal(false);
    setNewRecipientData({
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      isDefault: false,
    });
  };

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    const validPrice = Number.isFinite(numPrice) && numPrice >= 0 ? numPrice : 0;
    return '₫' + validPrice.toLocaleString('vi-VN');
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  // Update cart item quantity (số bó)
  const handleUpdateQuantity = async (cartId, newQuantity, inputRef = null) => {
    const item = cartItems.find((i) => (i.cartId || i.id) === cartId);
    if (!item) return;

    const stock = item.quantityInStock || item.stock || null;
    const maxQuantity = stock !== null ? stock : 999999;

    if (newQuantity > maxQuantity) {
      showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${maxQuantity}`, 'warning');
      setQuantities((prev) => ({ ...prev, [cartId]: maxQuantity }));
      return;
    }

    if (newQuantity < 1) {
      setQuantities((prev) => ({ ...prev, [cartId]: 1 }));
      return;
    }

    setQuantities((prev) => ({ ...prev, [cartId]: newQuantity }));

    if (inputRef?.current) {
      animateInput(inputRef.current);
    }

    try {
      await updateCart({
        cartId,
        quantity: newQuantity,
      }).unwrap();
      // Refetch to get updated totalPrice from API
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || newQuantity }));
          }
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng';
      showToast(errorMessage, 'error');
      // Revert quantity on error
      setQuantities((prev) => ({ ...prev, [cartId]: item.quantity || 1 }));
    }
  };

  // Handle quantity input change (số bó)
  const handleQuantityInputChange = async (cartId, value, inputRef = null) => {
    const item = cartItems.find((i) => (i.cartId || i.id) === cartId);
    if (!item) return;

    const stock = item.quantityInStock || item.stock || null;
    const maxQuantity = stock !== null ? stock : 999999;
    const numValue = parseInt(value) || 1;

    let finalValue;
    if (numValue < 1) {
      finalValue = 1;
    } else if (numValue > maxQuantity) {
      finalValue = maxQuantity;
      showToast(`Số lượng vượt quá tồn kho! Tồn kho hiện có: ${maxQuantity}`, 'warning');
    } else {
      finalValue = numValue;
    }

    setQuantities((prev) => ({ ...prev, [cartId]: finalValue }));

    if (inputRef?.current) {
      animateInput(inputRef.current);
    }

    try {
      await updateCart({
        cartId,
        quantity: finalValue,
      }).unwrap();
      // Refetch to get updated totalPrice from API
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || finalValue }));
          }
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng';
      showToast(errorMessage, 'error');
      setQuantities((prev) => ({ ...prev, [cartId]: item.quantity || 1 }));
    }
  };

  // Remove cart item
  const handleRemoveItem = async (cartId) => {
    try {
      await removeFromCart(cartId).unwrap();
      await refetch();
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm';
      showToast(errorMessage, 'error');
    }
  };

  // Calculate cart summary
  // API returns unitPrice (giá 1 bó) and totalPrice (unitPrice * quantity)
  const calculateSummary = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      // Always use totalPrice from API response (it's calculated server-side)
      // This ensures the price is always correct after any update
      if (item.totalPrice !== undefined && item.totalPrice !== null) {
        subtotal += item.totalPrice;
      } else {
        // Fallback: calculate from unitPrice * quantity if totalPrice is not available
        const quantity = quantities[item.cartId || item.id] || item.quantity || 1;
        const unitPrice = item.unitPrice || item.unit_price || item.price || 0;
        subtotal += unitPrice * quantity;
      }
    });

    const shipping = 15000; // 15,000 VND
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  };

  const summary = calculateSummary();

  // Handle checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng trống!', 'warning');
      return;
    }

    if (!recipientName.trim()) {
      setCheckoutError('Vui lòng nhập tên người nhận.');
      showToast('Tên người nhận không được để trống.', 'warning');
      return;
    }

    if (!recipientPhone.trim()) {
      setCheckoutError('Vui lòng nhập số điện thoại người nhận.');
      showToast('Số điện thoại người nhận không được để trống.', 'warning');
      return;
    }

    if (!shippingAddress.trim()) {
      setCheckoutError('Vui lòng nhập địa chỉ giao hàng.');
      showToast('Địa chỉ giao hàng không được để trống.', 'warning');
      return;
    }

    if (!deliveryDate.trim()) {
      setCheckoutError('Vui lòng chọn ngày giao hàng.');
      showToast('Vui lòng chọn ngày giao hàng.', 'warning');
      return;
    }

    if (!deliveryTime.trim()) {
      setCheckoutError('Vui lòng chọn giờ giao hàng.');
      showToast('Vui lòng chọn giờ giao hàng.', 'warning');
      return;
    }

    setCheckoutError('');
    setShowConfirmModal(true);
  };

  // Confirm checkout
  const handleConfirmCheckout = async () => {
    setShowConfirmModal(false);
    setIsCheckoutLoading(true);

    try {
      const cartIds = cartItems.map((item) => item.cartId || item.id);
      
      // Combine deliveryDate and deliveryTime into ISO datetime string
      const deliveryDateTime = new Date(`${deliveryDate}T${deliveryTime}:00`);
      const deliveryDateISO = deliveryDateTime.toISOString();
      
      const result = await createOrder({
        cartIds,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientAddress: shippingAddress.trim(),
        note: orderNote.trim() || '',
        deliveryDate: deliveryDateISO,
        shippingFee: 15000,
      }).unwrap();

      // Get orderId from response
      const orderId = result.orderId || result.data?.orderId;
      
      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ server');
      }

      // Get VNPay payment URL
      try {
        const paymentResponse = await getVnpayPaymentUrl(orderId).unwrap();
        const paymentUrl = paymentResponse.data || paymentResponse;
        
        if (paymentUrl && typeof paymentUrl === 'string') {
          // Redirect to payment URL
          window.location.href = paymentUrl;
        } else {
          throw new Error('Không nhận được URL thanh toán từ server');
        }
      } catch (paymentError) {
        const paymentErrorMessage = paymentError?.data?.message || paymentError?.message || 'Có lỗi xảy ra khi lấy URL thanh toán. Vui lòng thử lại.';
        showToast(paymentErrorMessage, 'error');
        setCheckoutError(paymentErrorMessage);
        setIsCheckoutLoading(false);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
      setCheckoutError(errorMessage);
      setIsCheckoutLoading(false);
    }
  };

  // Close confirm modal
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  // Handle escape key for modal
  useEffect(() => {
    if (showConfirmModal) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCloseConfirmModal();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showConfirmModal]);

  if (!isAuthenticated) {
    return (
      <CustomerLayout>
        <div className="main-content">
          <div className="cart-container">
            <h1 className="cart-title">Giỏ hàng của tôi</h1>
            <div className="cart-empty">
              <div className="empty-cart-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <p className="empty-cart-message">Vui lòng đăng nhập để xem giỏ hàng</p>
              <Link to="/login" className="continue-browsing">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="main-content">
          <div className="cart-container">
            <h1 className="cart-title">Giỏ hàng của tôi</h1>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>Đang tải...</div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <main className="main-content">
        <div className="cart-container">
          <h1 className="cart-title">Giỏ hàng của tôi</h1>

          {/* Empty Cart State */}
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-cart-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <p className="empty-cart-message">Giỏ hàng trống</p>
              <Link to="/home" className="continue-browsing">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="cart-with-items">
              <div className="cart-items-section">
                <div className="cart-items" id="cartItemsList">
                  {cartItems.map((item) => {
                    const cartId = item.cartId || item.id;
                    const quantity = quantities[cartId] || item.quantity || 1;
                    return (
                      <CartItem
                        key={cartId}
                        item={item}
                        quantity={quantity}
                        onQuantityChange={handleUpdateQuantity}
                        onQuantityInputChange={handleQuantityInputChange}
                        onRemove={handleRemoveItem}
                        formatPrice={formatPrice}
                        showToast={showToast}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="cart-summary">
                <h2 className="summary-title">Tổng giỏ hàng</h2>

                <div className="checkout-info">
                  <h3>Thông tin người nhận</h3>
                  
                  {/* Select recipient info dropdown */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <label htmlFor="selectRecipientInfo" style={{ fontWeight: '600', flex: 1 }}>
                        Chọn thông tin giao hàng
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddRecipientModal(true)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#E95473',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Thêm mới
                      </button>
                    </div>
                    {recipientInfos.length > 0 ? (
                      <select
                        id="selectRecipientInfo"
                        value={selectedRecipientInfoId || ''}
                        onChange={(e) => {
                          const infoId = e.target.value ? parseInt(e.target.value) : null;
                          if (infoId) {
                            handleSelectRecipientInfo(infoId);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                        }}
                      >
                        <option value="">-- Chọn thông tin giao hàng --</option>
                        {recipientInfos.map((info) => (
                          <option key={info.infoId} value={info.infoId}>
                            {info.recipientName} - {info.recipientPhone}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                        Chưa có thông tin giao hàng. Vui lòng thêm mới.
                      </p>
                    )}
                  </div>

                  {/* Display selected recipient info */}
                  {selectedRecipientInfoId && recipientInfos.length > 0 && (
                    <div style={{
                      padding: '15px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      marginBottom: '20px',
                    }}>
                      {(() => {
                        const selectedInfo = recipientInfos.find(info => info.infoId === selectedRecipientInfoId);
                        return selectedInfo ? (
                          <>
                            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                              {selectedInfo.recipientName} - {selectedInfo.recipientPhone}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              {selectedInfo.recipientAddress}
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Delivery date and time */}
                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label htmlFor="deliveryDate" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Ngày giao hàng <span style={{ color: '#e95473' }}>*</span>
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input
                          type="date"
                          id="deliveryDate"
                          value={deliveryDate}
                          onChange={(e) => {
                            setDeliveryDate(e.target.value);
                            setDeliveryTime(''); // Reset time when date changes
                            setCheckoutError('');
                          }}
                          min={(() => {
                            const today = new Date();
                            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          })()}
                          style={{
                            width: '100%',
                            padding: '10px',
                            paddingRight: '40px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            color: deliveryDate ? '#2c2c2c' : 'transparent',
                            backgroundColor: '#ffffff',
                          }}
                          required
                        />
                        {!deliveryDate && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '10px',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                              fontSize: '14px',
                              color: '#999',
                              userSelect: 'none',
                              zIndex: 1,
                            }}
                          >
                            dd/mm/yyyy
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="deliveryTime" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                        Giờ giao hàng <span style={{ color: '#e95473' }}>*</span>
                      </label>
                      <select
                        id="deliveryTime"
                        value={deliveryTime}
                        onChange={(e) => {
                          setDeliveryTime(e.target.value);
                          setCheckoutError('');
                        }}
                        disabled={!deliveryDate}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          backgroundColor: !deliveryDate ? '#f5f5f5' : '#ffffff',
                          cursor: !deliveryDate ? 'not-allowed' : 'pointer',
                        }}
                        required
                      >
                        <option value="">-- Chọn giờ giao hàng --</option>
                        {(() => {
                          if (!deliveryDate) return null;
                          
                          const selectedDate = new Date(deliveryDate + 'T00:00:00');
                          const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                          
                          // Check if selected date is today (using local date)
                          const today = new Date();
                          const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          const isToday = deliveryDate === todayString;
                          
                          const now = new Date();
                          const currentHour = now.getHours();
                          const currentMinute = now.getMinutes();
                          const currentTimeInMinutes = currentHour * 60 + currentMinute;
                          
                          // Define working hours
                          let startTime, endTime;
                          if (dayOfWeek === 0) { // Sunday
                            startTime = { hour: 14, minute: 30 }; // 14:30
                            endTime = { hour: 17, minute: 30 }; // 17:30
                          } else if (dayOfWeek === 6) { // Saturday
                            startTime = { hour: 9, minute: 30 }; // 9:30
                            endTime = { hour: 19, minute: 30 }; // 19:30
                          } else { // Monday - Friday
                            startTime = { hour: 8, minute: 30 }; // 8:30
                            endTime = { hour: 21, minute: 30 }; // 21:30
                          }
                          
                          const startTimeInMinutes = startTime.hour * 60 + startTime.minute;
                          const endTimeInMinutes = endTime.hour * 60 + endTime.minute;
                          
                          // Generate time options (every 30 minutes)
                          const timeOptions = [];
                          let currentTimeOption = isToday ? Math.max(startTimeInMinutes, currentTimeInMinutes + 30) : startTimeInMinutes;
                          
                          while (currentTimeOption <= endTimeInMinutes) {
                            const hours = Math.floor(currentTimeOption / 60);
                            const minutes = currentTimeOption % 60;
                            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                            timeOptions.push(
                              <option key={timeString} value={timeString}>
                                {timeString}
                              </option>
                            );
                            currentTimeOption += 30;
                          }
                          
                          return timeOptions;
                        })()}
                      </select>
                    </div>
                  </div>

                  {/* Order note */}
                  <div style={{ marginTop: '20px' }}>
                    <label htmlFor="orderNote" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      id="orderNote"
                      rows="3"
                      placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
                      value={orderNote}
                      onChange={(e) => {
                        setOrderNote(e.target.value);
                        setCheckoutError('');
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {checkoutError && <p className="checkout-error">{checkoutError}</p>}
                </div>

                <div className="summary-row">
                  <span>Tạm tính</span>
                  <span className="subtotal">{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span className="shipping">{formatPrice(summary.shipping)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <span className="total">{formatPrice(summary.total)}</span>
                </div>
                <button
                  className="checkout-btn"
                  id="checkoutBtn"
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                    </>
                  ) : (
                    <span>Đặt hàng</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Add Recipient Info Modal */}
      {showAddRecipientModal && (
        <div className="confirm-modal show" style={{ zIndex: 10001 }}>
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="confirm-modal-header">
              Thêm thông tin giao hàng mới
              <button
                className="close-modal-btn"
                onClick={handleCancelAddRecipient}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="confirm-modal-body">
              <form onSubmit={handleCreateRecipientInfo}>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="modalRecipientName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Tên người nhận <span style={{ color: '#e95473' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="modalRecipientName"
                    name="recipientName"
                    value={newRecipientData.recipientName}
                    onChange={(e) => setNewRecipientData(prev => ({ ...prev, recipientName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="modalRecipientPhone" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Số điện thoại người nhận <span style={{ color: '#e95473' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="modalRecipientPhone"
                    name="recipientPhone"
                    value={newRecipientData.recipientPhone}
                    onChange={(e) => setNewRecipientData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="modalRecipientAddress" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Địa chỉ giao hàng <span style={{ color: '#e95473' }}>*</span>
                  </label>
                  <textarea
                    id="modalRecipientAddress"
                    name="recipientAddress"
                    value={newRecipientData.recipientAddress}
                    onChange={(e) => setNewRecipientData(prev => ({ ...prev, recipientAddress: e.target.value }))}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="modalRecipientDefault"
                    name="isDefault"
                    checked={newRecipientData.isDefault}
                    onChange={(e) => setNewRecipientData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <label htmlFor="modalRecipientDefault" style={{ fontSize: '14px', cursor: 'pointer' }}>
                    Đặt làm mặc định
                  </label>
                </div>
                <div className="confirm-modal-footer">
                  <button
                    type="button"
                    className="btn"
                    onClick={handleCancelAddRecipient}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div onClick={handleCancelAddRecipient} style={{ position: 'absolute', inset: 0, zIndex: -1 }}></div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="confirm-modal show" id="checkoutConfirmModal" aria-modal="true" role="dialog">
          <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header" id="confirmTitle">
              Xác nhận đặt hàng
            </div>
            <div className="confirm-modal-body" id="confirmMessage">
              {`Bạn có chắc chắn muốn đặt hàng với thông tin:\n\n` +
                `Người nhận: ${recipientName}\n` +
                `Số điện thoại: ${recipientPhone}\n` +
                `Địa chỉ: ${shippingAddress}\n` +
                `Thời gian giao hàng: ${deliveryDate ? formatDateDisplay(deliveryDate) : ''} ${deliveryTime || ''}\n\n` +
                `Đơn hàng sẽ được xử lý ngay sau khi xác nhận.`}
            </div>
            <div className="confirm-modal-footer">
              <button type="button" className="btn" id="confirmCancelBtn" onClick={handleCloseConfirmModal}>
                Hủy
              </button>
              <button type="button" className="btn primary" id="confirmOkBtn" onClick={handleConfirmCheckout}>
                Đồng ý
              </button>
            </div>
          </div>
          <div onClick={handleCloseConfirmModal} style={{ position: 'absolute', inset: 0, zIndex: -1 }}></div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CartPage;
