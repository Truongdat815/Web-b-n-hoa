import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { 
  useGetAllPromotionsQuery, 
  useDeletePromotionMutation,
  useTogglePromotionStatusMutation 
} from '../../../api/promotions/promotionApi';
import { useGetAllFlowersQuery } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const PromotionsPage = () => {
  const { data: response, isLoading, refetch } = useGetAllPromotionsQuery();
  const { data: flowersData } = useGetAllFlowersQuery();
  const [deletePromotion] = useDeletePromotionMutation();
  const [togglePromotionStatus] = useTogglePromotionStatusMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'active', 'inactive', ''
  const [deleteModal, setDeleteModal] = useState({ show: false, promotion: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const promotions = response?.data || response || [];
  const flowers = flowersData?.data || [];
  const flowerMap = new Map(flowers.map(f => [f.flowerId, f.flowerName]));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isPromotionActive = (promotion) => {
    // Use the active/isActive field from API response directly
    if (promotion.active !== undefined) {
      return promotion.active;
    }
    if (promotion.isActive !== undefined) {
      return promotion.isActive;
    }
    // Fallback: check status field
    if (promotion.status !== undefined) {
      return promotion.status === 'ACTIVE';
    }
    // Last fallback: check date range (for backward compatibility)
    if (!promotion.startDate || !promotion.endDate) return false;
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = !searchQuery || 
      (promotion.promotionName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promotion.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = isPromotionActive(promotion);
    } else if (statusFilter === 'inactive') {
      matchesStatus = !isPromotionActive(promotion);
    }
    
    return matchesSearch && matchesStatus;
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleDeleteClick = (promotion) => {
    setDeleteModal({ show: true, promotion });
  };

  const handleDeleteConfirm = async () => {
    try {
      const promotionId = deleteModal.promotion?.promotionId;
      await deletePromotion(promotionId).unwrap();
      showToast('Xóa khuyến mãi thành công!', 'success');
      setDeleteModal({ show: false, promotion: null });
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error?.data?.message || 'Xóa khuyến mãi thất bại!', 'error');
    }
  };

  const handleToggleStatus = async (promotion) => {
    try {
      const promotionId = promotion.promotionId;
      await togglePromotionStatus(promotionId).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Toggle status error:', error);
      showToast(error?.data?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  const getPromotionDisplayValue = (promotion) => {
    if (promotion.promotionType === 'PERCENTAGE') {
      return `${promotion.amount}%`;
    }
    return formatCurrency(promotion.amount);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="content-header">
          <h1>Quản lý Khuyến mãi</h1>
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="content-header">
        <div>
          <h1>Quản lý Khuyến mãi</h1>
          <p>Danh sách tất cả khuyến mãi</p>
        </div>
        <Link to="/admin/promotions/new" className="btn-primary">
          <i className="fas fa-plus"></i>
          Thêm khuyến mãi
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm khuyến mãi..."
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Promotions Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên khuyến mãi</th>
              <th>Loại</th>
              <th>Giảm giá</th>
              <th>Áp dụng cho</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-tag"></i>
                    <p>Không tìm thấy khuyến mãi nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPromotions.map((promotion) => {
                const isActive = isPromotionActive(promotion);
                return (
                  <tr key={promotion.promotionId}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#2c2c2c' }}>
                        {promotion.promotionName || 'N/A'}
                      </div>
                      {promotion.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {promotion.description.length > 50 
                            ? `${promotion.description.substring(0, 50)}...` 
                            : promotion.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-admin">
                        {promotion.promotionType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#E95473' }}>
                      {getPromotionDisplayValue(promotion)}
                    </td>
                    <td>
                      {promotion.forAll ? (
                        <span className="badge badge-user">Tất cả sản phẩm</span>
                      ) : (
                        <span>{flowerMap.get(promotion.flowerId) || `ID: ${promotion.flowerId}`}</span>
                      )}
                    </td>
                    <td>{formatDate(promotion.startDate)}</td>
                    <td>{formatDate(promotion.endDate)}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                        <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-ban'}`}></i>
                        {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/promotions/edit/${promotion.promotionId}`}
                          className="btn-edit"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          type="button"
                          className="status-toggle"
                          onClick={() => handleToggleStatus(promotion)}
                          title="Đổi trạng thái"
                        >
                          <i className={`fas ${isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteClick(promotion)}
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
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, promotion: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa khuyến mãi "{deleteModal.promotion?.promotionName}"?</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button
                className="btn-primary"
                onClick={handleDeleteConfirm}
                style={{ backgroundColor: '#ef4444' }}
              >
                Xóa
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteModal({ show: false, promotion: null })}
              >
                Hủy
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

export default PromotionsPage;
