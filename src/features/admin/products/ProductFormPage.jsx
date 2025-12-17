import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import Toast from '../../../components/ui/Toast';
import { useCreateFlowerMutation, useUpdateFlowerMutation, useUploadFlowerImageMutation, useGetFlowerByIdQuery } from '../../../api/flowers/flowerApi';
import '../../../assets/css/admin.css';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params?.id);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const { data: flowerData, isLoading: isLoadingFlower } = useGetFlowerByIdQuery(params.id, { skip: !isEdit });
  const [createFlower] = useCreateFlowerMutation();
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

  const [errors, setErrors] = useState({
    flowerName: '',
    unitPrice: '',
    quantityInStock: '',
    imageFile: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Load flower data when editing
  useEffect(() => {
    if (!isEdit || !flowerData) return;
    const flower = flowerData?.data || flowerData;
    setForm({
      flowerName: flower.flowerName || '',
      unitPrice: flower.unitPrice ?? '',
      quantityInStock: flower.quantityInStock ?? '',
      description: flower.description || '',
      imageFile: null,
    });
    setExistingImagePath(flower.imagePath || '');
  }, [flowerData, isEdit]);

  // Image preview
  useEffect(() => {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImage');
    if (!preview || !img) return;

    if (form.imageFile) {
      img.src = URL.createObjectURL(form.imageFile);
      preview.style.display = 'block';
    } else if (existingImagePath) {
      img.src = existingImagePath;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
      img.src = '';
    }
  }, [form.imageFile, existingImagePath]);

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
        if (value === '') error = 'Trường này bắt buộc nhập';
        else if (Number(value) < 0) error = 'Giá phải lớn hơn 0';
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
      imageFile: '',
    };

    if (!form.flowerName.trim()) next.flowerName = 'Trường này bắt buộc nhập';
    if (form.unitPrice === '') next.unitPrice = 'Trường này bắt buộc nhập';
    else if (Number(form.unitPrice) < 0) next.unitPrice = 'Giá phải lớn hơn 0';
    if (form.quantityInStock === '') next.quantityInStock = 'Trường này bắt buộc nhập';
    else if (Number(form.quantityInStock) < 0) next.quantityInStock = 'Số lượng phải lớn hơn 0';
    if (!isEdit && !form.imageFile) next.imageFile = 'Vui lòng chọn ảnh để upload';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const unitPrice = Number.parseFloat(String(form.unitPrice));
      const quantityInStock = Number.parseInt(String(form.quantityInStock), 10);

      if (isEdit) {
        // Update flow
        const flowerId = params.id;
        await updateFlower({
          flowerId,
          flowerName: form.flowerName.trim(),
          unitPrice,
          description: form.description?.trim() || '',
          quantityInStock,
        }).unwrap();

        if (form.imageFile) {
          await uploadFlowerImage({ flowerId, file: form.imageFile }).unwrap();
        }

        showToast('Cập nhật sản phẩm thành công!', 'success');
        navigate('/admin/products');
        return;
      }

      // Create flow: 1) Create flower 2) Upload image
      const flowerRes = await createFlower({
        flowerName: form.flowerName.trim(),
        unitPrice,
        description: form.description?.trim() || '',
        quantityInStock,
      }).unwrap();

      const flowerId = flowerRes?.flowerId || flowerRes?.data?.flowerId;
      if (!flowerId) throw new Error('Tạo sản phẩm thất bại (không có flowerId)');

      // Upload image
      await uploadFlowerImage({ flowerId, file: form.imageFile }).unwrap();

      showToast('Tạo sản phẩm thành công!', 'success');
      navigate('/admin/products');
    } catch (err) {
      console.error('Product form error:', err);
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm';
  const subtitle = isEdit ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới vào hệ thống';

  return (
    <AdminLayout>
      <div>
        <div className="content-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <Link to="/admin/products" className="btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </Link>
        </div>

        <div className="admin-form-container">
          {isEdit && isLoadingFlower ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
          <form id="productForm" className="admin-form" onSubmit={handleSubmit}>
            <input type="hidden" id="productId" value={params.id || ''} />

            <>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="flowerName">
                    Tên sản phẩm <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="flowerName"
                    value={form.flowerName}
                    onChange={(e) => setField('flowerName', e.target.value)}
                    onBlur={() => handleBlur('flowerName')}
                    className={errors.flowerName ? 'error' : ''}
                  />
                  <span className={`error-message ${errors.flowerName ? 'show' : ''}`}>
                    {errors.flowerName}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="unitPrice">
                    Giá bán (một bông) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    value={form.unitPrice}
                    onChange={(e) => setField('unitPrice', e.target.value)}
                    onBlur={() => handleBlur('unitPrice')}
                    className={errors.unitPrice ? 'error' : ''}
                  />
                  <span className={`error-message ${errors.unitPrice ? 'show' : ''}`}>
                    {errors.unitPrice}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="quantityInStock">
                    Số lượng tồn kho <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantityInStock"
                    value={form.quantityInStock}
                    onChange={(e) => setField('quantityInStock', e.target.value)}
                    onBlur={() => handleBlur('quantityInStock')}
                    className={errors.quantityInStock ? 'error' : ''}
                  />
                  <span className={`error-message ${errors.quantityInStock ? 'show' : ''}`}>
                    {errors.quantityInStock}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  rows="4"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Nhập mô tả sản phẩm..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageFile">
                  Upload hình ảnh <span className="required">*</span>
                </label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setField('imageFile', file);
                  }}
                  className={errors.imageFile ? 'error' : ''}
                />
                <span className={`error-message ${errors.imageFile ? 'show' : ''}`}>
                  {errors.imageFile}
                </span>
                <div className="image-preview" id="imagePreview" style={{ display: 'none' }}>
                  <img id="previewImage" alt="Preview" />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <i className="fas fa-save"></i>
                  <span>{submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}</span>
                </button>
              </div>
            </>
          </form>
          )}
        </div>

        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </AdminLayout>
  );
};

export default ProductFormPage;


