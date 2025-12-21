import { useEffect, useState } from 'react';
import { useUpdateFlowerMutation, useUploadFlowerImageMutation, useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import '../../../assets/css/edit-product-modal.css';

const EditProductModal = ({ isOpen, onClose, productId, onSuccess }) => {
  const { data: flowerData, isLoading: isLoadingFlower } = useGetFlowerByIdQuery(productId, { skip: !isOpen || !productId });
  const [updateFlower] = useUpdateFlowerMutation();
  const [uploadFlowerImage] = useUploadFlowerImageMutation();

  const [form, setForm] = useState({
    flowerName: '',
    unitPrice: '',
    quantityInStock: '',
    description: '',
    imageFile: null,
  });
  const [existingImagePath, setExistingImagePath] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [errors, setErrors] = useState({
    flowerName: '',
    unitPrice: '',
    quantityInStock: '',
  });

  // Load flower data when modal opens
  useEffect(() => {
    if (!isOpen || !flowerData) return;
    const flower = flowerData?.data || flowerData;
    setForm({
      flowerName: flower.flowerName || '',
      unitPrice: flower.unitPrice ?? '',
      quantityInStock: flower.quantityInStock ?? '',
      description: flower.description || '',
      imageFile: null,
    });
    setExistingImagePath(flower.imagePath || '');
  }, [flowerData, isOpen]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateField = (key, value) => {
    let error = '';
    switch (key) {
      case 'flowerName':
        if (!value?.trim()) error = 'Trường này bắt buộc nhập';
        break;
      case 'unitPrice':
        if (value === '' || value === '-') error = 'Trường này bắt buộc nhập';
        else if (Number(value) < 0) error = 'Giá phải lớn hơn hoặc bằng 0';
        else if (isNaN(Number(value))) error = 'Giá phải là số hợp lệ';
        break;
      case 'quantityInStock':
        if (value === '') error = 'Trường này bắt buộc nhập';
        else if (Number(value) < 0) error = 'Số lượng phải lớn hơn 0';
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [key]: error }));
  };

  const handleBlur = (key) => {
    validateField(key, form[key]);
  };

  const validate = () => {
    const next = {
      flowerName: '',
      unitPrice: '',
      quantityInStock: '',
    };

    if (!form.flowerName.trim()) next.flowerName = 'Trường này bắt buộc nhập';
    if (form.unitPrice === '' || form.unitPrice === '-') next.unitPrice = 'Trường này bắt buộc nhập';
    else if (isNaN(Number(form.unitPrice))) next.unitPrice = 'Giá phải là số hợp lệ';
    else if (Number(form.unitPrice) < 0) next.unitPrice = 'Giá phải lớn hơn hoặc bằng 0';
    if (form.quantityInStock === '') next.quantityInStock = 'Trường này bắt buộc nhập';
    else if (Number(form.quantityInStock) < 0) next.quantityInStock = 'Số lượng phải lớn hơn 0';

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const getApiErrorMessage = (err) => {
    const data = err?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (err?.message) return err.message;
    return 'Có lỗi xảy ra';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setField('imageFile', file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setField('imageFile', file);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const unitPrice = Number.parseFloat(String(form.unitPrice));
      const quantityInStock = Number.parseInt(String(form.quantityInStock), 10);

      await updateFlower({
        flowerId: productId,
        flowerName: form.flowerName.trim(),
        unitPrice,
        description: form.description?.trim() || '',
        quantityInStock,
      }).unwrap();

      if (form.imageFile) {
        await uploadFlowerImage({ flowerId: productId, file: form.imageFile }).unwrap();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Update product error:', err);
      alert(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-product-modal-overlay" onClick={onClose}>
      <div className="edit-product-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-product-modal-header">
          <h2>Sửa Sản phẩm</h2>
          <button className="edit-product-modal-close" onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="edit-product-modal-body">
          {isLoadingFlower ? (
            <div className="edit-product-modal-loading">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-product-form">
              {/* Product Name */}
              <div className="edit-product-form-group">
                <label htmlFor={`flowerName-${productId}`}>
                  Tên sản phẩm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id={`flowerName-${productId}`}
                  value={form.flowerName}
                  onChange={(e) => setField('flowerName', e.target.value)}
                  onBlur={() => handleBlur('flowerName')}
                  className={errors.flowerName ? 'error' : ''}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.flowerName && (
                  <span className="edit-product-error-message">{errors.flowerName}</span>
                )}
              </div>

              {/* Price and Stock */}
              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label htmlFor={`unitPrice-${productId}`}>
                    Giá bán <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id={`unitPrice-${productId}`}
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 0 || value === '-')) {
                        setField('unitPrice', value);
                      }
                    }}
                    onBlur={() => handleBlur('unitPrice')}
                    className={errors.unitPrice ? 'error' : ''}
                    placeholder="0"
                  />
                  {errors.unitPrice && (
                    <span className="edit-product-error-message">{errors.unitPrice}</span>
                  )}
                </div>

                <div className="edit-product-form-group">
                  <label htmlFor={`quantityInStock-${productId}`}>
                    Số lượng tồn kho <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id={`quantityInStock-${productId}`}
                    value={form.quantityInStock}
                    onChange={(e) => setField('quantityInStock', e.target.value)}
                    onBlur={() => handleBlur('quantityInStock')}
                    className={errors.quantityInStock ? 'error' : ''}
                    placeholder="0"
                  />
                  {errors.quantityInStock && (
                    <span className="edit-product-error-message">{errors.quantityInStock}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="edit-product-form-group">
                <label htmlFor={`description-${productId}`}>Mô tả</label>
                <textarea
                  id={`description-${productId}`}
                  rows="4"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>

              {/* Image Upload */}
              <div className="edit-product-form-group">
                <label>Hình ảnh sản phẩm</label>
                <div
                  className={`edit-product-image-upload ${isDragging ? 'dragging' : ''} ${(form.imageFile || existingImagePath) ? 'has-image' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById(`imageFile-${productId}`)?.click()}
                >
                  <input
                    type="file"
                    id={`imageFile-${productId}`}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  {form.imageFile || existingImagePath ? (
                    <div className="edit-product-image-preview">
                      <img
                        src={form.imageFile ? URL.createObjectURL(form.imageFile) : existingImagePath}
                        alt="Preview"
                      />
                      <div className="edit-product-image-overlay">
                        <i className="fas fa-camera"></i>
                        <span>Click để thay đổi</span>
                      </div>
                    </div>
                  ) : (
                    <div className="edit-product-image-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Kéo thả hoặc click để tải ảnh lên</p>
                      <small>Để trống nếu không thay đổi</small>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isLoadingFlower && (
          <div className="edit-product-modal-footer">
            <button 
              type="button" 
              className="edit-product-btn-cancel" 
              onClick={onClose} 
              disabled={submitting}
            >
              Hủy
            </button>
            <button 
              type="button" 
              className="edit-product-btn-submit" 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              <i className="fas fa-save"></i>
              <span>{submitting ? 'Đang lưu...' : 'Cập nhật'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProductModal;
