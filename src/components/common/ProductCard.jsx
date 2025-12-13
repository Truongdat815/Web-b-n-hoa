import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import './ProductCard.css';

/**
 * ProductCard Component - Reusable Product Display Card
 * @component
 * 
 * Displays product information including:
 * - Product image with hover overlay
 * - Product name and price
 * - Rating and sold count
 * - Action buttons (Add to Cart, Wishlist)
 * 
 * @param {Object} product - Product data object
 * @param {number} product.id - Product ID (for API calls)
 * @param {string} product.name - Product name
 * @param {number} product.price - Product price
 * @param {number} product.oldPrice - Original price (if on sale)
 * @param {string} product.image - Product image URL (from API)
 * @param {string} product.emoji - Fallback emoji if image fails
 * @param {number} product.rating - Star rating (0-5)
 * @param {number} product.sold - Number of items sold
 * @param {function} onAddToCart - Callback when Add to Cart is clicked
 * @param {function} onWishlist - Callback when Wishlist is clicked
 * @param {function} onClick - Callback when card is clicked (navigate to detail)
 * 
 * @example
 * <ProductCard 
 *   product={productData}
 *   onAddToCart={() => handleAddCart(productData.id)}
 *   onClick={() => navigate(`/products/${productData.id}`)}
 * />
 */
const ProductCard = ({
  product = {},
  onAddToCart = () => {},
  onWishlist = () => {},
  onClick = () => {},
}) => {
  const {
    id = 1,
    name = 'Product Name',
    price = 0,
    oldPrice = 0,
    image = '',
    emoji = '🌹',
    rating = 0,
    sold = 0,
    badge = null,
    gradient = 'from-pink-400 to-rose-500',
  } = product;

  const discountPercent = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Image Section */}
      <div className="product-image-wrapper" onClick={onClick}>
        <div className={`product-image bg-gradient-to-br ${gradient}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="product-image-fallback">
            <span className="text-5xl">{emoji}</span>
          </div>
        </div>

        {/* Overlay Actions */}
        <div className="product-overlay">
          <motion.button
            className="btn btn-primary btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <ShoppingCart size={16} />
            Add to Cart
          </motion.button>
        </div>

        {/* Badge (Sale, New, etc.) */}
        {badge && <div className={`product-badge badge badge-${badge.type}`}>{badge.text}</div>}

        {/* Discount Percentage */}
        {discountPercent > 0 && (
          <div className="discount-badge">{discountPercent}% OFF</div>
        )}

        {/* Wishlist Button */}
        <motion.button
          className="wishlist-btn"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onWishlist();
          }}
        >
          <Heart size={18} />
        </motion.button>
      </div>

      {/* Info Section */}
      <div className="product-info" onClick={onClick}>
        <h3 className="product-name">{name}</h3>

        {/* Rating and Sold */}
        <div className="product-meta">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({rating})</span>
          </div>
          <span className="text-xs text-gray-400">{sold} sold</span>
        </div>

        {/* Price Section */}
        <div className="product-price">
          <span className="current-price">
            {price.toLocaleString('vi-VN')}₫
          </span>
          {oldPrice > 0 && (
            <span className="old-price">{oldPrice.toLocaleString('vi-VN')}₫</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
