import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowRight, Clock, FileText, Shield, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';
import { selectProductsByCategory } from '../../../store/slices/productsSlice';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero Slider Images
  const sliderImages = [
    {
      image: 'https://images.unsplash.com/photo-1628151016027-2c1393693fb4?q=80&w=2072',
      title: 'Góc Hoa Xinh',
      subtitle: 'Shop hoa tươi tại Quận 7 và Quận 8',
    },
    {
      image: 'https://images.unsplash.com/photo-1507290432578-2231b7747cae?q=80&w=2070',
      title: 'Bó Hoa Độc Đáo',
      subtitle: 'Cho mọi dịp đặc biệt',
    },
    {
      image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?q=80&w=2040',
      title: 'Giao Hoa Nhanh Chóng',
      subtitle: 'Chuyên nghiệp và tận tâm',
    },
  ];

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  // Features
  const features = [
    {
      icon: '⏰',
      title: 'Giao hàng đúng giờ',
      desc: 'Cam kết đúng giờ, đảm bảo sản phẩm',
    },
    {
      icon: '📄',
      title: 'Xuất hóa đơn VAT',
      desc: 'Xuất VAT trong ngày (8%)',
    },
    {
      icon: '✅',
      title: 'Cam kết chất lượng',
      desc: 'Hoa tươi mới mỗi ngày không héo úa',
    },
    {
      icon: '📞',
      title: 'Hotline: 0862775939',
      desc: 'Tư vấn theo phù hợp giá tiền',
    },
  ];

  // Featured Categories
  const categories = [
    { title: 'Bó hoa tươi', image: 'https://images.unsplash.com/photo-1518465225381-8b2b73719119?w=500&q=80', link: '/products?category=bo-hoa' },
    { title: 'Kệ khai trương', image: 'https://images.unsplash.com/photo-1557761168-91ac1d5e38d7?w=500&q=80', link: '/products?category=khai-truong' },
    { title: 'Hoa chúc mừng', image: 'https://images.unsplash.com/photo-1522338242992-e1a55dcb27e6?w=500&q=80', link: '/products?category=chuc-mung' },
    { title: 'Hoa sáp', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80', link: '/products?category=hoa-sap' },
    { title: 'Hoa Cưới', image: 'https://images.unsplash.com/photo-1527334139976-189f7831f47c?w=500&q=80', link: '/products?category=hoa-cuoi' },
    { title: 'Hoa Tang', image: 'https://images.unsplash.com/photo-1566927375263-6d0934cf09d9?w=500&q=80', link: '/products?category=hoa-tang' },
  ];

  // Get products from store
  const boHoaProducts = useSelector(state => selectProductsByCategory(state, 'bo-hoa')).slice(0, 4);
  const keKhaiTruongProducts = useSelector(state => selectProductsByCategory(state, 'khai-truong')).slice(0, 4);
  const hoaSapProducts = useSelector(state => selectProductsByCategory(state, 'hoa-sap')).slice(0, 4);
  const hoaCuoiProducts = useSelector(state => selectProductsByCategory(state, 'hoa-cuoi')).slice(0, 4);
  const flowers = useSelector(state => state.products.flowers);
  const colors = useSelector(state => state.products.colors);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const ProductCard = ({ product }) => {
    const flower = flowers.find(f => f.flower_id === product.flower_id);
    const color = colors.find(c => c.color_id === product.color_id);
    const productName = `${flower?.flower_name || ''} ${color?.color_name || ''}`.trim();
    const pricePerBouquet = product.unit_price * 20; // Default 20 bông/bó

    const handleAddToCart = (e) => {
      e.preventDefault();
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
    };

    return (
      <div className="product-card">
        <Link to={`/products/${product.flower_color_id}`} className="block">
          <div className="product-image-wrapper">
            <img src={product.image_path} alt={productName} className="product-image" />
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
          <div className="product-info">
            <h3 className="product-name">{productName}</h3>
            <div className="product-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < 4 ? 'filled' : ''}
                />
              ))}
              <span className="rating-text">(4.7)</span>
            </div>
            <div className="product-price">
              <span className="current-price">{pricePerBouquet.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  const ProductSection = ({ title, products, link }) => (
    <section className="product-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to={link} className="view-all-link">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <CustomerLayout>
      {/* Hero Slider */}
      <section className="hero-slider-section">
        <div className="hero-slider-container">
          {sliderImages.map((slide, idx) => (
            <div
              key={idx}
              className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-btn prev" onClick={prevSlide}>‹</button>
        <button className="slider-btn next" onClick={nextSlide}>›</button>
        <div className="slider-dots">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-heading">Danh mục nổi bật</h2>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <Link key={idx} to={cat.link} className="category-card">
                <img src={cat.image} alt={cat.title} />
                <div className="category-overlay">
                  <h3 className="category-title">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <ProductSection
        title="Bó hoa tươi từ 89k"
        products={boHoaProducts}
        link="/products?category=bo-hoa"
      />

      <ProductSection
        title="Kệ mừng khai trương/ sự kiện từ 700k"
        products={keKhaiTruongProducts}
        link="/products?category=khai-truong"
      />

      <ProductSection
        title="Hoa Sáp"
        products={hoaSapProducts}
        link="/products?category=hoa-sap"
      />

      <ProductSection
        title="Hoa Cưới"
        products={hoaCuoiProducts}
        link="/products?category=hoa-cuoi"
      />

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2 className="about-title">
              Góc Hoa Xinh - Nơi Kết Nối Cảm Xúc Qua Những Bó Hoa Tươi Tắn
            </h2>
            <p className="about-text">
              Bạn đang tìm kiếm một <strong>cửa hàng hoa tươi</strong> uy tín tại TP.HCM, nơi không chỉ cung cấp những bó hoa đẹp mắt mà còn mang đến trải nghiệm dịch vụ tận tâm? 
              <strong> Shop hoa gần đây</strong> ở Quận 7 - là địa điểm lý tưởng dành cho bạn. Với sự đam mê và sáng tạo trong từng sản phẩm, 
              chúng tôi cam kết mang đến những bó hoa ý nghĩa, giúp bạn truyền tải thông điệp yêu thương đến người nhận trong mọi dịp đặc biệt.
            </p>
            <div className="rating-display">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="star-filled" />
              ))}
              <span className="rating-text-large">4.7/5 - (37 bình chọn)</span>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default HomePage;
