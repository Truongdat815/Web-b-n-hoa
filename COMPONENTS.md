# CAPPLE - REUSABLE COMPONENTS DOCUMENTATION

## Overview
This document provides comprehensive documentation for all reusable components in the Capple flower shop UI.

---

## Button Component

### File Location
`src/components/common/Button.jsx`

### Description
A versatile, accessible button component supporting multiple variants and sizes. Includes loading states and disabled states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'primary'` | Button style: `'primary'`, `'secondary'`, `'ghost'`, `'danger'` |
| `size` | string | `'md'` | Button size: `'sm'`, `'md'`, `'lg'` |
| `disabled` | boolean | `false` | Disables button interaction |
| `isLoading` | boolean | `false` | Shows loading spinner and disables button |
| `className` | string | `''` | Additional CSS classes |
| `onClick` | function | `() => {}` | Click event handler |
| `type` | string | `'button'` | HTML button type |
| `children` | ReactNode | - | Button content |

### Examples

#### Primary Button
```jsx
<Button variant="primary" size="lg">
  Add to Cart
</Button>
```

#### Secondary Button with Icon
```jsx
import { ShoppingCart } from 'lucide-react';

<Button variant="secondary" size="md">
  <ShoppingCart size={20} />
  Buy Now
</Button>
```

#### Loading State
```jsx
<Button 
  variant="primary" 
  isLoading={isLoading}
  onClick={handlePurchase}
>
  Processing...
</Button>
```

#### Disabled State
```jsx
<Button 
  variant="primary" 
  disabled={!isFormValid}
>
  Submit
</Button>
```

#### Ghost Button
```jsx
<Button variant="ghost" size="sm">
  Learn More
</Button>
```

### Styling

The button component uses CSS variables and supports the following style combinations:

- **Primary**: Gradient Sage Green with hover shadow effect
- **Secondary**: Dusty Pink background
- **Ghost**: Transparent with border, inverts on hover
- **Danger**: Red background for destructive actions

---

## ProductCard Component

### File Location
`src/components/common/ProductCard.jsx`

### Description
A professional product display card showing product image, name, price, rating, and action buttons. Includes hover animations and wishlist functionality.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `product` | Object | Product data object |
| `product.id` | number | Unique product identifier |
| `product.name` | string | Product name |
| `product.price` | number | Current price in Vietnamese Dong |
| `product.oldPrice` | number | Original price (optional, for sale items) |
| `product.image` | string | Product image URL from API |
| `product.emoji` | string | Fallback emoji if image fails to load |
| `product.rating` | number | Star rating (0-5) |
| `product.sold` | number | Number of units sold |
| `product.badge` | Object | Optional badge { type: 'primary'\|'warning', text: string } |
| `product.gradient` | string | Tailwind gradient class for background |
| `onAddToCart` | function | Callback when "Add to Cart" is clicked |
| `onWishlist` | function | Callback when wishlist button is clicked |
| `onClick` | function | Callback when card is clicked (navigate to detail) |

### Product Data Structure

```javascript
const product = {
  id: 1,
  name: 'Hoa Hồng Đỏ Ecuador',
  price: 450000,          // Current price
  oldPrice: 600000,       // Original price (if on sale)
  image: 'https://images.unsplash.com/...',  // From API
  emoji: '🌹',            // Fallback
  rating: 4.9,            // 0-5
  sold: 320,              // Number sold
  badge: {                // Optional
    type: 'primary',      // 'primary' | 'warning' | 'success'
    text: 'HOT'
  },
  gradient: 'from-rose-400 via-rose-500 to-red-600'  // Tailwind class
};
```

### Examples

#### Basic Product Card
```jsx
import ProductCard from '@/components/common/ProductCard';

const product = {
  id: 1,
  name: 'Hoa Hồng Đỏ Ecuador',
  price: 450000,
  oldPrice: 600000,
  image: 'https://...',
  emoji: '🌹',
  rating: 4.9,
  sold: 320,
};

<ProductCard 
  product={product}
  onAddToCart={() => handleAddCart(product.id)}
  onClick={() => navigate(`/products/${product.id}`)}
/>
```

#### Product Grid
```jsx
const products = [
  { id: 1, name: 'Product 1', ... },
  { id: 2, name: 'Product 2', ... },
  // ...
];

<div className="products-grid">
  {products.map(product => (
    <ProductCard
      key={product.id}
      product={product}
      onAddToCart={() => dispatch(addToCart(product))}
      onWishlist={() => toggleWishlist(product.id)}
      onClick={() => navigate(`/products/${product.id}`)}
    />
  ))}
</div>
```

#### With Badge
```jsx
<ProductCard 
  product={{
    ...product,
    badge: { type: 'primary', text: 'HOT' }
  }}
  onAddToCart={handleAdd}
  onClick={handleViewDetail}
/>
```

### Features
- Hover animation (card lifts up)
- Wishlist button with heart icon
- Discount percentage display (calculated automatically)
- Image fallback to emoji
- Star rating display
- "Add to Cart" overlay button
- Responsive design (mobile-optimized)

### Image Handling
- Primary: Uses `product.image` URL
- Fallback: Shows `product.emoji` if image fails to load
- Optimal size: 400x400px (optimized with ?w=400&q=80)

---

## Badge Component

### File Location
CSS utility class in `src/index.css`

### Description
Small label component for indicating status, badges, or tags.

### Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `badge-primary` | Sage Green | New product, featured |
| `badge-secondary` | Dusty Pink | Featured, special |
| `badge-success` | Green | In stock |
| `badge-warning` | Orange | Sale, limited stock |
| `badge-error` | Red | Sold out, error |

### HTML Usage
```html
<!-- Status Badges -->
<span class="badge badge-primary">NEW</span>
<span class="badge badge-warning">SALE</span>
<span class="badge badge-success">IN STOCK</span>
<span class="badge badge-error">SOLD OUT</span>

