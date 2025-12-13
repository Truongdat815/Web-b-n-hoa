/**
 * CAPPLE FLOWER SHOP - FRONT-END UI DESIGN GUIDE
 * Professional, Modern & Responsive Design System
 * 
 * Version: 1.0
 * Last Updated: December 2025
 */

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary:      #81A296 (Sage Green)      - Main brand color, CTAs, icons
Secondary:    #F0EBE3 (Dusty Pink)      - Accents, highlights, hover states
Accent:       #E8D4C4 (Warm Neutral)    - Secondary accents
White:        #FFFFFF
Gray-50:      #F9F9F7
Gray-100:     #F5F3F0
Gray-200:     #E8E5E0
Gray-400:     #B8B0A5
Gray-600:     #6B6359
Gray-800:     #2D2A27
Gray-900:     #1A1917
```

### Typography
- **Display Font**: Inter, system-ui, -apple-system, sans-serif
  - Used for headings, titles, CTAs
  - Weights: 600, 700, 800, 900

- **Body Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
  - Used for body text, descriptions
  - Weights: 400, 500, 600

- **Sizes**:
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Spacing System (Based on 0.25rem = 4px)
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)

### Border Radius
- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 1rem (16px)
- xl: 1.5rem (24px)
- full: 9999px

### Shadows
- sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

### Transitions
- fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile:  < 480px   (phones)
Tablet:  480-768px (tablets)
Desktop: 768-1024px (laptops)
Wide:    > 1024px  (desktops)
```

---

## 🧩 COMPONENT STRUCTURE

### Reusable Components

#### 1. Button Component (`src/components/common/Button.jsx`)
**Variants**: primary, secondary, ghost, danger
**Sizes**: sm, md, lg
**Props**: 
- variant: 'primary' | 'secondary' | 'ghost' | 'danger'
- size: 'sm' | 'md' | 'lg'
- disabled: boolean
- isLoading: boolean
- onClick: function
- type: 'button' | 'submit' | 'reset'

**Usage**:
```jsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Add to Cart
</Button>
```

#### 2. ProductCard Component (`src/components/common/ProductCard.jsx`)
**Props**:
- product: {
    id, name, price, oldPrice, image, emoji, rating, sold, badge, gradient
  }
- onAddToCart: function
- onWishlist: function
- onClick: function

**Usage**:
```jsx
<ProductCard 
  product={productData}
  onAddToCart={() => handleAdd(productData.id)}
  onClick={() => navigate(`/products/${productData.id}`)}
/>
```

#### 3. Badge Component
**Variants**: primary, secondary, success, warning, error

**Usage**:
```html
<span class="badge badge-primary">HOT</span>
```

### Layout Components

#### CustomerLayout (`src/layouts/CustomerLayout.jsx`)
- Header with logo, search, navigation
- Sticky navigation bar
- Footer with company info
- Responsive mobile menu

#### AdminLayout (`src/layouts/AdminLayout.jsx`)
- Sidebar navigation (fixed)
- Top header with user info
- Professional color scheme

---

## 📄 PAGES STRUCTURE

### 1. HomePage (`/`)
```
├── Hero Section
│   ├── Background image + overlay
│   ├── Main headline & subtitle
│   ├── CTA buttons
│   ├── Trust badges
│   └── Scroll indicator
├── Features Section (4 cards)
│   ├── Icon
│   ├── Title
│   └── Description
├── Categories Section
│   ├── Category cards (3 items)
│   ├── Hover overlay
│   └── "View All" links
├── Featured Products Grid (8 products)
│   └── ProductCard components
├── Call-to-Action Section
│   ├── Headline
│   ├── Description
│   └── CTA button
└── Footer
```

### 2. ProductsPage (`/products`)
```
├── Page Header
├── Filters Sidebar (Mobile: Collapse)
│   ├── Categories
│   ├── Price range
│   ├── Rating
│   └── Sort options
└── Products Grid
    ├── ProductCard × N
    └── Pagination/Load More
```

### 3. ProductDetailPage (`/products/:id`)
```
├── Breadcrumb Navigation
├── Image Gallery (Left)
│   ├── Main image
│   └── Thumbnail slides
├── Product Info (Right)
│   ├── Name & price
│   ├── Rating & sold count
│   ├── Description
│   ├── Quantity selector
│   ├── "Add to Cart" button
│   └── "Add to Wishlist" button
├── Tabs Section
│   ├── Description
│   ├── Specifications
│   └── Reviews
└── Related Products
```

### 4. CartPage (`/cart`)
```
├── Cart Items Table
│   ├── Product card (image, name)
│   ├── Unit price
│   ├── Quantity selector
│   ├── Total price
│   └── Remove button
├── Order Summary (Sticky)
│   ├── Subtotal
│   ├── Shipping
│   ├── Total
│   └── "Checkout" button
└── Continue Shopping button
```

### 5. CheckoutPage (`/checkout`)
```
├── Shipping Address Form
├── Payment Method Selection
├── Order Review
└── "Place Order" button
```

### 6. Admin Dashboard (`/admin`)
```
├── Overview Cards (Revenue, Orders, Customers, etc.)
├── Charts Section
│   ├── Sales chart
│   ├── Top products
│   └── Customer insights
└── Quick Actions
```

### 7. Admin Products (`/admin/products`)
```
├── Products Table
│   ├── Product info
│   ├── Price
│   ├── Stock
│   ├── Edit button
│   └── Delete button
├── Add Product button
└── Search & Filter
```

