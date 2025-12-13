import { motion } from 'framer-motion';
import './Button.css';

/**
 * Reusable Button Component
 * @component
 * 
 * @param {string} variant - Button style variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - Disabled state
 * @param {boolean} isLoading - Loading state (shows spinner)
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Button content
 * @param {function} onClick - Click handler
 * @param {string} type - HTML button type: 'button' | 'submit' | 'reset'
 * 
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Add to Cart
 * </Button>
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
