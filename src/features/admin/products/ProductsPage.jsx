import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useGetAllFlowerColorsQuery, useDeleteFlowerColorMutation } from '../../../api/flowers/flowerColorApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const ProductsPage = () => {
  const { data: response, isLoading, refetch } = useGetAllFlowerColorsQuery();
  const [deleteFlowerColor] = useDeleteFlowerColorMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const products = response?.data || [];

  const filteredProducts = products.filter(product => {
    const flowerName = product.flower?.name || '';
    const colorName = product.color?.name || '';
    const matchesSearch = !searchQuery || 
      flowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      colorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.flower?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleDeleteClick = (product) => {
    setDeleteModal({ show: true, product });
  };

  const handleDeleteConfirm = async () => {
    try {
      const flowerColorId = deleteModal.product?.flowerColorId || deleteModal.product?.id;
      await deleteFlowerColor(flowerColorId).unwrap();
      showToast('Xóa sản phẩm thành công!', 'success');
      setDeleteModal({ show: false, product: null });
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error?.data?.message || 'Xóa sản phẩm thất bại!', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>Quản lý Sản phẩm</h1>
            <p>Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="content-header">
          <div>
            <h1>Quản lý Sản phẩm</h1>
            <p>Danh sách tất cả sản phẩm</p>
          </div>
          <Link to="/admin/products/new" className="btn-primary">
            <i className="fas fa-plus"></i>
            Thêm sản phẩm
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="admin-toolbar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="searchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>
          <select
            className="filter-select"
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Hoa hồng">Hoa hồng</option>
            <option value="Hoa tulip">Hoa tulip</option>
            <option value="Hoa ly">Hoa ly</option>
            <option value="Hoa cúc">Hoa cúc</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="productsTableBody">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <i className="fas fa-box-open"></i>
                      <p>Không tìm thấy sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const flowerColorId = product.flowerColorId || product.id;
                  const flowerName = product.flower?.name || 'N/A';
                  const colorName = product.color?.name || '';
                  const productName = `${flowerName}${colorName ? ` - ${colorName}` : ''}`;
                  return (
                    <tr key={flowerColorId}>
                      <td>{flowerColorId}</td>
                      <td>
                        <img
                          src={product.imagePath || product.image_path || 'https://via.placeholder.com/50'}
                          alt={productName}
                          className="table-image"
                        />
                      </td>
                      <td>{productName}</td>
                      <td>{formatCurrency(product.unitPrice || product.unit_price || 0)}</td>
                      <td>{product.quantityInStock || product.quantity_in_stock || 0}</td>
                      <td>{product.flower?.category || 'N/A'}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/admin/products/edit/${flowerColorId}`}
                            className="btn-edit"
                            title="Sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(product)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="modal" id="deleteModal">
            <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, product: null })}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Xác nhận xóa</h3>
                <button
                  className="modal-close"
                  id="closeDeleteModal"
                  onClick={() => setDeleteModal({ show: false, product: null })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm <strong id="deleteProductName">
                    {deleteModal.product?.flower?.name || deleteModal.product?.name || 'N/A'}
                  </strong>?
                </p>
                <p className="text-warning">Hành động này không thể hoàn tác!</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  id="cancelDelete"
                  onClick={() => setDeleteModal({ show: false, product: null })}
                >
                  Hủy
                </button>
                <button className="btn-danger" id="confirmDelete" onClick={handleDeleteConfirm}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <Toast message={toast.message} type={toast.type} />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsPage;
