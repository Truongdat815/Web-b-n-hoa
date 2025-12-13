import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Cách Chăm Sóc Hoa Hồng Để Tươi Lâu',
      excerpt: 'Hoa hồng là một trong những loài hoa được yêu thích nhất. Hãy cùng tìm hiểu cách chăm sóc hoa hồng để giữ được độ tươi lâu nhất...',
      image: 'https://images.unsplash.com/photo-1582794543598-c689622c7109?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2024-01-15',
      readTime: '5 phút',
      category: 'Chăm sóc hoa',
    },
    {
      id: 2,
      title: 'Ý Nghĩa Của Các Loài Hoa Trong Ngày Cưới',
      excerpt: 'Mỗi loài hoa đều mang một ý nghĩa riêng biệt. Trong ngày cưới, việc chọn hoa phù hợp sẽ làm cho ngày trọng đại của bạn thêm ý nghĩa...',
      image: 'https://images.unsplash.com/photo-1527334139976-189f7831f47c?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2024-01-10',
      readTime: '7 phút',
      category: 'Hoa cưới',
    },
    {
      id: 3,
      title: 'Top 10 Loài Hoa Đẹp Nhất Cho Mùa Xuân',
      excerpt: 'Mùa xuân là mùa của những bông hoa rực rỡ. Hãy khám phá top 10 loài hoa đẹp nhất cho mùa xuân và cách trang trí chúng...',
      image: 'https://images.unsplash.com/photo-1507290432578-2231b7747cae?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2024-01-05',
      readTime: '6 phút',
      category: 'Mùa xuân',
    },
    {
      id: 4,
      title: 'Hướng Dẫn Chọn Hoa Khai Trương Phù Hợp',
      excerpt: 'Hoa khai trương là một phần quan trọng trong các sự kiện khai trương. Bài viết này sẽ hướng dẫn bạn cách chọn hoa phù hợp...',
      image: 'https://images.unsplash.com/photo-1557761168-91ac1d5e38d7?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2024-01-01',
      readTime: '4 phút',
      category: 'Hoa khai trương',
    },
    {
      id: 5,
      title: 'Sự Khác Biệt Giữa Hoa Tươi Và Hoa Sáp',
      excerpt: 'Hoa tươi và hoa sáp đều có những ưu điểm riêng. Hãy cùng tìm hiểu sự khác biệt để chọn loại hoa phù hợp với nhu cầu của bạn...',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2023-12-28',
      readTime: '5 phút',
      category: 'So sánh',
    },
    {
      id: 6,
      title: 'Cách Bảo Quản Hoa Tươi Trong Tủ Lạnh',
      excerpt: 'Bảo quản hoa tươi đúng cách sẽ giúp hoa tươi lâu hơn. Bài viết này sẽ hướng dẫn bạn cách bảo quản hoa trong tủ lạnh...',
      image: 'https://images.unsplash.com/photo-1545529468-42764ef8c85f?w=800&q=80',
      author: 'Góc Hoa Xinh',
      date: '2023-12-25',
      readTime: '3 phút',
      category: 'Bảo quản',
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <CustomerLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.3)' }}>
                Tin Tức
              </h1>
              <p className="text-xl opacity-90">
                Cập nhật những thông tin mới nhất về hoa tươi và cách chăm sóc
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all duration-300"
              >
                <Link to={`/blog/${post.id}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                      Đọc thêm
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              Trước
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
              1
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              2
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              3
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              Sau
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BlogPage;

