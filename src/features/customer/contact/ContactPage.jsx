import { motion } from 'framer-motion';
import { useState } from 'react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
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
                Liên Hệ
              </h1>
              <p className="text-xl opacity-90">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Thông Tin Liên Hệ</h2>
                <p className="text-gray-600 mb-8">
                  Chúng tôi rất vui được hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các thông tin dưới đây hoặc điền form bên cạnh.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">
                      114 Dương Quang Đông, Phường 5, Quận 8, TP.HCM (Online)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Điện thoại</h3>
                    <a href="tel:0859336677" className="text-primary font-bold text-lg hover:underline">
                      0859336677
                    </a>
                    <p className="text-gray-600 text-sm mt-1">Hotline: 0862775939</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Email</h3>
                    <a href="mailto:gochoaxinh@gmail.com" className="text-primary hover:underline">
                      gochoaxinh@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">
                      Thứ 2 - Chủ nhật: 8:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-6">
                <h3 className="font-bold text-gray-800 mb-4">Theo dõi chúng tôi</h3>
                <div className="flex gap-4">
                  <a
                    href="https://facebook.com/gochoaxinh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    href="https://instagram.com/gochoaxinh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle size={24} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Gửi Tin Nhắn</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Nhập chủ đề"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tin nhắn *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Nhập tin nhắn của bạn"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      Gửi tin nhắn
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Map Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Bản đồ sẽ được tích hợp sau</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ContactPage;

