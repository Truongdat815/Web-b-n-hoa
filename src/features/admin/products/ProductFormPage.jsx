import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import Toast from '../../../components/ui/Toast';
import { useCreateFlowerMutation, useUpdateFlowerMutation } from '../../../api/flowers/flowerApi';
import {
  useCreateFlowerColorMutation,
  useGetFlowerColorByIdQuery,
  useUpdateFlowerColorMutation,
  useUploadFlowerColorImageMutation,
} from '../../../api/flowers/flowerColorApi';
import { useGetAllColorsQuery } from '../../../api/colors/colorApi';
import '../../../assets/css/admin.css';

const CATEGORIES = [
  'Hoa hồng',
  'Hoa tulip',
  'Hoa ly',
  'Hoa cúc',
  'Hoa hướng dương',
  'Hoa cẩm chướng',
  'Hoa lan',
  'Hoa baby',
  'Hoa đồng tiền',
  'Hoa lavender',
];

const ProductFormPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params?.id);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const { data: colorsResp } = useGetAllColorsQuery();
  const colors = colorsResp?.data || [];

  const {
    data: flowerColorResp,
    isFetching: isFetchingFlowerColor,
  } = useGetFlowerColorByIdQuery(params.id, { skip: !isEdit });

  const flowerColor = flowerColorResp?.data;

  const [createFlower] = useCreateFlowerMutation();
  const [updateFlower] = useUpdateFlowerMutation();
  const [createFlowerColor] = useCreateFlowerColorMutation();
  const [updateFlowerColor] = useUpdateFlowerColorMutation();
  const [uploadFlowerColorImage] = useUploadFlowerColorImageMutation();

  const initialColorId = useMemo(() => {
    if (isEdit) return flowerColor?.color?.colorId || flowerColor?.color?.id || '';
    return colors?.[0]?.colorId || colors?.[0]?.id || '';
  }, [colors, flowerColor, isEdit]);

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    description: '',
    colorId: '',
    imageFile: null,
  });

  const [errors, setErrors] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    colorId: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Populate form when editing
  useEffect(() => {
    if (!isEdit || !flowerColor) return;

    const flower = flowerColor.flower || {};
    setForm((prev) => ({
      ...prev,
      name: flower.name || '',
      category: flower.category || '',
      price: flowerColor.unitPrice ?? '',
      stockQuantity: flowerColor.quantityInStock ?? '',
      imageUrl: flowerColor.imagePath || flowerColor.image_path || '',
      description: flower.description || '',
      colorId: flowerColor.color?.colorId || flowerColor.color?.id || '',
      imageFile: null,
    }));
    setErrors({
      name: '',
      category: '',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      colorId: '',
    });
  }, [flowerColor, isEdit]);

  // Set default color on create mode
  useEffect(() => {
    if (isEdit) return;
    setForm((prev) => ({ ...prev, colorId: prev.colorId || initialColorId || '' }));
  }, [initialColorId, isEdit]);

  // Image preview by URL (matches template behavior)
  useEffect(() => {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImage');
    if (!preview || !img) return;

    if (form.imageUrl?.trim()) {
      img.src = form.imageUrl.trim();
      preview.style.display = 'block';
    } else if (form.imageFile) {
      img.src = URL.createObjectURL(form.imageFile);
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
      img.src = '';
    }
  }, [form.imageUrl, form.imageFile]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {
      name: '',
      category: '',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      colorId: '',
    };

    if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.category) next.category = 'Vui lòng chọn danh mục';
    if (form.price === '' || Number(form.price) <= 0) next.price = 'Giá phải lớn hơn 0';
    if (form.stockQuantity === '' || Number(form.stockQuantity) < 0) next.stockQuantity = 'Số lượng không hợp lệ';
    if (!form.colorId) next.colorId = 'Vui lòng chọn màu';

    // Keep URL field required to match template UI, but allow file-only as well.
    if (!form.imageUrl.trim() && !form.imageFile) next.imageUrl = 'Vui lòng nhập URL ảnh hoặc chọn file ảnh';

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const unitPrice = Number(form.price);
      const quantityInStock = Number(form.stockQuantity);
      const colorId = Number(form.colorId);

      if (isEdit) {
        const flowerId = flowerColor?.flower?.flowerId || flowerColor?.flower?.id;
        const flowerColorId = flowerColor?.flowerColorId || flowerColor?.id;

        if (!flowerId || !flowerColorId) {
          throw new Error('Không tìm thấy dữ liệu sản phẩm để cập nhật');
        }

        // Update Flower base info
        await updateFlower({
          flowerId,
          name: form.name.trim(),
          category: form.category,
          description: form.description?.trim() || '',
        }).unwrap();

        // Update FlowerColor stock/price (and attempt to store image URL if backend supports)
        await updateFlowerColor({
          flowerColorId,
          unitPrice,
          quantityInStock,
          imagePath: form.imageUrl.trim(),
        }).unwrap();

        // Upload image if a file is selected (preferred path)
        if (form.imageFile) {
          await uploadFlowerColorImage({
            flowerId,
            colorId,
            file: form.imageFile,
          }).unwrap();
        }

        showToast('Cập nhật sản phẩm thành công!', 'success');
        setTimeout(() => navigate('/admin/products'), 800);
        return;
      }

      // Create flow: create Flower then create FlowerColor
      const flowerRes = await createFlower({
        name: form.name.trim(),
        category: form.category,
        description: form.description?.trim() || '',
      }).unwrap();

      const createdFlower = flowerRes?.data || {};
      const flowerId = createdFlower.flowerId || createdFlower.id;
      if (!flowerId) throw new Error('Tạo sản phẩm thất bại (không có flowerId)');

      const flowerColorRes = await createFlowerColor({
        flowerId,
        colorId,
        unitPrice,
        quantityInStock,
      }).unwrap();

      const createdFlowerColor = flowerColorRes?.data || {};
      const flowerColorId = createdFlowerColor.flowerColorId || createdFlowerColor.id;

      // Upload image file if provided
      if (form.imageFile) {
        await uploadFlowerColorImage({ flowerId, colorId, file: form.imageFile }).unwrap();
      } else if (form.imageUrl.trim() && flowerColorId) {
        // Best-effort store URL into imagePath if backend allows it
        try {
          await updateFlowerColor({ flowerColorId, imagePath: form.imageUrl.trim() }).unwrap();
        } catch {
          // ignore - backend may not support setting imagePath directly
        }
      }

      showToast('Tạo sản phẩm thành công!', 'success');
      setTimeout(() => navigate('/admin/products'), 800);
    } catch (err) {
      console.error('Product form error:', err);
      showToast(err?.data?.message || err?.message || 'Lưu sản phẩm thất bại!', 'error');
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
          <form id="productForm" className="admin-form" onSubmit={handleSubmit}>
            <input type="hidden" id="productId" value={params.id || ''} />

            {(isEdit && isFetchingFlowerColor) ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      Tên sản phẩm <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      required
                      className={errors.name ? 'error' : ''}
                    />
                    <span className={`error-message ${errors.name ? 'show' : ''}`} id="nameError">
                      {errors.name}
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">
                      Danh mục <span className="required">*</span>
                    </label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setField('category', e.target.value)}
                      required
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Chọn danh mục</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span className={`error-message ${errors.category ? 'show' : ''}`} id="categoryError">
                      {errors.category}
                    </span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">
                      Giá (₫) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="1000"
                      value={form.price}
                      onChange={(e) => setField('price', e.target.value)}
                      required
                      className={errors.price ? 'error' : ''}
                    />
                    <span className={`error-message ${errors.price ? 'show' : ''}`} id="priceError">
                      {errors.price}
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="stockQuantity">
                      Số lượng tồn kho <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="stockQuantity"
                      min="0"
                      value={form.stockQuantity}
                      onChange={(e) => setField('stockQuantity', e.target.value)}
                      required
                      className={errors.stockQuantity ? 'error' : ''}
                    />
                    <span className={`error-message ${errors.stockQuantity ? 'show' : ''}`} id="stockQuantityError">
                      {errors.stockQuantity}
                    </span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="colorId">
                      Màu <span className="required">*</span>
                    </label>
                    <select
                      id="colorId"
                      value={form.colorId}
                      onChange={(e) => setField('colorId', e.target.value)}
                      required
                      disabled={isEdit} // keep variant stable on edit for now
                      className={errors.colorId ? 'error' : ''}
                    >
                      <option value="">Chọn màu</option>
                      {colors.map((c) => {
                        const id = c.colorId || c.id;
                        const label = c.name ? `${c.name} (ID: ${id})` : `ID: ${id}`;
                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                    <span className={`error-message ${errors.colorId ? 'show' : ''}`}>
                      {errors.colorId}
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="imageFile">
                      Upload ảnh (khuyến nghị)
                    </label>
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={(e) => setField('imageFile', e.target.files?.[0] || null)}
                    />
                    <span className="error-message" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="imageUrl">
                    URL hình ảnh <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={form.imageUrl}
                    onChange={(e) => setField('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? 'error' : ''}
                  />
                  <span className={`error-message ${errors.imageUrl ? 'show' : ''}`} id="imageUrlError">
                    {errors.imageUrl}
                  </span>
                  <div className="image-preview" id="imagePreview" style={{ display: 'none' }}>
                    <img id="previewImage" src="" alt="Preview" />
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
                  <span className="error-message" id="descriptionError" />
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
            )}
          </form>
        </div>

        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </AdminLayout>
  );
};

export default ProductFormPage;


