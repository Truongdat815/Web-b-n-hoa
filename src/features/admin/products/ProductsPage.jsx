import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllFlowersQuery, useDeleteFlowerMutation } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import EditProductModal from './EditProductModal';
import '../../../assets/css/admin.css';

const ProductsPage = () => {
  const { data: response, isLoading, refetch } = useGetAllFlowersQuery();
  const [deleteFlower] = useDeleteFlowerMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ show: false });
  const [editModal, setEditModal] = useState({ show: false, productId: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const products = response?.data || response || [];

  // Extract category from flowerName (placeholder logic - can be replaced with actual category field)
  const getCategory = (flowerName) => {
    if (!flowerName) return 'Chưa phân loại';
    const name = flowerName.toLowerCase();
    if (name.includes('hồng') || name.includes('rose')) return 'Hoa hồng';
    if (name.includes('ly') || name.includes('lily')) return 'Hoa ly';
    if (name.includes('cúc') || name.includes('chrysanthemum')) return 'Hoa cúc';
    if (name.includes('tuylip') || name.includes('tulip')) return 'Hoa tuylip';
    if (name.includes('đào') || name.includes('peach')) return 'Hoa đào';
    return 'Khác';
  };

  // Get status based on stock (placeholder - can be replaced with actual status field)
  const getStatus = (product) => {
    const stock = product.quantityInStock || 0;
    return stock > 0 ? 'ACTIVE' : 'HIDDEN';
  };

  const categories = [...new Set(products.map(p => getCategory(p.flowerName)))].sort();

  const filteredProducts = products.filter(product => {
    const flowerName = (product.flowerName || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const matchesSearch = !searchQuery || 
      flowerName.includes(searchQuery.toLowerCase()) ||
      description.includes(searchQuery.toLowerCase());
    
    const category = getCategory(product.flowerName);
    const matchesCategory = !categoryFilter || category === categoryFilter;
    
    const status = getStatus(product);
    const matchesStatus = !statusFilter || status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStockStatus = (stock) => {
    const quantity = stock || 0;
    if (quantity === 0) {
      return { color: '#ef4444', label: 'Hết hàng', icon: 'fa-exclamation-circle' };
    }
    if (quantity < 5) {
      return { color: '#f59e0b', label: 'Sắp hết', icon: 'fa-exclamation-triangle' };
    }
    if (quantity < 10) {
      return { color: '#f97316', label: 'Còn ít', icon: 'fa-info-circle' };
    }
    return { color: '#10b981', label: 'Còn hàng', icon: 'fa-check-circle' };
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

  const handleEditClick = (product) => {
    setEditModal({ show: true, productId: product.flowerId });
  };

  const handleEditSuccess = () => {
    showToast('Cập nhật sản phẩm thành công!', 'success');
    refetch();
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

  // Bulk actions handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.flowerId)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (flowerId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(flowerId)) {
      newSelected.delete(flowerId);
    } else {
      newSelected.add(flowerId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkDeleteClick = () => {
    if (selectedProducts.size === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm để xóa!', 'warning');
      return;
    }
    setBulkDeleteModal({ show: true });
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const deletePromises = Array.from(selectedProducts).map(flowerId => 
        deleteFlower(flowerId).unwrap()
      );
      await Promise.all(deletePromises);
      showToast(`Đã xóa ${selectedProducts.size} sản phẩm thành công!`, 'success');
      setSelectedProducts(new Set());
      setBulkDeleteModal({ show: false });
      refetch();
    } catch (error) {
      console.error('Bulk delete error:', error);
      showToast(error?.data?.message || 'Xóa sản phẩm thất bại!', 'error');
    }
  };

  const isAllSelected = filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length;
  const isSomeSelected = selectedProducts.size > 0 && selectedProducts.size < filteredProducts.length;

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

      {/* Search and Filters */}
      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hiển thị</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>
        {selectedProducts.size > 0 && (
          <button
            className="btn-danger"
            onClick={handleBulkDeleteClick}
            style={{ 
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-trash"></i>
            Xóa đã chọn ({selectedProducts.size})
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="admin-table-container product-table-container">
        <table className="admin-table product-table">
          <thead>
            <tr>
              <th style={{ width: '40px', padding: '16px 12px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>Sản phẩm</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {              filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-box-open"></i>
                    <p>
                      {searchQuery || categoryFilter || statusFilter
                        ? 'Không tìm thấy sản phẩm nào'
                        : 'Chưa có sản phẩm nào. Hãy bấm "Thêm sản phẩm" để tạo.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => {
                const stock = product.quantityInStock || 0;
                const stockStatus = getStockStatus(stock);
                const status = getStatus(product);
                const category = getCategory(product.flowerName);
                const isSelected = selectedProducts.has(product.flowerId);
                
                return (
                  <tr key={product.flowerId}>
                    {/* Checkbox Column */}
                    <td style={{ width: '40px', padding: '16px 12px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectProduct(product.flowerId)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    {/* Combined Product Info Column */}
                    <td>
                      <div className="product-info-cell">
                        <img
                          src={product.imagePath || 'https://via.placeholder.com/64?text=No+Image'}
                          alt={product.flowerName}
                          className="product-table-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }}
                        />
                        <div className="product-info-text">
                          <div className="product-name-cell">
                            {product.flowerName || 'N/A'}
                          </div>
                          <div className="product-category-cell">
                            {category}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Price Column */}
                    <td>
                      <span className="product-price-cell">
                        {formatCurrency(product.unitPrice)}
                      </span>
                    </td>
                    
                    {/* Stock Status Column */}
                    <td>
                      <div className="stock-status-cell">
                        <span 
                          className="stock-quantity"
                          style={{ 
                            color: stockStatus.color,
                            fontWeight: '600'
                          }}
                        >
                          {stock}
                        </span>
                        {stock < 10 && (
                          <span 
                            className="stock-badge"
                            style={{ 
                              backgroundColor: stockStatus.color + '20',
                              color: stockStatus.color,
                              marginLeft: '8px'
                            }}
                          >
                            <i className={`fas ${stockStatus.icon}`}></i>
                            <span>{stockStatus.label}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td>
                      <span 
                        className={`status-badge ${
                          status === 'ACTIVE' 
                            ? 'status-active' 
                            : 'status-inactive'
                        }`}
                      >
                        <i className={`fas ${
                          status === 'ACTIVE' 
                            ? 'fa-check-circle' 
                            : 'fa-eye-slash'
                        }`}></i>
                        {status === 'ACTIVE' ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEditClick(product)}
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
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
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, product: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button
                className="modal-close"
                onClick={() => setDeleteModal({ show: false, product: null })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm <strong>
                  {deleteModal.product?.flowerName || 'N/A'}
                </strong>?
              </p>
              <p className="text-warning" style={{ color: '#f59e0b', marginTop: '10px', fontSize: '14px' }}>
                <i className="fas fa-exclamation-triangle"></i> Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setDeleteModal({ show: false, product: null })}
              >
                Hủy
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDeleteConfirm}
                style={{ backgroundColor: '#ef4444' }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal.show && (
        <div className="modal-overlay" onClick={() => setBulkDeleteModal({ show: false })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa nhiều sản phẩm</h3>
              <button
                className="modal-close"
                onClick={() => setBulkDeleteModal({ show: false })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa <strong>{selectedProducts.size}</strong> sản phẩm đã chọn?
              </p>
              <p className="text-warning" style={{ color: '#f59e0b', marginTop: '10px', fontSize: '14px' }}>
                <i className="fas fa-exclamation-triangle"></i> Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setBulkDeleteModal({ show: false })}
              >
                Hủy
              </button>
              <button 
                className="btn-danger" 
                onClick={handleBulkDeleteConfirm}
                style={{ backgroundColor: '#ef4444' }}
              >
                Xóa ({selectedProducts.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModal.show}
        onClose={() => setEditModal({ show: false, productId: null })}
        productId={editModal.productId}
        onSuccess={handleEditSuccess}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </AdminLayout>
  );
};

export default ProductsPage;
