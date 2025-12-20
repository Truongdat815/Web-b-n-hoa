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

  // Load promotion data if editing
  useEffect(() => {
    if (isEditMode && promotionsData?.data) {
      const promotion = promotionsData.data.find(p => p.promotionId === parseInt(id));
      if (promotion) {
        setFormData({
          promotionName: promotion.promotionName || '',
          description: promotion.description || '',
          promotionType: promotion.promotionType || 'PERCENTAGE',
          amount: promotion.amount?.toString() || '',
          flowerId: promotion.flowerId?.toString() || '',
          forAll: promotion.forAll || false,
          startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
          endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
        });
      }
    }
  }, [id, isEditMode, promotionsData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
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
        forAll: formData.forAll,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
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
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
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
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={isLoading}
              />
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

