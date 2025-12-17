import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useGetMyCartQuery, useUpdateCartMutation, useRemoveFromCartMutation } from '../../../api/cart/cartApi';
import { useCreateOrderMutation } from '../../../api/orders/orderApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/cart.css';
import '../../../assets/css/home.css';

// Cart Item Component
const CartItem = ({ item, quantity, unitQuantity, onQuantityChange, onQuantityInputChange, onUnitQuantityChange, onUnitQuantityInputChange, onRemove, formatPrice, showToast }) => {
  const cartId = item.cartId || item.id;
  const productId = item.flowerId || item.productId || cartId;
  const productName = item.flowerName || item.productName || item.name || 'Sản phẩm';
  const imageUrl = item.imagePath || item.imageUrl || item.image_path || 'https://via.placeholder.com/120x120?text=Product';
  const unitPrice = item.unitPrice || item.unit_price || item.price || 0; // Giá 1 bó
  const stock = item.quantityInStock || item.stock || null;
  const maxQuantity = stock !== null ? stock : 999999;
  // Use totalPrice from API if available, otherwise calculate from unitPrice * quantity
  const totalPrice = item.totalPrice !== undefined && item.totalPrice !== null 
    ? item.totalPrice 
    : unitPrice * quantity;

  const qtyInputRef = useRef(null);
  const unitQtyInputRef = useRef(null);

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
        <p className="item-price">{formatPrice(unitPrice)}/bó</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Số bông/bó:</label>
          <div className="item-quantity">
            <button
              className="qty-btn minus-btn"
              data-product-id={productId}
              onClick={() => {
                onUnitQuantityChange(cartId, unitQuantity - 1, unitQtyInputRef);
                if (unitQtyInputRef.current) animateInput(unitQtyInputRef.current);
              }}
            >
              -
            </button>
            <input
              type="number"
              value={unitQuantity}
              min="1"
              max={999}
              className="qty-input"
              data-product-id={productId}
              onChange={(e) => {
                // Call API immediately when value changes
                onUnitQuantityInputChange(cartId, e.target.value, unitQtyInputRef);
              }}
              ref={unitQtyInputRef}
            />
            <button
              className="qty-btn plus-btn"
              data-product-id={productId}
              onClick={() => {
                onUnitQuantityChange(cartId, unitQuantity + 1, unitQtyInputRef);
                if (unitQtyInputRef.current) animateInput(unitQtyInputRef.current);
              }}
            >
              +
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: '#666' }}>Số bó:</label>
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
        </div>
      </div>
      <div className="item-total">
        <span className="total-price">{formatPrice(totalPrice)}</span>
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

  const cartItems = cartResponse?.data || [];

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [recipientName, setRecipientName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [unitQuantities, setUnitQuantities] = useState({});

  // Initialize quantities and unitQuantities from cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialQuantities = {};
      const initialUnitQuantities = {};
      cartItems.forEach((item) => {
        const cartId = item.cartId || item.id;
        initialQuantities[cartId] = item.quantity || 1;
        initialUnitQuantities[cartId] = item.unitQuantity || item.unit_quantity || 1;
      });
      setQuantities(initialQuantities);
      setUnitQuantities(initialUnitQuantities);
    }
  }, [cartItems.length]);

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    return '₫' + (Number.isFinite(numPrice) ? numPrice : 0).toLocaleString('vi-VN');
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
        unitQuantity: unitQuantities[cartId] || item.unitQuantity || item.unit_quantity || 1,
      }).unwrap();
      // Refetch to get updated unitPrice and totalPrice from API
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || newQuantity }));
            setUnitQuantities((prev) => ({ ...prev, [cartId]: updatedItem.unitQuantity || unitQuantities[cartId] || 1 }));
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

  // Update cart item unit quantity (số bông/bó)
  // When unitQuantity changes, unitPrice will change, so totalPrice will also change
  const handleUpdateUnitQuantity = async (cartId, newUnitQuantity, inputRef = null) => {
    const item = cartItems.find((i) => (i.cartId || i.id) === cartId);
    if (!item) return;

    if (newUnitQuantity < 1) {
      setUnitQuantities((prev) => ({ ...prev, [cartId]: 1 }));
      return;
    }

    if (newUnitQuantity > 999) {
      showToast('Số lượng bông hoa tối đa: 999', 'warning');
      setUnitQuantities((prev) => ({ ...prev, [cartId]: 999 }));
      return;
    }

    setUnitQuantities((prev) => ({ ...prev, [cartId]: newUnitQuantity }));

    if (inputRef?.current) {
      animateInput(inputRef.current);
    }

    try {
      await updateCart({
        cartId,
        quantity: quantities[cartId] || item.quantity || 1,
        unitQuantity: newUnitQuantity,
      }).unwrap();
      // Refetch to get updated unitPrice and totalPrice from API
      // API will recalculate unitPrice based on new unitQuantity and return new totalPrice
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || quantities[cartId] || 1 }));
            setUnitQuantities((prev) => ({ ...prev, [cartId]: updatedItem.unitQuantity || newUnitQuantity }));
          }
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng bông hoa';
      showToast(errorMessage, 'error');
      // Revert unitQuantity on error
      setUnitQuantities((prev) => ({ ...prev, [cartId]: item.unitQuantity || item.unit_quantity || 1 }));
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
        unitQuantity: unitQuantities[cartId] || item.unitQuantity || item.unit_quantity || 1,
      }).unwrap();
      // Refetch to get updated totalPrice from API
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || finalValue }));
            setUnitQuantities((prev) => ({ ...prev, [cartId]: updatedItem.unitQuantity || unitQuantities[cartId] || 1 }));
          }
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng';
      showToast(errorMessage, 'error');
      setQuantities((prev) => ({ ...prev, [cartId]: item.quantity || 1 }));
    }
  };

  // Handle unit quantity input change (số bông/bó)
  // When unitQuantity changes, unitPrice will change, so totalPrice will also change
  const handleUnitQuantityInputChange = async (cartId, value, inputRef = null) => {
    const item = cartItems.find((i) => (i.cartId || i.id) === cartId);
    if (!item) return;

    const numValue = parseInt(value) || 1;

    let finalValue;
    if (numValue < 1) {
      finalValue = 1;
    } else if (numValue > 999) {
      finalValue = 999;
      showToast('Số lượng bông hoa tối đa: 999', 'warning');
    } else {
      finalValue = numValue;
    }

    setUnitQuantities((prev) => ({ ...prev, [cartId]: finalValue }));

    if (inputRef?.current) {
      animateInput(inputRef.current);
    }

    try {
      await updateCart({
        cartId,
        quantity: quantities[cartId] || item.quantity || 1,
        unitQuantity: finalValue,
      }).unwrap();
      // Refetch to get updated unitPrice and totalPrice from API
      // API will recalculate unitPrice based on new unitQuantity and return new totalPrice
      const result = await refetch();
      // Update local state with new data from API
      if (result?.data?.data) {
        const updatedItems = result.data.data;
        updatedItems.forEach((updatedItem) => {
          if ((updatedItem.cartId || updatedItem.id) === cartId) {
            setQuantities((prev) => ({ ...prev, [cartId]: updatedItem.quantity || quantities[cartId] || 1 }));
            setUnitQuantities((prev) => ({ ...prev, [cartId]: updatedItem.unitQuantity || finalValue }));
          }
        });
      }
    } catch (error) {
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi cập nhật số lượng bông hoa';
      showToast(errorMessage, 'error');
      setUnitQuantities((prev) => ({ ...prev, [cartId]: item.unitQuantity || item.unit_quantity || 1 }));
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
  // After updating unitQuantity or quantity, API will return new unitPrice and totalPrice
  const calculateSummary = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      // Always use totalPrice from API response (it's calculated server-side based on unitQuantity and quantity)
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
    const vat = 0;
    const total = subtotal + shipping + vat;

    return { subtotal, shipping, vat, total };
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

    if (!shippingAddress.trim()) {
      setCheckoutError('Vui lòng nhập địa chỉ giao hàng.');
      showToast('Địa chỉ giao hàng không được để trống.', 'warning');
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
      const result = await createOrder({
        cartIds,
        recipientName: recipientName.trim(),
        recipientAddress: shippingAddress.trim(),
        recipientPhone: '', // Can be added later
        shippingFee: 15000,
      }).unwrap();

      if (result.success || result.orderId) {
        showToast(`✅ Đặt hàng thành công! Mã đơn hàng: #${result.orderId || result.data?.orderId}`, 'success');
        setTimeout(() => {
          navigate('/account#orders');
        }, 2000);
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
      setCheckoutError(errorMessage);
    } finally {
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
                    const unitQuantity = unitQuantities[cartId] || item.unitQuantity || item.unit_quantity || 1;
                    return (
                      <CartItem
                        key={cartId}
                        item={item}
                        quantity={quantity}
                        unitQuantity={unitQuantity}
                        onQuantityChange={handleUpdateQuantity}
                        onQuantityInputChange={handleQuantityInputChange}
                        onUnitQuantityChange={handleUpdateUnitQuantity}
                        onUnitQuantityInputChange={handleUnitQuantityInputChange}
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
                  <div>
                    <label htmlFor="recipientName">
                      Tên người nhận <span style={{ color: '#e95473' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      placeholder="Nhập tên người nhận"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        setCheckoutError('');
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="shippingAddress">
                      Địa chỉ giao hàng <span style={{ color: '#e95473' }}>*</span>
                    </label>
                    <textarea
                      id="shippingAddress"
                      rows="3"
                      placeholder="Nhập địa chỉ giao hàng"
                      value={shippingAddress}
                      onChange={(e) => {
                        setShippingAddress(e.target.value);
                        setCheckoutError('');
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
                <div className="summary-row">
                  <span>Thuế VAT</span>
                  <span className="vat">{formatPrice(summary.vat)}</span>
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
                `Địa chỉ: ${shippingAddress}\n\n` +
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
