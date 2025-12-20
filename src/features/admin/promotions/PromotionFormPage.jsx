import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useCreatePromotionMutation, useUpdatePromotionMutation, useGetAllPromotionsQuery } from '../../../api/promotions/promotionApi';
import { useGetAllFlowersQuery } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const PromotionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    promotionName: '',
    description: '',
    promotionType: 'PERCENTAGE',
    amount: '',
    flowerId: '',
    forAll: false,
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const { data: flowersData } = useGetAllFlowersQuery();
  const { data: promotionsData } = useGetAllPromotionsQuery();
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();

  // Get minimum date for start date (today)
  const getMinStartDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10); // YYYY-MM-DD format
  };

  // Get minimum date for end date (start date or today)
  const getMinEndDate = () => {
    if (formData.startDate) {
      return formData.startDate; // Same format YYYY-MM-DD
    }
    return getMinStartDate();
  };

  // Load promotion data if editing
  useEffect(() => {
    if (isEditMode && promotionsData?.data) {
      const promotion = promotionsData.data.find(p => p.promotionId === parseInt(id));
      if (promotion) {
        // Check if existing dates are in the past
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const existingStartDate = promotion.startDate ? new Date(promotion.startDate) : null;
        const existingEndDate = promotion.endDate ? new Date(promotion.endDate) : null;
        
        // Extract date only (YYYY-MM-DD) from ISO string
        let startDate = '';
        if (existingStartDate) {
          if (existingStartDate < now) {
            // Past date: set to today
            startDate = getMinStartDate();
          } else {
            // Extract date part only (YYYY-MM-DD)
            startDate = promotion.startDate.split('T')[0];
          }
        }
        
        // Extract date only (YYYY-MM-DD) from ISO string
        let endDate = '';
        if (existingEndDate) {
          if (existingEndDate < now) {
            // Past date: set to start date + 1 day or tomorrow
            if (startDate) {
              const start = new Date(startDate);
              start.setDate(start.getDate() + 1);
              endDate = start.toISOString().slice(0, 10);
            } else {
              const tomorrow = new Date(now);
              tomorrow.setDate(tomorrow.getDate() + 1);
              endDate = tomorrow.toISOString().slice(0, 10);
            }
          } else {
            // Extract date part only (YYYY-MM-DD)
            endDate = promotion.endDate.split('T')[0];
          }
        }
        
        setFormData({
          promotionName: promotion.promotionName || '',
          description: promotion.description || '',
          promotionType: promotion.promotionType || 'PERCENTAGE',
          amount: promotion.amount?.toString() || '',
          flowerId: promotion.flowerId?.toString() || '',
          forAll: promotion.isForAll !== undefined ? promotion.isForAll : (promotion.forAll || false),
          startDate: startDate,
          endDate: endDate,
        });
      }
    }
  }, [id, isEditMode, promotionsData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = type === 'checkbox' ? checked : value;
    
    // For date fields, validate min date
    if (name === 'startDate' && value) {
      const minDate = getMinStartDate();
      if (value < minDate) {
        processedValue = minDate;
      }
    } else if (name === 'endDate' && value) {
      // Ensure end date is not before start date
      if (formData.startDate && processedValue) {
        if (processedValue <= formData.startDate) {
          // Set end date to start date + 1 day
          const startDate = new Date(formData.startDate);
          startDate.setDate(startDate.getDate() + 1);
          processedValue = startDate.toISOString().slice(0, 10);
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.promotionName.trim()) {
      newErrors.promotionName = 'Tên khuyến mãi là bắt buộc';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền giảm giá phải lớn hơn 0';
    }
    
    if (formData.promotionType === 'PERCENTAGE' && parseFloat(formData.amount) > 100) {
      newErrors.amount = 'Phần trăm giảm giá không được vượt quá 100%';
    }
    
    if (!formData.forAll && !formData.flowerId) {
      newErrors.flowerId = 'Vui lòng chọn sản phẩm hoặc chọn "Áp dụng cho tất cả"';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }
    
    if (formData.startDate && formData.endDate) {
      if (formData.endDate <= formData.startDate) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin!', 'error');
      return;
    }

    try {
      const payload = {
        promotionName: formData.promotionName.trim(),
        description: formData.description.trim(),
        promotionType: formData.promotionType,
        amount: parseFloat(formData.amount),
        flowerId: formData.forAll ? 0 : parseInt(formData.flowerId),
        isForAll: formData.forAll || false,
        // Convert date (YYYY-MM-DD) to ISO string with time 00:00:00
        startDate: new Date(formData.startDate + 'T00:00:00').toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
      };

      if (isEditMode) {
        await updatePromotion({
          promotionId: id,
          ...payload
        }).unwrap();
        showToast('Cập nhật khuyến mãi thành công!', 'success');
      } else {
        await createPromotion(payload).unwrap();
        showToast('Tạo khuyến mãi thành công!', 'success');
      }
      
      setTimeout(() => {
        navigate('/admin/promotions');
      }, 1500);
    } catch (error) {
      console.error('Promotion form error:', error);
      showToast(error?.data?.message || 'Có lỗi xảy ra!', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const flowers = flowersData?.data || [];
  const isLoading = isCreating || isUpdating;

  // Format date value to display as dd/mm/yyyy
  const formatDateValue = (dateString) => {
    if (!dateString) return '';
    try {
      // dateString is in YYYY-MM-DD format
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="content-header">
        <div>
          <h1>{isEditMode ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</h1>
          <p>{isEditMode ? 'Cập nhật thông tin khuyến mãi' : 'Tạo khuyến mãi mới'}</p>
        </div>
        <Link to="/admin/promotions" className="btn-secondary">
          <i className="fas fa-arrow-left"></i>
          Quay lại
        </Link>
      </div>

      <div className="admin-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="promotionName">
              Tên khuyến mãi <span className="required">*</span>
            </label>
            <input
              type="text"
              id="promotionName"
              name="promotionName"
              value={formData.promotionName}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Ví dụ: Giảm giá 20% cho tất cả sản phẩm"
            />
            {errors.promotionName && <span className="error-text">{errors.promotionName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows="4"
              placeholder="Mô tả chi tiết về khuyến mãi..."
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="promotionType">
                Loại giảm giá <span className="required">*</span>
              </label>
              <select
                id="promotionType"
                name="promotionType"
                value={formData.promotionType}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                Số tiền/Phần trăm <span className="required">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder={formData.promotionType === 'PERCENTAGE' ? 'Ví dụ: 20' : 'Ví dụ: 50000'}
                min="0"
                max={formData.promotionType === 'PERCENTAGE' ? '100' : undefined}
                step={formData.promotionType === 'PERCENTAGE' ? '1' : '1000'}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="forAll"
                checked={formData.forAll}
                onChange={handleInputChange}
                disabled={isLoading}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <span>Áp dụng cho tất cả sản phẩm</span>
            </label>
          </div>

          {!formData.forAll && (
            <div className="form-group">
              <label htmlFor="flowerId">
                Sản phẩm <span className="required">*</span>
              </label>
              <select
                id="flowerId"
                name="flowerId"
                value={formData.flowerId}
                onChange={handleInputChange}
                disabled={isLoading || formData.forAll}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {flowers.map((flower) => (
                  <option key={flower.flowerId} value={flower.flowerId}>
                    {flower.flowerName}
                  </option>
                ))}
              </select>
              {errors.flowerId && <span className="error-text">{errors.flowerId}</span>}
            </div>
          )}

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="startDate">
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate || ''}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    // Validate min date
                    if (e.target.value) {
                      const minDate = getMinStartDate();
                      if (e.target.value < minDate) {
                        setFormData(prev => ({
                          ...prev,
                          startDate: minDate
                        }));
                      }
                    }
                  }}
                  disabled={isLoading}
                  min={getMinStartDate()}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                    cursor: 'pointer'
                  }}
                />
                <i 
                  className="fas fa-calendar-alt" 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#666',
                    zIndex: 1
                  }}
                ></i>
              </div>
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    // Validate that end date is after start date
                    if (e.target.value && formData.startDate) {
                      if (e.target.value <= formData.startDate) {
                        // Set end date to start date + 1 day
                        const startDate = new Date(formData.startDate);
                        startDate.setDate(startDate.getDate() + 1);
                        setFormData(prev => ({
                          ...prev,
                          endDate: startDate.toISOString().slice(0, 10)
                        }));
                      }
                    }
                  }}
                  disabled={isLoading}
                  min={getMinEndDate()}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
                    cursor: 'pointer'
                  }}
                />
                <i 
                  className="fas fa-calendar-alt" 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#666',
                    zIndex: 1
                  }}
                ></i>
              </div>
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ minWidth: '150px' }}
            >
              {isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo khuyến mãi')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/promotions')}
              className="btn-secondary"
              disabled={isLoading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </AdminLayout>
  );
};

export default PromotionFormPage;

