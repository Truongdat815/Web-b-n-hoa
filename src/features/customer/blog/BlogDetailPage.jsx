import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import CustomerLayout from '../../../layouts/CustomerLayout';
import SEOHead from '../../../components/seo/SEOHead';
import '../../../assets/css/home.css';

// Dữ liệu bài viết (trong thực tế sẽ lấy từ API)
const blogPosts = {
  1: {
    id: 1,
    title: 'Cách Chăm Sóc Hoa Hồng Để Tươi Lâu - Hướng Dẫn Chi Tiết 2025',
    slug: 'cach-cham-soc-hoa-hong-de-tuoi-lau',
    excerpt: 'Hoa hồng là một trong những loài hoa được yêu thích nhất. Hãy cùng tìm hiểu cách chăm sóc hoa hồng để giữ được độ tươi lâu nhất...',
    image: 'https://images.unsplash.com/photo-1582794543598-c689622c7109?w=1200&h=800&fit=crop',
    author: 'Góc Hoa Xinh',
    date: '2024-01-15',
    readTime: '5 phút',
    category: 'Chăm sóc hoa',
    keywords: 'cách chăm sóc hoa hồng, hoa hồng tươi lâu, chăm sóc hoa hồng, mẹo giữ hoa hồng tươi, hoa hồng đẹp',
    content: `
      <h2>Tại sao cần chăm sóc hoa hồng đúng cách?</h2>
      <p>Hoa hồng là biểu tượng của tình yêu và sự lãng mạn, nhưng để giữ được vẻ đẹp và độ tươi của chúng không phải là điều dễ dàng. Việc chăm sóc hoa hồng đúng cách sẽ giúp hoa tươi lâu hơn, giữ được màu sắc rực rỡ và hương thơm ngọt ngào. Trong bài viết này, chúng tôi sẽ hướng dẫn bạn các bước chi tiết để chăm sóc hoa hồng một cách hiệu quả nhất.</p>

      <h2>Các bước chăm sóc hoa hồng cơ bản</h2>
      
      <h3>Bước 1: Cắt tỉa cành hoa</h3>
      <p>Khi mua hoa hồng về, việc đầu tiên bạn cần làm là cắt tỉa phần gốc cành. Hãy cắt chéo một góc 45 độ dưới vòi nước chảy để tránh không khí xâm nhập vào mạch dẫn nước. Cắt bỏ các lá ở phần dưới cành sẽ ngâm trong nước để tránh vi khuẩn phát triển.</p>

      <h3>Bước 2: Chuẩn bị nước sạch</h3>
      <p>Sử dụng nước sạch, tốt nhất là nước ấm (khoảng 37-40°C) để hoa hấp thụ nước nhanh hơn. Thay nước mỗi ngày và cắt lại phần gốc cành 1-2cm để đảm bảo hoa luôn hấp thụ được nước tốt nhất.</p>

      <h3>Bước 3: Thêm chất dinh dưỡng</h3>
      <p>Bạn có thể thêm một chút đường hoặc chất bảo quản hoa vào nước. Đường sẽ cung cấp năng lượng cho hoa, giúp hoa tươi lâu hơn. Tuy nhiên, không nên cho quá nhiều vì có thể tạo môi trường cho vi khuẩn phát triển.</p>

      <h2>Mẹo vặt giúp hoa hồng tươi lâu hơn</h2>
      
      <h3>Đặt hoa ở nơi mát mẻ</h3>
      <p>Tránh đặt hoa hồng ở nơi có ánh nắng trực tiếp hoặc gần các nguồn nhiệt như tivi, máy tính. Nhiệt độ lý tưởng để giữ hoa tươi là từ 18-22°C. Nơi có gió nhẹ cũng giúp hoa tươi lâu hơn.</p>

      <h3>Tránh xa trái cây chín</h3>
      <p>Khí ethylene từ trái cây chín sẽ làm hoa nhanh héo. Hãy đặt hoa hồng cách xa các loại trái cây như chuối, táo, lê ít nhất 2-3 mét.</p>

      <h3>Sử dụng nước đá vào ban đêm</h3>
      <p>Một mẹo nhỏ là đặt hoa hồng vào tủ lạnh (ngăn mát) vào ban đêm. Nhiệt độ thấp sẽ làm chậm quá trình héo của hoa, giúp hoa tươi lâu hơn đáng kể.</p>

      <h2>Xử lý khi hoa bắt đầu héo</h2>
      <p>Nếu hoa hồng bắt đầu có dấu hiệu héo, bạn có thể thử ngâm toàn bộ hoa (trừ phần hoa) vào nước ấm trong 30 phút. Sau đó cắt lại phần gốc và đặt vào nước lạnh. Cách này có thể giúp hoa "hồi sinh" một phần.</p>

      <h2>Kết luận</h2>
      <p>Chăm sóc hoa hồng đúng cách không khó, chỉ cần bạn chú ý một số điểm quan trọng: cắt tỉa đúng cách, thay nước thường xuyên, đặt ở nơi mát mẻ và tránh các tác nhân gây hại. Với những mẹo trên, hoa hồng của bạn có thể tươi từ 7-10 ngày, thậm chí lâu hơn tùy vào giống hoa và điều kiện chăm sóc.</p>
      <p>Nếu bạn đang tìm mua hoa hồng tươi đẹp, hãy ghé thăm <strong>Góc Hoa Xinh</strong> - shop hoa tươi online uy tín với nhiều loại hoa hồng đa dạng, từ hoa hồng đỏ cổ điển đến các giống hoa hồng nhập khẩu độc đáo.</p>
    `
  },
  3: {
    id: 3,
    title: 'Top 10 Loài Hoa Đẹp Nhất Cho Mùa Xuân 2025 - Gợi Ý Trang Trí',
    slug: 'top-10-loai-hoa-dep-nhat-cho-mua-xuan',
    excerpt: 'Mùa xuân là mùa của những bông hoa rực rỡ. Hãy khám phá top 10 loài hoa đẹp nhất cho mùa xuân và cách trang trí chúng...',
    image: 'https://images.unsplash.com/photo-1507290432578-2231b7747cae?w=1200&h=800&fit=crop',
    author: 'Góc Hoa Xinh',
    date: '2024-01-05',
    readTime: '6 phút',
    category: 'Mùa xuân',
    keywords: 'hoa mùa xuân, loài hoa đẹp mùa xuân, trang trí hoa mùa xuân, hoa xuân 2025, top hoa đẹp',
    content: `
      <h2>Mùa xuân - Mùa của những bông hoa rực rỡ</h2>
      <p>Mùa xuân là thời điểm tuyệt vời nhất trong năm để thưởng thức vẻ đẹp của thiên nhiên. Với khí hậu ấm áp, mưa phùn nhẹ nhàng, các loài hoa bắt đầu đua nở, tạo nên một bức tranh thiên nhiên đầy màu sắc. Trong bài viết này, chúng tôi sẽ giới thiệu top 10 loài hoa đẹp nhất cho mùa xuân và cách trang trí chúng để làm đẹp không gian sống của bạn.</p>

      <h2>Top 10 loài hoa đẹp nhất cho mùa xuân</h2>
      
      <h3>1. Hoa đào - Biểu tượng của mùa xuân Việt Nam</h3>
      <p>Hoa đào là loài hoa không thể thiếu trong dịp Tết cổ truyền. Với sắc hồng phấn dịu dàng, hoa đào mang đến không khí ấm cúng, sum vầy cho gia đình. Hoa đào thường được trưng trong phòng khách hoặc sân vườn, tạo điểm nhấn cho không gian ngày Tết.</p>

      <h3>2. Hoa mai vàng - Sắc vàng rực rỡ</h3>
      <p>Hoa mai vàng với sắc vàng tươi tắn là biểu tượng của sự may mắn, thịnh vượng. Loài hoa này đặc biệt phổ biến ở miền Nam Việt Nam và thường được trưng bày trong dịp Tết Nguyên Đán.</p>

      <h3>3. Hoa tulip - Vẻ đẹp thanh lịch</h3>
      <p>Hoa tulip với hình dáng độc đáo và màu sắc đa dạng là lựa chọn hoàn hảo cho mùa xuân. Từ tulip đỏ rực rỡ đến tulip vàng tươi tắn, mỗi màu sắc đều mang một ý nghĩa riêng. Hoa tulip thường được cắm trong bình cao, tạo điểm nhấn sang trọng cho không gian.</p>

      <h3>4. Hoa cúc họa mi - Vẻ đẹp giản dị</h3>
      <p>Hoa cúc họa mi với sắc trắng tinh khôi và nhụy vàng tươi là loài hoa đặc trưng của mùa thu - đông, nhưng vẫn được yêu thích vào đầu xuân. Loài hoa này mang đến cảm giác thanh bình, nhẹ nhàng cho không gian.</p>

      <h3>5. Hoa hướng dương - Năng lượng tích cực</h3>
      <p>Hoa hướng dương với sắc vàng rực rỡ và kích thước lớn là biểu tượng của năng lượng tích cực, sự lạc quan. Loài hoa này thích hợp để trang trí phòng khách hoặc sân vườn, tạo không khí vui tươi, tràn đầy sức sống.</p>

      <h3>6. Hoa ly - Hương thơm quyến rũ</h3>
      <p>Hoa ly với hương thơm ngọt ngào và vẻ đẹp thanh tao là lựa chọn lý tưởng cho mùa xuân. Loài hoa này có nhiều màu sắc từ trắng tinh khôi đến hồng dịu dàng, phù hợp với nhiều phong cách trang trí khác nhau.</p>

      <h3>7. Hoa cẩm chướng - Vẻ đẹp đa sắc</h3>
      <p>Hoa cẩm chướng với nhiều lớp cánh mỏng và màu sắc đa dạng là loài hoa dễ trồng, dễ chăm sóc. Loài hoa này thích hợp để trang trí ban công, sân vườn hoặc cắm trong bình để làm đẹp không gian nội thất.</p>

      <h3>8. Hoa thủy tiên - Tinh tế và thanh khiết</h3>
      <p>Hoa thủy tiên với sắc trắng tinh khôi và hương thơm nhẹ nhàng là loài hoa đặc trưng của mùa xuân. Loài hoa này thường được trồng trong chậu nước, tạo điểm nhấn tinh tế cho không gian.</p>

      <h3>9. Hoa cẩm tú cầu - Vẻ đẹp lãng mạn</h3>
      <p>Hoa cẩm tú cầu với những bông hoa tròn lớn và màu sắc pastel dịu dàng là lựa chọn hoàn hảo cho mùa xuân. Loài hoa này thích hợp để trang trí đám cưới, tiệc sinh nhật hoặc làm quà tặng.</p>

      <h3>10. Hoa oải hương - Hương thơm thư giãn</h3>
      <p>Hoa oải hương với sắc tím đặc trưng và hương thơm thư giãn là loài hoa được yêu thích vào mùa xuân. Loài hoa này không chỉ đẹp mà còn có tác dụng xua đuổi côn trùng, làm sạch không khí.</p>

      <h2>Cách trang trí hoa mùa xuân</h2>
      
      <h3>Trang trí phòng khách</h3>
      <p>Phòng khách là nơi tiếp đón khách, nên việc trang trí hoa ở đây rất quan trọng. Bạn có thể chọn một bình hoa lớn với hoa tulip hoặc hoa ly đặt trên bàn trà, hoặc một lẵng hoa nhỏ với hoa cúc họa mi đặt trên kệ tivi.</p>

      <h3>Trang trí phòng ngủ</h3>
      <p>Phòng ngủ nên chọn những loài hoa có hương thơm nhẹ nhàng như hoa oải hương hoặc hoa thủy tiên. Tránh những loài hoa có hương quá nồng có thể ảnh hưởng đến giấc ngủ.</p>

      <h3>Trang trí ban công, sân vườn</h3>
      <p>Ban công và sân vườn là nơi lý tưởng để trồng các loài hoa mùa xuân như hoa cẩm chướng, hoa hướng dương. Những loài hoa này sẽ tạo nên một không gian xanh tươi, tràn đầy sức sống.</p>

      <h2>Mẹo chọn hoa mùa xuân</h2>
      <p>Khi chọn hoa mùa xuân, bạn nên chú ý đến màu sắc, kích thước và hương thơm. Hãy chọn những bông hoa có cánh tươi, không bị dập nát, và có màu sắc tươi tắn. Nếu bạn muốn hoa tươi lâu, hãy chọn những bông hoa mới nở, chưa nở hết.</p>

      <h2>Kết luận</h2>
      <p>Mùa xuân là mùa của những bông hoa rực rỡ, và việc trang trí hoa trong nhà sẽ mang đến không khí tươi mới, tràn đầy sức sống. Với top 10 loài hoa đẹp nhất cho mùa xuân mà chúng tôi đã giới thiệu, hy vọng bạn sẽ tìm được loài hoa phù hợp để làm đẹp không gian sống của mình.</p>
      <p>Nếu bạn đang tìm mua hoa tươi đẹp cho mùa xuân, hãy ghé thăm <strong>Góc Hoa Xinh</strong> - shop hoa tươi online uy tín với đa dạng các loài hoa mùa xuân, từ hoa đào, hoa mai đến các loài hoa nhập khẩu độc đáo.</p>
    `
  }
};