---

## 🔄 API INTEGRATION POINTS

### TODO Comments in Code
The codebase includes strategic TODO comments indicating where API calls should be integrated:

#### HomePage.jsx
```jsx
// TODO: Replace mock data with API calls
// API Endpoints needed:
// - GET /api/products?featured=true (Featured products)
// - GET /api/categories (Product categories)
```

#### ProductsPage.jsx
```jsx
// TODO: Implement API pagination
// - GET /api/products?page=1&limit=12&category={id}
```

#### ProductDetailPage.jsx
```jsx
// TODO: Fetch product from API
// - GET /api/products/{id}
```

#### Cart Management
```jsx
// TODO: Dispatch Redux action to manage cart
// - ADD_TO_CART action
// - REMOVE_FROM_CART action
// - UPDATE_CART_QUANTITY action
```

---

## 🎯 KEY FEATURES

### 1. Responsive Design
- **Mobile-first approach**: Designed for mobile, enhanced for larger screens
- **Flexible grid system**: Uses CSS Grid with auto-fit/auto-fill
- **Fluid typography**: Font sizes scale based on viewport width (using clamp)
- **Touch-friendly**: Buttons and interactive elements sized for touch targets

### 2. Performance Optimizations
- **Image optimization**: Uses Unsplash for high-quality, optimized images
- **Lazy loading**: Images load with Framer Motion intersection observer
- **CSS-in-JS**: Minimal CSS, efficient transitions
- **Code splitting**: Components loaded on demand

### 3. Accessibility
- **Semantic HTML**: Proper heading hierarchy, ARIA labels
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Color contrast**: WCAG AA compliant color combinations
- **Focus states**: Clear focus indicators on all buttons

### 4. User Experience
- **Smooth animations**: Framer Motion for polished transitions
- **Hover effects**: Subtle, non-intrusive hover states
- **Loading states**: Visual feedback for async operations
- **Error handling**: Clear error messages for users

---

## 🚀 DEVELOPMENT WORKFLOW

### 1. Adding a New Feature
1. Create component in `src/components/`
2. Add styles to `.css` file
3. Import in relevant page
4. Add TODO comments for API integration
5. Test responsive design

### 2. Modifying Styles
1. Update CSS Variables in `src/index.css` (`:root`)
2. Cascade changes automatically across site
3. No need to update individual components

### 3. Adding New Pages
1. Create folder in `src/features/`
2. Add page component (.jsx)
3. Add page styles (.css)
4. Register route in `AppRouter.jsx`
5. Update navigation links

---

## 📚 COMPONENT USAGE EXAMPLES

### Button
```jsx
import Button from '@/components/common/Button';

// Primary Button
<Button variant="primary" size="lg" onClick={handleClick}>
  Add to Cart
</Button>

// Secondary Button
<Button variant="secondary" size="md">
  View Details
</Button>

// Ghost Button
<Button variant="ghost" size="sm">
  Read More
</Button>

// Danger Button
<Button variant="danger" disabled={isLoading} isLoading={isLoading}>
  Delete
</Button>
```

### ProductCard
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
  badge: { type: 'primary', text: 'HOT' },
};

<ProductCard 
  product={product}
  onAddToCart={() => addToCart(product.id)}
  onClick={() => navigate(`/products/${product.id}`)}
/>
```

### CSS Utilities
```html
<!-- Flexbox utilities -->
<div class="flex-center">Centered content</div>
<div class="flex-between">Space between</div>
<div class="flex-col">Column direction</div>

<!-- Badge -->
<span class="badge badge-primary">NEW</span>
<span class="badge badge-warning">SALE</span>

<!-- Grid -->
<div class="grid-auto">Auto-responsive grid</div>
```

---

## 🎨 CUSTOMIZATION GUIDE

### Changing Brand Colors
1. Open `src/index.css`
2. Update `:root` CSS variables:
```css
:root {
  --color-primary: #NEW_COLOR;
  --color-secondary: #NEW_COLOR;
}
```
3. All components automatically update

### Adjusting Spacing
```css
:root {
  --spacing-md: 1.5rem; /* Change base spacing */
}
```

### Modifying Typography
```css
:root {
  --font-display: 'Your Font', sans-serif;
}

h1 { font-size: 3rem; } /* Override h1 size */
```

---

## 📦 DEPENDENCIES

- **React 18**: UI framework
- **React Router v6**: Client-side routing
- **Redux Toolkit + RTK Query**: State management & API
- **Framer Motion**: Animations & transitions
- **Tailwind CSS v4**: Utility-first CSS
- **Lucide React**: Icon library
- **Recharts**: Data visualization (admin dashboard)

---

## 🔐 BEST PRACTICES

1. **Always use CSS Variables**: Never hardcode colors
2. **Component Composition**: Keep components small & reusable
3. **Responsive First**: Mobile design first, enhance for larger screens
4. **Performance**: Lazy load images, code-split pages
5. **Accessibility**: Test keyboard navigation, color contrast
6. **Error Handling**: Graceful fallbacks, clear error messages
7. **Comments**: Document complex logic, mark TODO items

---

## 📞 SUPPORT

For questions or issues, refer to:
- Component docs: `src/components/README.md`
- Page docs: `src/features/README.md`
- API integration guide: `src/api/README.md`

