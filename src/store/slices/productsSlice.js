import { createSlice } from '@reduxjs/toolkit';

// Mock data theo database schema
const mockFlowers = [
  { flower_id: 1, flower_name: 'Hoa Hồng' },
  { flower_id: 2, flower_name: 'Hoa Tulip' },
  { flower_id: 3, flower_name: 'Hoa Ly' },
  { flower_id: 4, flower_name: 'Hoa Hướng Dương' },
  { flower_id: 5, flower_name: 'Hoa Cẩm Tú Cầu' },
  { flower_id: 6, flower_name: 'Hoa Baby' },
  { flower_id: 7, flower_name: 'Hoa Lan Hồ Điệp' },
  { flower_id: 8, flower_name: 'Hoa Sáp' },
];

const mockColors = [
  { color_id: 1, color_name: 'Đỏ', color_code: '#EF4444' },
  { color_id: 2, color_name: 'Hồng', color_code: '#EC4899' },
  { color_id: 3, color_name: 'Trắng', color_code: '#FFFFFF' },
  { color_id: 4, color_name: 'Vàng', color_code: '#FBBF24' },
  { color_id: 5, color_name: 'Tím', color_code: '#A855F7' },
  { color_id: 6, color_name: 'Xanh', color_code: '#10B981' },
];

// Flower Colors (Products) - theo schema flower_colors
const mockFlowerColors = [
  // Bó Hoa Tươi
  {
    flower_color_id: 1,
    flower_id: 1,
    color_id: 1,
    image_path: 'https://images.unsplash.com/photo-1582794543598-c689622c7109?w=500&q=80',
    unit_price: 15000,
    description: 'Bó hoa hồng đỏ tươi thắm, nhập khẩu từ Ecuador. Mỗi bó gồm 20 bông, cánh hoa dày dặn, màu đỏ thắm tươi tắn.',
    quantity_in_stock: 50,
    category: 'bo-hoa',
  },
  {
    flower_color_id: 2,
    flower_id: 1,
    color_id: 2,
    image_path: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&q=80',
    unit_price: 12000,
    description: 'Bó hoa hồng hồng pastel ngọt ngào, phù hợp cho mọi dịp. Mỗi bó 20 bông.',
    quantity_in_stock: 35,
    category: 'bo-hoa',
  },
  {
    flower_color_id: 3,
    flower_id: 2,
    color_id: 2,
    image_path: 'https://images.unsplash.com/photo-1554494583-c4e1649bfe71?w=500&q=80',
    unit_price: 18000,
    description: 'Bó tulip hồng Hà Lan cao cấp, tươi lâu 7-10 ngày.',
    quantity_in_stock: 40,
    category: 'bo-hoa',
  },
  {
    flower_color_id: 4,
    flower_id: 3,
    color_id: 3,
    image_path: 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=500&q=80',
    unit_price: 16000,
    description: 'Bó hoa ly trắng tinh khôi, hương thơm dịu nhẹ.',
    quantity_in_stock: 30,
    category: 'bo-hoa',
  },
  {
    flower_color_id: 5,
    flower_id: 4,
    color_id: 4,
    image_path: 'https://images.unsplash.com/photo-1582794543330-b4226d962006?w=500&q=80',
    unit_price: 14000,
    description: 'Bó hoa hướng dương rạng rỡ, mang đến năng lượng tích cực.',
    quantity_in_stock: 45,
    category: 'bo-hoa',
  },
  {
    flower_color_id: 6,
    flower_id: 5,
    color_id: 5,
    image_path: 'https://images.unsplash.com/photo-1545529468-42764ef8c85f?w=500&q=80',
    unit_price: 20000,
    description: 'Bó hoa cẩm tú cầu tím sang trọng, phù hợp cho dịp đặc biệt.',
    quantity_in_stock: 25,
    category: 'bo-hoa',
  },
  // Kệ Khai Trương
  {
    flower_color_id: 7,
    flower_id: 1,
    color_id: 1,
    image_path: 'https://images.unsplash.com/photo-1557761168-91ac1d5e38d7?w=500&q=80',
    unit_price: 35000,
    description: 'Kệ hoa khai trương lớn, thiết kế sang trọng, phù hợp cho sự kiện quan trọng.',
    quantity_in_stock: 15,
    category: 'khai-truong',
  },
  {
    flower_color_id: 8,
    flower_id: 1,
    color_id: 2,
    image_path: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=500&q=80',
    unit_price: 30000,
    description: 'Kệ hoa khai trương vừa, thiết kế tinh tế.',
    quantity_in_stock: 20,
    category: 'khai-truong',
  },
  {
    flower_color_id: 9,
    flower_id: 4,
    color_id: 4,
    image_path: 'https://images.unsplash.com/photo-1522338242992-e1a55dcb27e6?w=500&q=80',
    unit_price: 28000,
    description: 'Giỏ hoa mừng khai trương với hoa hướng dương.',
    quantity_in_stock: 18,
    category: 'khai-truong',
  },
  // Hoa Cưới
  {
    flower_color_id: 10,
    flower_id: 1,
    color_id: 2,
    image_path: 'https://images.unsplash.com/photo-1527334139976-189f7831f47c?w=500&q=80',
    unit_price: 25000,
    description: 'Hoa cầm tay cô dâu hồng pastel, thiết kế tinh tế cho ngày cưới.',
    quantity_in_stock: 12,
    category: 'hoa-cuoi',
  },
  {
    flower_color_id: 11,
    flower_id: 1,
    color_id: 3,
    image_path: 'https://images.unsplash.com/photo-1527334139976-189f7831f47c?w=500&q=80',
    unit_price: 28000,
    description: 'Hoa cưới trắng tinh khôi, sang trọng.',
    quantity_in_stock: 10,
    category: 'hoa-cuoi',
  },
  // Hoa Sáp
  {
    flower_color_id: 12,
    flower_id: 8,
    color_id: 1,
    image_path: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80',
    unit_price: 50000,
    description: 'Hoa sáp đỏ, bền đẹp lâu dài, không cần chăm sóc.',
    quantity_in_stock: 30,
    category: 'hoa-sap',
  },
  {
    flower_color_id: 13,
    flower_id: 8,
    color_id: 2,
    image_path: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80',
    unit_price: 55000,
    description: 'Hoa sáp hồng, thiết kế đẹp mắt, bền màu.',
    quantity_in_stock: 25,
    category: 'hoa-sap',
  },
  {
    flower_color_id: 14,
    flower_id: 8,
    color_id: 3,
    image_path: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80',
    unit_price: 52000,
    description: 'Hoa sáp trắng tinh khôi, phù hợp trang trí.',
    quantity_in_stock: 28,
    category: 'hoa-sap',
  },
];