const BlogDetailPage = () => {
  const { id } = useParams();
  const post = blogPosts[parseInt(id)];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <CustomerLayout>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>Bài viết không tồn tại</h1>
          <Link to="/blog" style={{ color: '#E95473', textDecoration: 'none', fontSize: '1.1rem' }}>
            Quay lại danh sách bài viết
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Add structured data for blog post
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.image,
      "datePublished": post.date,
      "dateModified": post.date,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Góc Hoa Xinh",
        "logo": {
          "@type": "ImageObject",
          "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      }
    });
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [post, currentUrl]);

  return (
    <CustomerLayout>
      <SEOHead 
        title={post.title}
        description={post.excerpt}
        keywords={post.keywords}
        image={post.image}
        url={currentUrl}
        type="article"
        author={post.author}
      />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="separator">›</span>
          <Link to="/blog">Tin tức</Link>
          <span className="separator">›</span>
          <span className="current">{post.title}</span>
        </div>
      </div>

      {/* Blog Detail Section */}
      <section className="product-detail-section" style={{ padding: '40px 0', background: '#fff' }}>
        <div className="container">
          <article style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  backgroundColor: '#E95473',
                  color: '#fff',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {post.category}
                </span>
              </div>
              
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>
                {post.title}
              </h1>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'center',
                color: '#6b7280',
                fontSize: '15px',
                marginBottom: '25px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-user" style={{ color: '#E95473' }}></i>
                  <span style={{ fontWeight: '500' }}>{post.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-calendar" style={{ color: '#E95473' }}></i>
                  <span>{formatDate(post.date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-clock" style={{ color: '#E95473' }}></i>
                  <span>{post.readTime} đọc</span>
                </div>
              </div>

              {/* Featured Image */}
              <div style={{
                width: '100%',
                maxHeight: '450px',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '35px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: '#f5f5f5'
              }}>
                <img
                  src={post.image}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1582794543598-c689622c7109?w=1200&h=800&fit=crop';
                  }}
                />
              </div>
            </header>

            {/* Content */}
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                lineHeight: '1.8',
                fontSize: '17px',
                color: '#374151',
                marginBottom: '40px'
              }}
            />

            {/* Share Section */}
            <div style={{
              padding: '20px 0',
              borderTop: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ color: '#374151', fontWeight: '500' }}>Chia sẻ bài viết:</span>
                <button 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#426B48',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2d4a32'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#426B48'}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.excerpt,
                        url: currentUrl
                      });
                    } else {
                      navigator.clipboard.writeText(currentUrl);
                      alert('Đã copy link!');
                    }
                  }}
                >
                  <i className="fas fa-share-alt"></i>
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Back to Blog */}
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <Link 
                to="/blog" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#E95473',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#c43d5a'}
                onMouseLeave={(e) => e.target.style.color = '#E95473'}
              >
                <i className="fas fa-arrow-left"></i>
                Quay lại danh sách bài viết
              </Link>
            </div>
          </article>
        </div>
      </section>

      <style>{`
        .blog-content h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.35rem;
          font-weight: 600;
          color: #374151;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
          text-align: justify;
        }
        .blog-content strong {
          font-weight: 600;
          color: #E95473;
        }
        .blog-content ul, .blog-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .blog-content h2 {
            font-size: 1.5rem;
          }
          .blog-content h3 {
            font-size: 1.2rem;
          }
          .blog-content {
            font-size: 16px !important;
          }
        }
      `}</style>
    </CustomerLayout>
  );
};

export default BlogDetailPage;
