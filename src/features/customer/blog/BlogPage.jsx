import { Link } from 'react-router-dom';
import CustomerLayout from '../../../layouts/CustomerLayout';
import SEOHead from '../../../components/seo/SEOHead';
import '../../../assets/css/home.css';
import '../../../assets/css/product.css';

const BlogPage = () => {
  return (
    <CustomerLayout>
      <SEOHead 
        title="Về Góc Hoa Xinh - Câu Chuyện Của Chúng Tôi"
        description="Khám phá câu chuyện đằng sau Góc Hoa Xinh - shop hoa tươi online uy tín với hơn 10 năm kinh nghiệm. Tìm hiểu về sứ mệnh, giá trị cốt lõi và cam kết mang đến những bông hoa tươi đẹp nhất cho khách hàng."
        keywords="về góc hoa xinh, shop hoa tươi, câu chuyện shop hoa, hoa tươi online, shop hoa uy tín, giới thiệu shop hoa"
        url={window.location.href}
        type="website"
      />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/home">Trang chủ</Link>
          <span className="separator">›</span>
          <span className="current">Về chúng tôi</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="hero-section">
        <h1 className="page-title">Về Góc Hoa Xinh</h1>
        <p className="page-subtitle">Câu chuyện đằng sau những bông hoa tươi đẹp nhất</p>
      </section>

      {/* Main Content */}
      <section className="products-section">
        <div className="container">
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: '#fff',
            borderRadius: '12px',
            padding: '60px 50px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            lineHeight: '1.8'
          }}>
            {/* Introduction */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2c2c2c',
                marginBottom: '25px',
                lineHeight: '1.3',
                borderLeft: '4px solid #E95473',
                paddingLeft: '20px'
              }}>
                Chào Mừng Đến Với Góc Hoa Xinh
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#444',
                marginBottom: '20px',
                textAlign: 'justify'
              }}>
                Trong thế giới hiện đại ngày nay, nơi mà mọi thứ đều có thể được mua bán trực tuyến, 
                <strong style={{ color: '#E95473' }}> Góc Hoa Xinh</strong> tự hào là một trong những 
                shop hoa tươi online uy tín hàng đầu tại Việt Nam. Chúng tôi không chỉ đơn thuần là 
                một cửa hàng bán hoa, mà còn là người bạn đồng hành tin cậy của bạn trong những khoảnh 
                khắc quan trọng nhất của cuộc đời.
              </p>
            </div>

            {/* Mission */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-heart" style={{ color: '#E95473', fontSize: '24px' }}></i>
                Sứ Mệnh Của Chúng Tôi
              </h2>
              <p style={{
                fontSize: '17px',
                color: '#555',
                marginBottom: '18px',
                textAlign: 'justify'
              }}>
                Sứ mệnh của chúng tôi là mang đến cho khách hàng những bông hoa tươi đẹp nhất, được 
                chọn lọc kỹ lưỡng từ những vườn ươm uy tín. Mỗi bó hoa không chỉ là một sản phẩm, mà 
                còn là một tác phẩm nghệ thuật, được tạo nên từ tình yêu và sự tận tâm của đội ngũ 
                chuyên nghiệp. Chúng tôi tin rằng hoa có sức mạnh kỳ diệu - chúng có thể làm sáng 
                một ngày, xoa dịu nỗi buồn, và tạo nên những kỷ niệm đẹp đẽ.
              </p>
              <p style={{
                fontSize: '17px',
                color: '#555',
                textAlign: 'justify'
              }}>
                Với hơn 10 năm kinh nghiệm trong ngành hoa tươi, chúng tôi hiểu rõ từng loài hoa, 
                từng mùa, và cách chăm sóc để giữ được độ tươi lâu nhất. Đội ngũ của chúng tôi 
                luôn cập nhật những xu hướng mới nhất trong thiết kế hoa, đảm bảo mỗi sản phẩm đều 
                mang tính thời đại và phù hợp với từng dịp đặc biệt.
              </p>
            </div>

            {/* Values */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-star" style={{ color: '#E95473', fontSize: '24px' }}></i>
                Giá Trị Cốt Lõi
              </h2>
              <div style={{ display: 'grid', gap: '25px' }}>
                <div style={{
                  padding: '25px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: '4px solid #426B48'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c2c2c',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#426B48' }}></i>
                    Chất Lượng Tuyệt Đối
                  </h3>
                  <p style={{ fontSize: '16px', color: '#666', textAlign: 'justify' }}>
                    Mỗi bông hoa đều được kiểm tra kỹ lưỡng trước khi đến tay khách hàng. Chúng tôi 
                    chỉ chọn những bông hoa tươi nhất, đẹp nhất từ các nhà cung cấp uy tín. Nếu sản 
                    phẩm không đạt chất lượng, chúng tôi sẽ thay thế ngay lập tức.
                  </p>
                </div>

                <div style={{
                  padding: '25px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: '4px solid #E95473'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c2c2c',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className="fas fa-shipping-fast" style={{ color: '#E95473' }}></i>
                    Giao Hàng Nhanh Chóng
                  </h3>
                  <p style={{ fontSize: '16px', color: '#666', textAlign: 'justify' }}>
                    Với hệ thống giao hàng chuyên nghiệp, chúng tôi cam kết giao hoa tươi đến tay 
                    khách hàng trong thời gian ngắn nhất. Dù bạn ở đâu trên toàn quốc, chúng tôi 
                    sẽ đảm bảo hoa đến tay bạn trong tình trạng tươi mới nhất.
                  </p>
                </div>

                <div style={{
                  padding: '25px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: '4px solid #426B48'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c2c2c',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className="fas fa-handshake" style={{ color: '#426B48' }}></i>
                    Dịch Vụ Tận Tâm
                  </h3>
                  <p style={{ fontSize: '16px', color: '#666', textAlign: 'justify' }}>
                    Đội ngũ tư vấn của chúng tôi luôn sẵn sàng lắng nghe và tư vấn cho bạn chọn 
                    được bó hoa phù hợp nhất. Từ hoa sinh nhật, hoa cưới, hoa khai trương đến hoa 
                    chia buồn, chúng tôi hiểu rõ ý nghĩa của từng loài hoa và sẽ giúp bạn thể hiện 
                    đúng cảm xúc của mình.
                  </p>
                </div>

                <div style={{
                  padding: '25px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: '4px solid #E95473'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c2c2c',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <i className="fas fa-dollar-sign" style={{ color: '#E95473' }}></i>
                    Giá Cả Hợp Lý
                  </h3>
                  <p style={{ fontSize: '16px', color: '#666', textAlign: 'justify' }}>
                    Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng với giá cả 
                    hợp lý nhất. Không có chi phí ẩn, không có phụ phí bất ngờ. Giá bạn thấy là giá 
                    bạn trả, minh bạch và rõ ràng.
                  </p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-seedling" style={{ color: '#E95473', fontSize: '24px' }}></i>
                Sản Phẩm Đa Dạng
              </h2>
              <p style={{
                fontSize: '17px',
                color: '#555',
                marginBottom: '18px',
                textAlign: 'justify'
              }}>
                Tại <strong style={{ color: '#E95473' }}>Góc Hoa Xinh</strong>, chúng tôi cung cấp 
                đầy đủ các loại hoa tươi cho mọi dịp đặc biệt trong cuộc sống:
              </p>
              <ul style={{
                fontSize: '17px',
                color: '#555',
                paddingLeft: '25px',
                lineHeight: '2'
              }}>
                <li style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#426B48' }}>Hoa Hồng:</strong> Từ những bó hoa hồng đỏ 
                  lãng mạn đến hoa hồng trắng tinh khôi, chúng tôi có đầy đủ các màu sắc và kích 
                  thước để phù hợp với mọi sở thích.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#426B48' }}>Hoa Cưới:</strong> Những bó hoa cưới sang 
                  trọng, được thiết kế tỉ mỉ cho ngày trọng đại của bạn. Từ phong cách cổ điển đến 
                  hiện đại, chúng tôi sẽ tạo nên bó hoa hoàn hảo nhất.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#426B48' }}>Hoa Khai Trương:</strong> Những lẵng hoa 
                  khai trương lớn, tươi tắn để chúc mừng sự kiện quan trọng. Chúng tôi hiểu rằng 
                  hoa khai trương cần phải ấn tượng và sang trọng.
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#426B48' }}>Hoa Chúc Mừng:</strong> Từ hoa sinh nhật, 
                  hoa kỷ niệm đến hoa chúc mừng thành công, chúng tôi có đủ loại để bạn thể hiện 
                  tình cảm của mình.
                </li>
                <li>
                  <strong style={{ color: '#426B48' }}>Hoa Chia Buồn:</strong> Những vòng hoa 
                  tang lễ trang trọng, được thiết kế với sự tôn trọng và cảm thông sâu sắc.
                </li>
              </ul>
            </div>

            {/* Why Choose Us */}
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <i className="fas fa-trophy" style={{ color: '#E95473', fontSize: '24px' }}></i>
                Tại Sao Chọn Góc Hoa Xinh?
              </h2>
              <p style={{
                fontSize: '17px',
                color: '#555',
                marginBottom: '18px',
                textAlign: 'justify'
              }}>
                Với hàng trăm shop hoa online trên thị trường, bạn có thể tự hỏi tại sao nên chọn 
                <strong style={{ color: '#E95473' }}> Góc Hoa Xinh</strong>? Câu trả lời nằm ở 
                những điều nhỏ nhặt mà chúng tôi làm mỗi ngày:
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #E95473 0%, #426B48 100%)',
                padding: '35px',
                borderRadius: '12px',
                color: '#fff',
                marginTop: '25px'
              }}>
                <p style={{
                  fontSize: '18px',
                  lineHeight: '1.9',
                  textAlign: 'justify',
                  marginBottom: '0'
                }}>
                  Chúng tôi không chỉ bán hoa - chúng tôi bán cảm xúc. Mỗi bó hoa được gửi đi đều 
                  mang theo tình cảm chân thành của người gửi. Chúng tôi hiểu rằng đằng sau mỗi bó 
                  hoa là một câu chuyện, một kỷ niệm, một lời yêu thương. Và chúng tôi tự hào được 
                  là cầu nối để những cảm xúc ấy được truyền tải một cách trọn vẹn nhất.
                </p>
              </div>
            </div>

            {/* Commitment */}
            <div style={{
              padding: '40px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '2px solid #E95473',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#E95473',
                marginBottom: '20px'
              }}>
                Cam Kết Của Chúng Tôi
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#444',
                lineHeight: '1.9',
                fontStyle: 'italic',
                marginBottom: '0'
              }}>
                "Tại Góc Hoa Xinh, chúng tôi cam kết mang đến cho bạn những bông hoa tươi đẹp nhất, 
                dịch vụ tốt nhất và trải nghiệm mua sắm tuyệt vời nhất. Mỗi khách hàng đều là một 
                phần quan trọng trong hành trình của chúng tôi, và chúng tôi sẽ không ngừng nỗ lực 
                để xứng đáng với sự tin tưởng của bạn."
              </p>
            </div>

            {/* CTA */}
            <div style={{
              marginTop: '50px',
              textAlign: 'center',
              padding: '40px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              borderRadius: '12px'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#2c2c2c',
                marginBottom: '15px'
              }}>
                Sẵn Sàng Khám Phá Bộ Sưu Tập Hoa Tươi Của Chúng Tôi?
              </h3>
              <p style={{
                fontSize: '17px',
                color: '#666',
                marginBottom: '30px'
              }}>
                Hãy để chúng tôi giúp bạn tìm được bó hoa hoàn hảo cho dịp đặc biệt của mình
              </p>
              <Link
                to="/products"
                style={{
                  display: 'inline-block',
                  padding: '15px 40px',
                  background: '#E95473',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(233, 84, 115, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#d43f5f';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(233, 84, 115, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#E95473';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(233, 84, 115, 0.3)';
                }}
              >
                <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i>
                Xem Sản Phẩm Ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default BlogPage;
