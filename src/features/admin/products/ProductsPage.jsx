import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllFlowersQuery, useDeleteFlowerMutation } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const ProductsPage = () => {
  const { data: response, isLoading, refetch } = useGetAllFlowersQuery();
  const [deleteFlower] = useDeleteFlowerMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const products = response?.data || response || [];

  const filteredProducts = products.filter(product => {
    const flowerName = product.flowerName || '';
    const matchesSearch = !searchQuery || 
      flowerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
      const flowerId = deleteModal.product?.flowerId;
      await deleteFlower(flowerId).unwrap();
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
        <div className="content-header">
          <h1>Quản lý Sản phẩm</h1>
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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

        {/* Search */}
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
        </div>

        {/* Products Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="productsTableBody">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <i className="fas fa-box-open"></i>
                      <p>
                        {searchQuery
                          ? 'Không tìm thấy sản phẩm nào'
                          : 'Chưa có sản phẩm nào. Hãy bấm "Thêm sản phẩm" để tạo.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.flowerId}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={product.imagePath || 'https://via.placeholder.com/50'}
                        alt={product.flowerName}
                        className="table-image"
                      />
                    </td>
                    <td>{product.flowerName}</td>
                    <td>{formatCurrency(product.unitPrice || 0)}</td>
                    <td>{product.quantityInStock || 0}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description || '-'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/products/edit/${product.flowerId}`}
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
                ))
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
                    {deleteModal.product?.flowerName || 'N/A'}
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
    </AdminLayout>
  );
};

export default ProductsPage;
