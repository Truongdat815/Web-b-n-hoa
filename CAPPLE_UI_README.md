# 🌹 CAPPLE - Flower Shop Front-End UI

Professional, modern, and responsive e-commerce UI for a premium flower shop built with React, Tailwind CSS, and Framer Motion.

## ✨ Features

### 🎨 Design System
- **Sage Green (#81A296)** primary brand color
- **Dusty Pink (#F0EBE3)** elegant secondary color
- Professional, minimal, and modern aesthetic
- CSS Variables for easy theme customization
- WCAG AA accessibility compliant

### 📱 Responsive Design
- **Mobile-first approach**: Perfect on all devices
- Optimized for phones, tablets, and desktops
- Flexible grid system with auto-responsive layouts
- Touch-friendly interface with proper tap targets

### 🧩 Reusable Components
- **Button Component**: Multiple variants (primary, secondary, ghost, danger) and sizes
- **ProductCard Component**: Beautiful product display with hover effects
- **Layout Components**: CustomerLayout & AdminLayout for consistent UX
- **Utility Classes**: Flexbox, grid, spacing utilities
- Fully documented with usage examples

### ⚡ Performance
- Image optimization with Unsplash
- Lazy loading with Framer Motion
- Code splitting and efficient bundling
- CSS-in-JS for minimal file sizes

### 🎭 Animations
- Smooth page transitions
- Hover effects on interactive elements
- Scroll animations (AOS-like)
- Skeleton loaders for async content
- Built with Framer Motion

### 🔐 Best Practices
- Semantic HTML
- Keyboard navigation support
- Error handling and loading states
- Component-based architecture
- Clear separation of concerns

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/capple-flower-shop.git
cd capple-flower-shop

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
src/
├── components/
│   └── common/
│       ├── Button.jsx          # Reusable button component
│       ├── Button.css
│       ├── ProductCard.jsx     # Product display card
│       ├── ProductCard.css
│       └── LoadingSpinner.jsx
├── features/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── users/
│   ├── auth/
│   │   └── LoginPage.jsx
│   └── customer/
│       ├── home/
│       │   ├── HomePage.jsx     # Main landing page
│       │   └── HomePage.css
│       ├── products/
│       │   └── ProductsPage.jsx
│       ├── product-detail/
│       │   └── ProductDetailPage.jsx
│       ├── cart/
│       │   └── CartPage.jsx
│       ├── checkout/
│       │   └── CheckoutPage.jsx
│       ├── orders/
│       │   └── OrdersPage.jsx
│       └── profile/
│           └── ProfilePage.jsx
├── layouts/
│   ├── AdminLayout.jsx
│   └── CustomerLayout.jsx
├── router/
│   ├── AppRouter.jsx
│   └── ProtectedRoute.jsx
├── api/
│   ├── baseApi.js              # RTK Query base API
│   ├── auth/
│   ├── cart/
│   ├── flowers/
│   └── orders/
├── store/
│   ├── store.js
│   └── slices/
│       └── authSlice.js
├── index.css                   # Global styles + CSS variables
├── App.jsx
└── main.jsx
```

---

## 🎯 Pages

### Customer Pages

#### HomePage (`/`)
Main landing page featuring:
- Eye-catching hero section with CTA buttons
- Feature highlights (4 cards)
- Category showcase
- Featured products grid (8 products)
- Call-to-action section
- Trust badges showing ratings and benefits

#### ProductsPage (`/products`)
Product listing with:
- Responsive product grid
- Category and price filters (mobile collapsible)
- Sorting options
- Product cards with images, prices, ratings
- "Add to Cart" functionality

#### ProductDetailPage (`/products/:id`)
Comprehensive product page including:
- High-resolution image gallery
- Product description and specifications
- Price and stock information
- Quantity selector
- "Add to Cart" & "Add to Wishlist" buttons
- Customer reviews and ratings
- Related products section

#### CartPage (`/cart`)
Shopping cart interface with:
- Product list with item images
- Quantity adjustment
- Price summary (subtotal, shipping, total)
- "Proceed to Checkout" button
- "Continue Shopping" link

#### CheckoutPage (`/checkout`)
Order completion with:
- Shipping address form
- Payment method selection
- Order review
- Place order button

#### ProfilePage (`/profile`)
User account dashboard with:
- Account information
- Order history
- Addresses management
- Wishlist
- Settings

### Admin Pages

#### AdminDashboard (`/admin`)
Dashboard with:
- Key metrics cards
- Sales charts
- Top products
- Recent orders
- Customer insights

#### AdminProductsPage (`/admin/products`)
Product management with:
- Product table/grid
- Edit/Delete actions
- Add product button
- Search and filter

#### AdminOrdersPage (`/admin/orders`)
Order management with:
- Orders table
- Order status tracking
- Order details
- Update order status

---

## 🧬 Components Documentation

### Button Component

```jsx
import Button from '@/components/common/Button';

// Primary button
<Button variant="primary" size="lg" onClick={handleClick}>
  Add to Cart
</Button>

// Secondary button
<Button variant="secondary" size="md">
  View Details
</Button>

// Loading state
<Button isLoading={true}>Processing...</Button>

// Disabled state
<Button disabled={true}>Disabled</Button>
```

**Variants**: `primary`, `secondary`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`
**Props**: `variant`, `size`, `disabled`, `isLoading`, `onClick`, `type`, `className`

### ProductCard Component

```jsx
import ProductCard from '@/components/common/ProductCard';

const product = {
  id: 1,
  name: 'Hoa Hồng Đỏ Ecuador',
  price: 450000,
  oldPrice: 600000,
  image: 'https://images.unsplash.com/...',
  emoji: '🌹',
  rating: 4.9,
  sold: 320,
  badge: { type: 'primary', text: 'HOT' },
  gradient: 'from-rose-400 to-red-600',
};

<ProductCard
  product={product}
  onAddToCart={() => handleAdd(product.id)}
  onClick={() => navigate(`/products/${product.id}`)}
/>
```

---

## 🎨 Design System

### Colors
```css
Primary:    #81A296 (Sage Green)
Secondary:  #F0EBE3 (Dusty Pink)
Accent:     #E8D4C4 (Warm Neutral)
```

### Typography
- **Display**: Inter, system-ui
- **Body**: -apple-system, BlinkMacSystemFont, Segoe UI
- **H1-H6**: Responsive scaling with clamp()

### Spacing Scale
`xs(4px) → sm(8px) → md(16px) → lg(24px) → xl(32px) → 2xl(48px) → 3xl(64px)`

### Responsive Breakpoints
```
Mobile:  < 480px
Tablet:  480-768px
Desktop: 768-1024px
Wide:    > 1024px
```

---

## 🔄 API Integration

The application uses RTK Query for API management. Replace mock data with actual API endpoints:

### Sample API Endpoints

```javascript
// Products
GET /api/products                    // All products
GET /api/products/:id                // Product detail
GET /api/products?featured=true      // Featured products
POST /api/products                   // Create (admin)
PUT /api/products/:id                // Update (admin)
DELETE /api/products/:id             // Delete (admin)

// Categories
GET /api/categories                  // All categories
GET /api/categories/:id              // Category detail

// Cart (Redux state, not API)
POST /api/cart/items                 // Add to cart
PUT /api/cart/items/:id              // Update quantity
DELETE /api/cart/items/:id           // Remove from cart

// Orders
POST /api/orders                     // Create order
GET /api/orders/:id                  // Order detail
GET /api/orders                      // User orders

// Auth
POST /api/auth/login                 // Login
POST /api/auth/register              // Register
POST /api/auth/logout                // Logout
GET /api/auth/me                     // Current user
```

### TODO Markers
Search for `// TODO:` comments to find integration points:

```javascript
// HomePage.jsx - Featured products
// TODO: Replace mock data with API call
// GET /api/products?featured=true

// ProductDetailPage.jsx - Product data
// TODO: Fetch from API
// GET /api/products/:id

// Cart management
// TODO: Implement Redux add to cart action
```

---

## 🛠️ Technologies

- **React 18**: UI library with hooks
- **React Router v6**: Client-side routing with lazy loading
- **Redux Toolkit + RTK Query**: State management & API layer
- **Vite 7**: Lightning-fast build tool
- **Tailwind CSS v4**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Recharts**: Data visualization
- **PostCSS**: CSS processing
- **ESLint**: Code quality

---

## 📱 Responsive Examples

### Mobile Layout (< 480px)
- Single column grid
- Collapsed navigation menu
- Touch-optimized buttons
- Stacked forms
- Full-width modals

### Tablet Layout (480-768px)
- 2-column grid
- Sidebar visible
- Comfortable spacing

### Desktop Layout (> 768px)
- 4-column product grid
- Side-by-side layouts
- Full navigation menu
- Hover effects enabled

---

## ♿ Accessibility

✅ Keyboard navigation support
✅ WCAG AA color contrast compliant
✅ Semantic HTML structure
✅ ARIA labels on interactive elements
✅ Focus management
✅ Screen reader friendly

---

## 🚀 Performance

- **Image Optimization**: Unsplash URLs with size parameters
- **Lazy Loading**: Intersection Observer with Framer Motion
- **Code Splitting**: Route-based splitting with React.lazy
- **CSS Variables**: Efficient style management
- **Production Build**: Vite minification & tree-shaking

---

## 📚 Documentation Files

- **DESIGN_SYSTEM.md**: Complete design system documentation
- **COMPONENTS.md**: Component API and usage guide
- **API_INTEGRATION.md**: Backend integration guide (create this)

---

## 🔒 Environment Setup

Create `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Capple
VITE_APP_DESCRIPTION=Premium Flower Shop
```

---

## 📦 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint check
npm run lint
```

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and test responsiveness
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit Pull Request

### Code Standards
- Follow component structure
- Use CSS Variables for styling
- Write JSDoc comments
- Keep components small and reusable
- Test on mobile, tablet, and desktop

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🌐 Live Demo

[View Demo](https://capple-flower-shop.vercel.app)

---

## 👥 Support

For questions or support:
- Open an issue on GitHub
- Check documentation files
- Review component examples

---

## 🎉 Acknowledgments

- Design inspiration from modern e-commerce sites
- UI components using best practices
- Community-contributed icons (Lucide React)
- Responsive design patterns

---

**Built with ❤️ for premium flower enthusiasts**

Latest Update: December 2025 | Version: 1.0
