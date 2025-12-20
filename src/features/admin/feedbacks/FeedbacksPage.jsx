import { useState, useMemo } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { useGetAllFeedbacksQuery } from '../../../api/feedbacks/feedbackApi';
import { useGetAllFlowersQuery } from '../../../api/flowers/flowerApi';
import Toast from '../../../components/ui/Toast';
import '../../../assets/css/admin.css';

const FeedbacksPage = () => {
  const { data: feedbacksResponse, isLoading, refetch } = useGetAllFeedbacksQuery();
  const { data: flowersResponse } = useGetAllFlowersQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [flowerFilter, setFlowerFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const feedbacks = feedbacksResponse?.data || [];
  const flowers = flowersResponse?.data || [];

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesSearch = searchQuery === '' || 
        (feedback.customerName && feedback.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (feedback.content && feedback.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (feedback.flowerName && feedback.flowerName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFlower = flowerFilter === '' || feedback.flowerId?.toString() === flowerFilter;
      const matchesRating = ratingFilter === '' || feedback.rating?.toString() === ratingFilter;

      return matchesSearch && matchesFlower && matchesRating;
    });
  }, [feedbacks, searchQuery, flowerFilter, ratingFilter]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star" style={{ color: '#FFD700' }}></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#FFD700' }}></i>);
      } else {
        stars.push(<i key={i} className="far fa-star" style={{ color: '#ddd' }}></i>);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="content-header">
          <div>
            <h1>Quản lý Đánh giá</h1>
            <p>Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />

      <div className="content-header">
        <div>
          <h1>Quản lý Đánh giá</h1>
          <p>Xem và quản lý tất cả đánh giá của khách hàng</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên khách hàng, sản phẩm hoặc nội dung..."
          />
        </div>
        <select
          className="filter-select"
          value={flowerFilter}
          onChange={(e) => setFlowerFilter(e.target.value)}
        >
          <option value="">Tất cả sản phẩm</option>
          {flowers.map(flower => (
            <option key={flower.flowerId} value={flower.flowerId}>
              {flower.flowerName}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">Tất cả đánh giá</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Feedbacks Table */}
      <div className="admin-table-container">
        {filteredFeedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            {feedbacks.length === 0 ? 'Chưa có đánh giá nào' : 'Không tìm thấy đánh giá nào'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày đánh giá</th>
                <th>Mã đơn hàng</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback, index) => (
                <tr key={feedback.feedbackId}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {feedback.flowerImagePath && (
                        <img
                          src={feedback.flowerImagePath}
                          alt={feedback.flowerName}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: '#2c2c2c' }}>
                          {feedback.flowerName || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{feedback.customerName || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(feedback.rating)}
                      <span style={{ marginLeft: '4px', fontWeight: '600' }}>
                        {feedback.rating || 0}/5
                      </span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#666',
                      }}
                      title={feedback.content}
                    >
                      {feedback.content || 'Không có nội dung'}
                    </div>
                  </td>
                  <td>{formatDate(feedback.createdAt)}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: '#E95473', fontWeight: '600' }}>
                      {feedback.orderCode || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tổng số đánh giá</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c2c2c' }}>
              {feedbacks.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Kết quả tìm kiếm</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#E95473' }}>
              {filteredFeedbacks.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Đánh giá trung bình</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c2c2c' }}>
              {feedbacks.length > 0
                ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
                : '0.0'}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbacksPage;

