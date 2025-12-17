import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import Toast from '../../../components/ui/Toast';
import { useCreateFlowerMutation, useLazyGetFlowerByNameQuery, useUpdateFlowerMutation } from '../../../api/flowers/flowerApi';
import {
  useCreateFlowerColorMutation,
  useGetFlowerColorByIdQuery,
  useUploadFlowerColorImageMutation,
  useUpdateFlowerColorMutation,
} from '../../../api/flowers/flowerColorApi';
import { useCreateColorMutation, useGetAllColorsQuery } from '../../../api/colors/colorApi';
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

  const { data: colorsResp, refetch: refetchColors } = useGetAllColorsQuery();
  const colors = colorsResp?.data || [];
  const [createColor, { isLoading: isCreatingColor }] = useCreateColorMutation();
  const [colorModal, setColorModal] = useState({ open: false, colorName: '', colorCode: '' });
  const [colorErrors, setColorErrors] = useState({ colorName: '', colorCode: '' });

  const {
    data: flowerColorResp,
    isFetching: isFetchingFlowerColor,
  } = useGetFlowerColorByIdQuery(params.id, { skip: !isEdit });

  const flowerColor = flowerColorResp?.data;

  const [createFlower] = useCreateFlowerMutation();
  const [updateFlower] = useUpdateFlowerMutation();
  const [triggerGetFlowerByName] = useLazyGetFlowerByNameQuery();
  const [createFlowerColor] = useCreateFlowerColorMutation();
  const [uploadFlowerColorImage] = useUploadFlowerColorImageMutation();
  const [updateFlowerColor] = useUpdateFlowerColorMutation();

  const initialColorId = useMemo(() => {
    if (isEdit) return flowerColor?.color?.colorId || flowerColor?.color?.id || '';
    return colors?.[0]?.colorId || colors?.[0]?.id || '';
  }, [colors, flowerColor, isEdit]);

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    imageFile: null,
    description: '',
    colorId: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    category: '',
    price: '',
    stockQuantity: '',
    imageFile: '',
    colorId: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const openColorModal = () => {
    setColorErrors({ colorName: '', colorCode: '' });
    setColorModal({ open: true, colorName: '', colorCode: '' });
  };

  const closeColorModal = () => {
    setColorModal((prev) => ({ ...prev, open: false }));
  };

  const validateColor = () => {
    const next = { colorName: '', colorCode: '' };
    if (!colorModal.colorName.trim()) next.colorName = 'Vui lòng nhập tên màu';
    if (!colorModal.colorCode.trim()) {
      next.colorCode = 'Vui lòng nhập mã màu';
    } else if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorModal.colorCode.trim())) {
      next.colorCode = 'Mã màu phải dạng #RGB hoặc #RRGGBB';
    }
    setColorErrors(next);
    return !next.colorName && !next.colorCode;
  };

  const normalizeHexForPicker = (value) => {
    const v = (value || '').trim();
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return '#000000';
    if (v.length === 4) {
      // Expand #RGB -> #RRGGBB
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return v.toUpperCase();
  };

  const handleCreateColor = async () => {
    if (!validateColor()) return;
    try {
      const res = await createColor({
        colorName: colorModal.colorName.trim(),
        colorCode: colorModal.colorCode.trim(),
      }).unwrap();

      const created = res?.data || {};
      const newColorId = created.colorId || created.id;
      showToast('Tạo màu thành công!', 'success');
      closeColorModal();

      // Ensure dropdown list has the new color
      await refetchColors();
      if (newColorId) setField('colorId', String(newColorId));
    } catch (err) {
      console.error('Create color error:', err);
      showToast(err?.data?.message || err?.message || 'Tạo màu thất bại!', 'error');
    }
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
      imageFile: null,
      description: flower.description || '',
      colorId: flowerColor.color?.colorId || flowerColor.color?.id || '',
    }));
    setErrors({
      name: '',
      category: '',
      price: '',
      stockQuantity: '',
      imageFile: '',
      colorId: '',
    });
  }, [flowerColor, isEdit]);

  // Set default color on create mode
  useEffect(() => {
    if (isEdit) return;
    setForm((prev) => ({ ...prev, colorId: prev.colorId || initialColorId || '' }));
  }, [initialColorId, isEdit]);

  // Image preview by File (upload)
  useEffect(() => {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImage');
    if (!preview || !img) return;

    // Show new selected file if present
    if (form.imageFile) {
      img.src = URL.createObjectURL(form.imageFile);
      preview.style.display = 'block';
    } else {
      // If editing and we have existing imagePath, show it
      const existing = flowerColor?.imagePath || flowerColor?.image_path;
      if (isEdit && existing) {
        img.src = existing;
        preview.style.display = 'block';
        return;
      }
      preview.style.display = 'none';
      img.src = '';
    }
  }, [form.imageFile, flowerColor, isEdit]);

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
      imageFile: '',
      colorId: '',
    };

    if (!form.name.trim()) next.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.category) next.category = 'Vui lòng chọn danh mục';
    if (form.price === '' || Number(form.price) <= 0) next.price = 'Giá phải lớn hơn 0';
    if (form.stockQuantity === '' || Number(form.stockQuantity) < 0) next.stockQuantity = 'Số lượng không hợp lệ';
    if (!form.colorId) next.colorId = 'Vui lòng chọn màu';

    // As requested: image is uploaded (create requires image)
    if (!isEdit && !form.imageFile) next.imageFile = 'Vui lòng chọn ảnh để upload';

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const getApiErrorMessage = (err) => {
    // RTK Query unwrap usually throws { status, data } or { error }
    const data = err?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.data?.message) return data.data.message;

    const nested = err?.error?.data;
    if (typeof nested === 'string') return nested;
    if (nested?.message) return nested.message;
    if (nested?.error) return nested.error;

    if (err?.message) return err.message;
    if (err?.error) return err.error;
    return 'Có lỗi xảy ra';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const unitPrice = Number.parseFloat(String(form.price));
      const quantityInStock = Number.parseInt(String(form.stockQuantity), 10);
      const colorId = Number.parseInt(String(form.colorId), 10);

      if (isEdit) {
        const flowerId = flowerColor?.flower?.flowerId || flowerColor?.flower?.id;
        const flowerColorId = flowerColor?.flowerColorId || flowerColor?.id;

        if (!flowerId || !flowerColorId) {
          throw new Error('Không tìm thấy dữ liệu sản phẩm để cập nhật');
        }

        // Update Flower base info
        try {
          await updateFlower({
            flowerId,
            name: form.name.trim(),
            category: form.category,
            description: form.description?.trim() || '',
          }).unwrap();
        } catch (err) {
          throw new Error(`Cập nhật sản phẩm (Flower) thất bại: ${getApiErrorMessage(err)}`);
        }

        // Update FlowerColor stock/price (and attempt to store image URL if backend supports)
        try {
          await updateFlowerColor({
            flowerColorId,
            unitPrice,
            quantityInStock,
          }).unwrap();
        } catch (err) {
          throw new Error(`Cập nhật biến thể (FlowerColor) thất bại: ${getApiErrorMessage(err)}`);
        }

        // Upload image if user selected a new file
        if (form.imageFile) {
          try {
            await uploadFlowerColorImage({
              flowerId,
              colorId,
              file: form.imageFile,
            }).unwrap();
          } catch (err) {
            throw new Error(`Upload hình ảnh thất bại: ${getApiErrorMessage(err)}`);
          }
        }

        showToast('Cập nhật sản phẩm thành công!', 'success');
        setTimeout(() => navigate('/admin/products'), 800);
        return;
      }

      // Create flow: create Flower then create FlowerColor then upload image
      const flowerName = form.name.trim();
      let flowerId;

      // If flower already exists (same name), reuse it instead of failing.
      try {
        const foundRes = await triggerGetFlowerByName(flowerName).unwrap();
        const found = foundRes?.data;
        if (Array.isArray(found)) {
          const exact = found.find((f) => (f?.name || '').toLowerCase() === flowerName.toLowerCase()) || found[0];
          flowerId = exact?.flowerId || exact?.id;
        } else {
          flowerId = found?.flowerId || found?.id;
        }
      } catch {
        // ignore - not found or endpoint error; we'll attempt create
      }

      if (!flowerId) {
        let flowerRes;
        try {
          flowerRes = await createFlower({
            name: flowerName,
            category: form.category,
            description: form.description?.trim() || '',
          }).unwrap();
        } catch (err) {
          throw new Error(`Tạo sản phẩm (Flower) thất bại: ${getApiErrorMessage(err)}`);
        }

        const createdFlower = flowerRes?.data || {};
        flowerId = createdFlower.flowerId || createdFlower.id;
        if (!flowerId) throw new Error('Tạo sản phẩm thất bại (không có flowerId)');
      }

      try {
        await createFlowerColor({
          flowerId,
          colorId,
          unitPrice,
          quantityInStock,
        }).unwrap();
      } catch (err) {
        throw new Error(
          `Tạo biến thể (FlowerColor) thất bại: ${getApiErrorMessage(err)}. ` +
          `Nếu hoa đã có sẵn màu này, hãy chọn màu khác.`
        );
      }

      // Upload image immediately after creating product (two-step flow)
      if (!form.imageFile) throw new Error('Vui lòng chọn ảnh để upload');
      try {
        await uploadFlowerColorImage({
          flowerId,
          colorId,
          file: form.imageFile,
        }).unwrap();
      } catch (err) {
        throw new Error(`Upload hình ảnh thất bại: ${getApiErrorMessage(err)}`);
      }

      showToast('Tạo sản phẩm thành công!', 'success');
      setTimeout(() => navigate('/admin/products'), 800);
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
                    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                      <select
                        id="colorId"
                        value={form.colorId}
                        onChange={(e) => setField('colorId', e.target.value)}
                        required
                        disabled={isEdit} // keep variant stable on edit for now
                        className={errors.colorId ? 'error' : ''}
                        style={{ flex: 1 }}
                      >
                        <option value="">Chọn màu</option>
                        {colors.map((c) => {
                          const id = c.colorId || c.id;
                          const name = c.colorName || c.name;
                          const label = name ? `${name} (ID: ${id})` : `ID: ${id}`;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                      {!isEdit && (
                        <button
                          type="button"
                          className="btn-secondary btn-compact"
                          onClick={openColorModal}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <i className="fas fa-plus"></i> Tạo màu
                        </button>
                      )}
                    </div>
                    <span className={`error-message ${errors.colorId ? 'show' : ''}`}>
                      {errors.colorId}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="imageFile">
                    Upload hình ảnh <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={(e) => setField('imageFile', e.target.files?.[0] || null)}
                    className={errors.imageFile ? 'error' : ''}
                  />
                  <span className={`error-message ${errors.imageFile ? 'show' : ''}`} id="imageFileError">
                    {errors.imageFile}
                  </span>
                  <div className="image-preview" id="imagePreview" style={{ display: 'none' }}>
                    <img id="previewImage" alt="Preview" />
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

        {/* Create Color Modal */}
        {colorModal.open && (
          <div className="modal" id="createColorModal">
            <div className="modal-overlay" onClick={closeColorModal}></div>
            <div className="modal-content" style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <h3>Tạo màu mới</h3>
                <button className="modal-close" onClick={closeColorModal} type="button">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="newColorName">
                    Tên màu <span className="required">*</span>
                  </label>
                  <input
                    id="newColorName"
                    type="text"
                    value={colorModal.colorName}
                    onChange={(e) => {
                      setColorModal((p) => ({ ...p, colorName: e.target.value }));
                      if (colorErrors.colorName) setColorErrors((p) => ({ ...p, colorName: '' }));
                    }}
                    placeholder="Ví dụ: Đỏ"
                    className={colorErrors.colorName ? 'error' : ''}
                  />
                  <span className={`error-message ${colorErrors.colorName ? 'show' : ''}`}>
                    {colorErrors.colorName}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="newColorCode">
                    Mã màu (HEX) <span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="color"
                      aria-label="Chọn màu"
                      value={normalizeHexForPicker(colorModal.colorCode || '#E95473')}
                      onChange={(e) => {
                        const hex = (e.target.value || '').toUpperCase();
                        setColorModal((p) => ({ ...p, colorCode: hex }));
                        if (colorErrors.colorCode) setColorErrors((p) => ({ ...p, colorCode: '' }));
                      }}
                      style={{
                        width: 44,
                        height: 44,
                        padding: 0,
                        border: '2px solid #e0e0e0',
                        borderRadius: 10,
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      id="newColorCode"
                      type="text"
                      value={colorModal.colorCode}
                      onChange={(e) => {
                        setColorModal((p) => ({ ...p, colorCode: e.target.value }));
                        if (colorErrors.colorCode) setColorErrors((p) => ({ ...p, colorCode: '' }));
                      }}
                      placeholder="#E95473"
                      className={colorErrors.colorCode ? 'error' : ''}
                      style={{ flex: 1 }}
                    />
                  </div>
                  <span className={`error-message ${colorErrors.colorCode ? 'show' : ''}`}>
                    {colorErrors.colorCode}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: '1px solid #e0e0e0',
                      background: normalizeHexForPicker(colorModal.colorCode || '#E95473'),
                    }}
                  />
                  <span style={{ color: '#666', fontSize: 13 }}>Xem trước</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" type="button" onClick={closeColorModal}>
                  Hủy
                </button>
                <button className="btn-primary" type="button" onClick={handleCreateColor} disabled={isCreatingColor}>
                  <i className="fas fa-save"></i> {isCreatingColor ? 'Đang tạo...' : 'Tạo màu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductFormPage;


