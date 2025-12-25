import { useEffect } from 'react';

/**
 * Component để quản lý SEO meta tags động cho từng trang
 * @param {string} title - Tiêu đề trang
 * @param {string} description - Mô tả trang
 * @param {string} keywords - Từ khóa (cách nhau bởi dấu phẩy)
 * @param {string} image - URL hình ảnh cho social sharing
 * @param {string} url - URL đầy đủ của trang
 * @param {string} type - Loại nội dung: 'website' | 'article' | 'product'
 * @param {string} author - Tác giả (mặc định: 'Góc Hoa Xinh')
 */
const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  author = 'Góc Hoa Xinh'
}) => {
  useEffect(() => {
    // Lấy base URL
    const baseUrl = window.location.origin;
    const currentUrl = url || window.location.href;
    const defaultImage = image || `${baseUrl}/og-image.jpg`;
    const siteName = 'Góc Hoa Xinh';
    
    // Update title
    if (title) {
      document.title = `${title} | ${siteName}`;
    }

    // Hàm helper để update hoặc tạo meta tag
    const updateMetaTag = (name, content, attribute = 'name') => {
      if (!content) return;
      
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update description
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, 'property');
      updateMetaTag('twitter:description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update Open Graph tags
    if (title) {
      const fullTitle = `${title} | ${siteName}`;
      updateMetaTag('og:title', fullTitle, 'property');
      updateMetaTag('twitter:title', fullTitle);
    }

    // Update images
    updateMetaTag('og:image', defaultImage, 'property');
    updateMetaTag('twitter:image', defaultImage);

    // Update URL
    updateMetaTag('og:url', currentUrl, 'property');
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Update other meta tags
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    updateMetaTag('author', author);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('robots', 'index, follow');

  }, [title, description, keywords, image, url, type, author]);

  return null; // Component không render gì
};

export default SEOHead;

