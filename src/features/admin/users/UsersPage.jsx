import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllUsersQuery, useUpdateUserStatusMutation } from '../../../api/users/userApi';
import Toast from '../../../components/ui/Toast';
import { isAdminEmail } from '../../../config/admin';
import '../../../assets/css/admin.css';

const UsersPage = () => {
  const { data: response, isLoading, refetch } = useGetAllUsersQuery();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const users = response?.data || [];

  const getRoleRaw = (user) =>
    (user?.roleName || user?.role || user?.role_name || '').toString().toUpperCase();

  const isAdminAccount = (user) => {
    const roleRaw = getRoleRaw(user);
    const roleId = user?.roleId ?? user?.role_id;
    // Backend currently may return ADMIN for all users, so we only trust admin email allowlist.
    return isAdminEmail(user?.email) && (roleRaw.includes('ADMIN') || roleId === 1);
  };

  const getRoleKey = (user) => (isAdminAccount(user) ? 'ADMIN' : 'CUSTOMER');

  const getRoleLabel = (user) => (isAdminAccount(user) ? 'Administrator' : 'Khách hàng');

  const getStatusRaw = (user) => (user?.status || user?.userStatus || '').toString().toUpperCase();
  const getStatusKey = (user) => (getStatusRaw(user) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || getRoleKey(user) === roleFilter;
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

  const handleToggleStatus = async (user) => {
    try {
      const userId = user?.userId || user?.id;
      if (!userId) throw new Error('Không tìm thấy userId');

      if (isAdminAccount(user)) {
        showToast('Không thể thay đổi trạng thái tài khoản Admin!', 'error');
        return;
      }

      await updateUserStatus(userId).unwrap();
      showToast('Cập nhật trạng thái thành công!', 'success');
      refetch();
    } catch (error) {
      console.error('Update status error:', error);
      showToast(error?.data?.message || error?.message || 'Cập nhật trạng thái thất bại!', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="content-header">
          <h1>Quản lý Tài khoản</h1>
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="content-header">
        <div>
          <h1>Quản lý Tài khoản</h1>
          <p>Danh sách tất cả tài khoản</p>
        </div>
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
          <option value="ADMIN">Administrator</option>
          <option value="CUSTOMER">Khách hàng</option>
        </select>
      </div>

      {/* Accounts Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="accountsTableBody">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <p>Không tìm thấy tài khoản nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const userId = user?.userId || user?.id || user?.email;
                const isAdmin = isAdminAccount(user);
                const statusKey = getStatusKey(user);
                const createdAt = user?.createdAt || user?.createdDate || user?.created_date;
                return (
                  <tr key={userId}>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.fullName || 'N/A'}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                        {getRoleLabel(user)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusKey === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                        <i className={`fas ${statusKey === 'ACTIVE' ? 'fa-check-circle' : 'fa-ban'}`}></i>
                        {statusKey}
                      </span>
                    </td>
                    <td>{formatDate(createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/users/edit/${user?.userId || user?.id}`}
                          className="btn-edit"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>

                        <button
                          type="button"
                          className="status-toggle"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isAdmin || isUpdatingStatus}
                          title={isAdmin ? 'Không thể thay đổi trạng thái tài khoản Admin' : 'Đổi trạng thái Active/Inactive'}
                        >
                          <span
                            className={`status-badge ${
                              isAdmin
                                ? 'disabled'
                                : (statusKey === 'ACTIVE' ? 'status-active' : 'status-inactive')
                            }`}
                          >
                            <i className={`fas ${statusKey === 'ACTIVE' ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                            {statusKey}
                          </span>
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

      {toast.show && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </AdminLayout>
  );
};

export default UsersPage;
