import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { ShoppingCart, Heart, Star, Filter, Grid, List, ChevronDown, Sparkles, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';
import { selectAllProducts, selectProductsByCategory } from '../../../store/slices/productsSlice';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const itemsPerPage = 12;

  const allProducts = useSelector(selectAllProducts);
  const productsByCategory = useSelector(state => 
    categoryFilter ? selectProductsByCategory(state, categoryFilter) : allProducts
  );
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);

  const filteredProducts = useMemo(() => {
    let filtered = [...productsByCategory];

    if (searchQuery) {
      filtered = filtered.filter(product => {
        const flower = flowers.find(f => f.flower_id === product.flower_id);
        const color = colors.find(c => c.color_id === product.color_id);
        const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim().toLowerCase();
        return productName.includes(searchQuery.toLowerCase()) || 
               product.description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(product => {
        const pricePerBouquet = product.unit_price * 20;
        switch (selectedPriceRange) {
          case 'under-100k':
            return pricePerBouquet < 100000;
          case '100k-300k':
            return pricePerBouquet >= 100000 && pricePerBouquet < 300000;
          case '300k-500k':
            return pricePerBouquet >= 300000 && pricePerBouquet < 500000;
          case 'over-500k':
            return pricePerBouquet >= 500000;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.unit_price - b.unit_price;
        case 'price-high':
          return b.unit_price - a.unit_price;
        case 'name':
          const aFlower = flowers.find(f => f.flower_id === a.flower_id);
          const bFlower = flowers.find(f => f.flower_id === b.flower_id);
          return (aFlower?.flower_name || '').localeCompare(bFlower?.flower_name || '');
        default:
          return b.flower_color_id - a.flower_color_id;
      }
    });

    return filtered;
  }, [productsByCategory, searchQuery, sortBy, selectedPriceRange, flowers, colors]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    const flower = flowers.find(f => f.flower_id === product.flower_id);
    const color = colors.find(c => c.color_id === product.color_id);
    const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();
    
    dispatch(addToCart({
      flower_color_id: product.flower_color_id,
      unit_quantity: 20,
      quantity: 1,
      service_fee: 0,
      product: {
        ...product,
        name: productName,
      },
    }));
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getCategoryTitle = () => {
    const categoryMap = {
      'bo-hoa': 'Bó Hoa Tươi',
      'khai-truong': 'Kệ Hoa Khai Trương',
      'hoa-cuoi': 'Hoa Cưới',
      'hoa-sap': 'Hoa Sáp',
      'hoa-tang': 'Hoa Tang',
    };
    return categoryMap[categoryFilter] || 'Tất Cả Sản Phẩm';
  };

  const ProductCard = ({ product }) => {
    const flower = flowers.find(f => f.flower_id === product.flower_id);
    const color = colors.find(c => c.color_id === product.color_id);
    const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();
    const pricePerBouquet = product.unit_price * 20;

    return (
      <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
        <Link to={`/products/${product.flower_color_id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-green-50">
            <img
              src={product.image_path}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {product.quantity_in_stock < 10 && product.quantity_in_stock > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                Sắp hết
              </div>
            )}
            {product.quantity_in_stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-black text-xl bg-red-500 px-6 py-3 rounded-full">Hết hàng</span>
              </div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
                disabled={product.quantity_in_stock === 0}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                title="Thêm vào giỏ"
              >
                <ShoppingCart size={20} />
              </button>
              <button
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                title="Yêu thích"
              >
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-black text-lg text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
              {productName}
            </h3>
            
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1 font-semibold">(4.7)</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                  {pricePerBouquet.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm text-gray-500 ml-1">/ bó</span>
              </div>
              {product.quantity_in_stock > 0 && (
                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">Còn {product.quantity_in_stock}</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const ProductListItem = ({ product }) => {
    const flower = flowers.find(f => f.flower_id === product.flower_id);
    const color = colors.find(c => c.color_id === product.color_id);
    const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();
    const pricePerBouquet = product.unit_price * 20;

    return (
      <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <Link to={`/products/${product.flower_color_id}`} className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-72 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-pink-50 to-green-50 flex-shrink-0">
            <img
              src={product.image_path}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {product.quantity_in_stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-black text-xl bg-red-500 px-6 py-3 rounded-full">Hết hàng</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-primary transition-colors">
                {productName}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
                <span className="text-sm text-gray-600 font-semibold">(4.7) • Còn {product.quantity_in_stock} sản phẩm</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                  {pricePerBouquet.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm text-gray-500 ml-1">/ bó</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
                disabled={product.quantity_in_stock === 0}
                className="px-8 py-3 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-black hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <CustomerLayout>
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-in">
          <Check size={24} />
          <span className="font-semibold">Đã thêm vào giỏ hàng thành công!</span>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary via-green-600 to-primary text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-black mb-6">
                {getCategoryTitle()}
              </h1>
              <p className="text-xl opacity-90">
                {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Khám phá bộ sưu tập hoa tươi đa dạng'}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    showFilters 
                      ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={20} />
                  Lọc
                </button>
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl overflow-hidden p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
                <span className="text-gray-700 font-bold">
                  Hiển thị {filteredProducts.length} sản phẩm
                </span>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white font-bold text-gray-700 shadow-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp - cao</option>
                  <option value="price-high">Giá cao - thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-3">Khoảng giá</label>
                    <select
                      value={selectedPriceRange}
                      onChange={(e) => {
                        setSelectedPriceRange(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                    >
                      <option value="all">Tất cả</option>
                      <option value="under-100k">Dưới 100.000đ</option>
                      <option value="100k-300k">100.000đ - 300.000đ</option>
                      <option value="300k-500k">300.000đ - 500.000đ</option>
                      <option value="over-500k">Trên 500.000đ</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid/List */}
          {currentItems.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                  {currentItems.map((product) => (
                    <ProductCard key={product.flower_color_id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6 mb-12">
                  {currentItems.map((product) => (
                    <ProductListItem key={product.flower_color_id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-gray-700 hover:border-primary"
                  >
                    Trước
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-6 py-3 rounded-xl font-black transition-all ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-xl scale-110'
                              : 'border-2 border-gray-200 hover:border-primary text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-500 font-bold">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-gray-700 hover:border-primary"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl shadow-xl">
              <div className="text-8xl mb-6">🌹</div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">Không tìm thấy sản phẩm</h3>
              <p className="text-xl text-gray-600 mb-8">Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm</p>
              <Link
                to="/products"
                className="inline-block px-10 py-4 bg-gradient-to-r from-primary via-green-600 to-primary text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </CustomerLayout>
  );
};

export default ProductsPage;
