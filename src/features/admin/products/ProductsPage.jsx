import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../../layouts/AdminLayout';
import { Plus, Edit, Trash2, Search, Filter, X, Save } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllProducts, addProduct, updateProduct, deleteProduct } from '../../../store/slices/productsSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    flower_id: '',
    color_id: '',
    image_path: '',
    unit_price: '',
    description: '',
    quantity_in_stock: '',
    category: '',
  });

  const filteredProducts = products.filter(product => {
    const flower = flowers.find(f => f.flower_id === product.flower_id);
    const color = colors.find(c => c.color_id === product.color_id);
    const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim().toLowerCase();
    return productName.includes(searchQuery.toLowerCase()) || 
           product.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusColor = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock < 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (stock) => {
    if (stock === 0) return 'Hết hàng';
    if (stock < 10) return 'Sắp hết';
    return 'Còn hàng';
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        flower_id: product.flower_id,
        color_id: product.color_id,
        image_path: product.image_path,
        unit_price: product.unit_price,
        description: product.description,
        quantity_in_stock: product.quantity_in_stock,
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        flower_id: '',
        color_id: '',
        image_path: '',
        unit_price: '',
        description: '',
        quantity_in_stock: '',
        category: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      flower_id: '',
      color_id: '',
      image_path: '',
      unit_price: '',
      description: '',
      quantity_in_stock: '',
      category: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      dispatch(updateProduct({
        flower_color_id: editingProduct.flower_color_id,
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        quantity_in_stock: parseInt(formData.quantity_in_stock),
      }));
    } else {
      const newId = Math.max(...products.map(p => p.flower_color_id), 0) + 1;
      dispatch(addProduct({
        flower_color_id: newId,
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        quantity_in_stock: parseInt(formData.quantity_in_stock),
      }));
    }
    
    handleCloseModal();
  };

  const handleDelete = (flower_color_id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(flower_color_id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-800"
            >
              Quản Lý Sản Phẩm
            </motion.h1>
            <p className="text-gray-500 mt-1">Danh sách tất cả các loại hoa đang kinh doanh</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            <Plus size={20} />
            <span className="font-semibold">Thêm Sản Phẩm</span>
          </motion.button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              <Filter size={18} />
              Lọc
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Sản Phẩm', 'Loại hoa', 'Màu sắc', 'Giá/bông', 'Kho', 'Trạng Thái', 'Thao Tác'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => {
                  const flower = flowers.find(f => f.flower_id === product.flower_id);
                  const color = colors.find(c => c.color_id === product.color_id);
                  const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();

                  return (
                    <motion.tr
                      key={product.flower_color_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative group-hover:shadow-md transition-all">
                            <img
                              src={product.image_path}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{productName}</div>
                            <div className="text-xs text-gray-500">ID: {product.flower_color_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {flower?.flower_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color?.color_code || '#ccc' }}
                          />
                          <span className="text-sm text-gray-600">{color?.color_name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        {formatCurrency(product.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity_in_stock}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.quantity_in_stock)}`}>
                          {getStatusText(product.quantity_in_stock)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.flower_color_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Hiển thị {filteredProducts.length} sản phẩm
            </span>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại hoa *
                    </label>
                    <select
                      value={formData.flower_id}
                      onChange={(e) => setFormData({ ...formData, flower_id: e.target.value })}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Chọn loại hoa</option>
                      {flowers.map(flower => (
                        <option key={flower.flower_id} value={flower.flower_id}>
                          {flower.flower_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Màu sắc *
                    </label>
                    <select
                      value={formData.color_id}
                      onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Chọn màu sắc</option>
                      {colors.map(color => (
                        <option key={color.color_id} value={color.color_id}>
                          {color.color_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL hình ảnh *
                  </label>
                  <input
                    type="url"
                    value={formData.image_path}
                    onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá/bông (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng tồn kho *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_in_stock}
                      onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="bo-hoa">Bó hoa tươi</option>
                    <option value="khai-truong">Kệ khai trương</option>
                    <option value="hoa-cuoi">Hoa cưới</option>
                    <option value="hoa-sap">Hoa sáp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Nhập mô tả sản phẩm..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default ProductsPage;
