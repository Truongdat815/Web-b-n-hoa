import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllUsersQuery, useDeleteUserMutation } from '../../../api/users/userApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const UsersPage = () => {
  const { data: response, isLoading, refetch } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const users = response?.data || [];

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleDeleteClick = (user) => {
    setDeleteModal({ show: true, user });
  };

  const handleDeleteConfirm = async () => {
    try {
      const userId = deleteModal.user?.id;
      await deleteUser(userId).unwrap();
      showToast('Xóa tài khoản thành công!', 'success');
      setDeleteModal({ show: false, user: null });
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error?.data?.message || 'Xóa tài khoản thất bại!', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="content-header">
            <h1>Quản lý Tài khoản</h1>
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
            <h1>Quản lý Tài khoản</h1>
            <p>Danh sách tất cả tài khoản</p>
          </div>
          <Link to="/admin/users/new" className="btn-primary">
            <i className="fas fa-plus"></i>
            Thêm tài khoản
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
              placeholder="Tìm kiếm tài khoản..."
            />
          </div>
          <select
            className="filter-select"
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Accounts Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody id="accountsTableBody">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>Không tìm thấy tài khoản nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.fullName || 'N/A'}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/users/edit/${user.id}`}
                          className="btn-edit"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        {user.role !== 'ADMIN' && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteClick(user)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
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
            <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, user: null })}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Xác nhận xóa</h3>
                <button
                  className="modal-close"
                  id="closeDeleteModal"
                  onClick={() => setDeleteModal({ show: false, user: null })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Bạn có chắc chắn muốn xóa tài khoản <strong id="deleteAccountName">
                    {deleteModal.user?.username || deleteModal.user?.email || 'N/A'}
                  </strong>?
                </p>
                <p className="text-warning">Hành động này không thể hoàn tác!</p>
                <p className="text-warning" style={{ marginTop: '10px', fontSize: '13px' }}>
                  Lưu ý: Không thể xóa tài khoản admin cuối cùng.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  id="cancelDelete"
                  onClick={() => setDeleteModal({ show: false, user: null })}
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

export default UsersPage;