<!-- Product Badges -->
<span class="badge badge-primary">HOT</span>
<span class="badge badge-primary">BESTSELLER</span>
```

### JSX Usage
```jsx
<span className="badge badge-primary">New</span>
```

---

## Layout Components

### CustomerLayout
File: `src/layouts/CustomerLayout.jsx`

Features:
- Responsive header with logo, search, navigation
- Sticky top bar with contact info
- Mobile hamburger menu
- Footer with company info and links

```jsx
import CustomerLayout from '@/layouts/CustomerLayout';

<CustomerLayout>
  {/* Page content */}
</CustomerLayout>
```

### AdminLayout
File: `src/layouts/AdminLayout.jsx`

Features:
- Fixed sidebar navigation
- Top header with user info
- Professional color scheme (darker tones)
- Responsive on mobile (sidebar collapses)

```jsx
import AdminLayout from '@/layouts/AdminLayout';

<AdminLayout>
  {/* Admin page content */}
</AdminLayout>
```

---

## Utility Classes

### Flexbox Utilities
```html
<!-- Center content -->
<div class="flex-center">Centered</div>

<!-- Space between -->
<div class="flex-between">Left <span>Right</span></div>

<!-- Column direction -->
<div class="flex-col">Stacked</div>
```

### Grid Utilities
```html
<!-- Auto-responsive grid -->
<div class="grid-auto">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Container
```html
<div class="container">
  <!-- Max-width container with padding -->
</div>
```

### Section Padding
```html
<section class="section-padding">
  <!-- Responsive padding: 3rem on desktop, 2rem on mobile -->
</section>
```

---

## CSS Variables (Theme System)

All components use CSS variables defined in `src/index.css` root.

```css
:root {
  /* Brand Colors */
  --color-primary: #81A296;      /* Sage Green */
  --color-secondary: #F0EBE3;    /* Dusty Pink */
  
  /* Spacing */
  --spacing-md: 1rem;
  
  /* Shadows */
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-base: 200ms cubic-bezier(...);
}
```

### Customizing Theme
To change brand colors globally:

```css
:root {
  --color-primary: #YOUR_HEX_COLOR;
  --color-secondary: #YOUR_HEX_COLOR;
}
```

All components automatically update.

---

## Animation Component Integration

Components use Framer Motion for smooth animations:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  Content
</motion.div>
```

---

## Responsive Design Strategy

All components are mobile-first:

- **Mobile (< 480px)**: Single column, compact spacing
- **Tablet (480-768px)**: 2 columns, medium spacing
- **Desktop (> 768px)**: Full grid, comfortable spacing

Example:
```css
.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
```

---

## Accessibility Features

1. **Keyboard Navigation**: All buttons accessible via Tab/Enter
2. **Focus States**: Clear focus rings on interactive elements
3. **Color Contrast**: WCAG AA compliant color combinations
4. **Semantic HTML**: Proper heading hierarchy, ARIA labels
5. **Touch Targets**: Minimum 44x44px for mobile buttons

---

## Best Practices

1. **Use CSS Variables**: Never hardcode colors
2. **Keep Components Small**: Single responsibility principle
3. **Prop Documentation**: Always document all props
4. **Error Boundaries**: Wrap components in error handling
5. **Loading States**: Always show loading feedback
6. **Mobile First**: Design mobile, enhance for larger screens
7. **Performance**: Lazy load images, memoize expensive renders

---

## Component API Integration

### Adding API Call to ProductCard

```jsx
useEffect(() => {
  // TODO: Fetch product from API
  const fetchProduct = async () => {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();
    setProduct(data);
  };
  
  fetchProduct();
}, [productId]);

// Then pass to component
<ProductCard product={product} ... />
```

### Example API Response Structure
```json
{
  "id": 1,
  "name": "Hoa Hồng Đỏ Ecuador",
  "price": 450000,
  "oldPrice": 600000,
  "image": "https://...",
  "description": "...",
  "rating": 4.9,
  "sold": 320,
  "stock": 100,
  "category": "roses"
}
```

---

## Component Lifecycle

```
Props Change → Component Renders → Animation Plays → User Interaction
```

---

## Testing Guidelines

### Button Component
```jsx
it('should call onClick when clicked', () => {
  const onClick = jest.fn();
  const { getByRole } = render(
    <Button onClick={onClick}>Click me</Button>
  );
  getByRole('button').click();
  expect(onClick).toHaveBeenCalled();
});
```

### ProductCard Component
```jsx
it('should display product name and price', () => {
  const product = { name: 'Test', price: 100 };
  const { getByText } = render(<ProductCard product={product} />);
  expect(getByText('Test')).toBeInTheDocument();
  expect(getByText('100₫')).toBeInTheDocument();
});
```

---

## Troubleshooting

### Images Not Loading
- Check URL format (should be HTTPS)
- Verify CORS headers from image server
- Fallback emoji will display

### Button Not Responding
- Check `onClick` prop is passed correctly
- Verify `disabled` prop is false
- Check console for JavaScript errors

### Cards Not Responsive
- Verify container has correct max-width
- Check CSS Grid gap values
- Test on multiple breakpoints

---

## Contributing

When adding new components:
1. Create in `src/components/` folder
2. Add prop types/JSDoc comments
3. Include usage examples
4. Test responsive design
5. Update this documentation
6. Ensure CSS variable usage