// Mock Promotions
const mockPromotions = [
  {
    promotion_id: 1,
    flower_color_id: null,
    promotion_name: 'Giảm giá đầu mùa',
    description: 'Giảm 20% cho tất cả sản phẩm',
    is_for_all: true,
    type_of_promotion: 'perc',
    amount: 20,
    start_day: '2024-01-01',
    end_day: '2024-12-31',
    is_active: true,
  },
  {
    promotion_id: 2,
    flower_color_id: 1,
    promotion_name: 'Khuyến mãi hoa hồng đỏ',
    description: 'Giảm 15% cho hoa hồng đỏ',
    is_for_all: false,
    type_of_promotion: 'perc',
    amount: 15,
    start_day: '2024-01-01',
    end_day: '2024-12-31',
    is_active: true,
  },
];

const initialState = {
  flowers: mockFlowers,
  colors: mockColors,
  flowerColors: mockFlowerColors,
  promotions: mockPromotions,
  selectedProduct: null,
  loading: false,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    updateProductStock: (state, action) => {
      const { flower_color_id, quantity } = action.payload;
      const product = state.flowerColors.find(p => p.flower_color_id === flower_color_id);
      if (product) {
        product.quantity_in_stock -= quantity;
      }
    },
    addProduct: (state, action) => {
      state.flowerColors.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.flowerColors.findIndex(
        p => p.flower_color_id === action.payload.flower_color_id
      );
      if (index !== -1) {
        state.flowerColors[index] = { ...state.flowerColors[index], ...action.payload };
      }
    },
    deleteProduct: (state, action) => {
      state.flowerColors = state.flowerColors.filter(
        p => p.flower_color_id !== action.payload
      );
    },
  },
});

export const {
  setSelectedProduct,
  updateProductStock,
  addProduct,
  updateProduct,
  deleteProduct,
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.flowerColors;
export const selectProductById = (state, id) =>
  state.products.flowerColors.find(p => p.flower_color_id === parseInt(id));
export const selectProductsByCategory = (state, category) =>
  state.products.flowerColors.filter(p => p.category === category);
export const selectFlowerById = (state, id) =>
  state.products.flowers.find(f => f.flower_id === id);
export const selectColorById = (state, id) =>
  state.products.colors.find(c => c.color_id === id);
export const selectActivePromotions = (state) =>
  state.products.promotions.filter(p => p.is_active);

export default productsSlice.reducer;

