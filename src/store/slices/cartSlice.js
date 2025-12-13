import { createSlice } from '@reduxjs/toolkit';

// Theo schema database: carts có flower_color_id, unit_quantity (số bông), quantity (số bó), service_fee
const initialState = {
    items: [], // Mỗi item có: flower_color_id, unit_quantity, quantity, service_fee
    totalQuantity: 0, // Tổng số bó
    totalUnitQuantity: 0, // Tổng số bông
    totalAmount: 0,
    totalServiceFee: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const { flower_color_id, unit_quantity = 20, quantity = 1, service_fee = 0, product } = action.payload;
            const existingItem = state.items.find((item) => item.flower_color_id === flower_color_id);

            if (!existingItem) {
                const itemPrice = (product?.unit_price || 0) * unit_quantity * quantity;
                state.items.push({
                    flower_color_id,
                    unit_quantity,
                    quantity,
                    service_fee,
                    unit_price: product?.unit_price || 0,
                    name: product?.name || 'Sản phẩm',
                    image_path: product?.image_path || '',
                    totalPrice: itemPrice + service_fee,
                });
            } else {
                existingItem.quantity += quantity;
                existingItem.unit_quantity += unit_quantity;
                existingItem.totalPrice = (existingItem.unit_price * existingItem.unit_quantity * existingItem.quantity) + existingItem.service_fee;
            }

            // Recalculate totals
            state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalUnitQuantity = state.items.reduce((sum, item) => sum + item.unit_quantity, 0);
            state.totalAmount = state.items.reduce((sum, item) => sum + (item.unit_price * item.unit_quantity * item.quantity), 0);
            state.totalServiceFee = state.items.reduce((sum, item) => sum + item.service_fee, 0);
        },
        updateCartItem(state, action) {
            const { flower_color_id, unit_quantity, quantity, service_fee } = action.payload;
            const existingItem = state.items.find((item) => item.flower_color_id === flower_color_id);

            if (existingItem) {
                if (unit_quantity !== undefined) existingItem.unit_quantity = unit_quantity;
                if (quantity !== undefined) existingItem.quantity = quantity;
                if (service_fee !== undefined) existingItem.service_fee = service_fee;
                existingItem.totalPrice = (existingItem.unit_price * existingItem.unit_quantity * existingItem.quantity) + existingItem.service_fee;
            }

            // Recalculate totals
            state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalUnitQuantity = state.items.reduce((sum, item) => sum + item.unit_quantity, 0);
            state.totalAmount = state.items.reduce((sum, item) => sum + (item.unit_price * item.unit_quantity * item.quantity), 0);
            state.totalServiceFee = state.items.reduce((sum, item) => sum + item.service_fee, 0);
        },
        removeFromCart(state, action) {
            const flower_color_id = action.payload;
            state.items = state.items.filter((item) => item.flower_color_id !== flower_color_id);

            // Recalculate totals
            state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalUnitQuantity = state.items.reduce((sum, item) => sum + item.unit_quantity, 0);
            state.totalAmount = state.items.reduce((sum, item) => sum + (item.unit_price * item.unit_quantity * item.quantity), 0);
            state.totalServiceFee = state.items.reduce((sum, item) => sum + item.service_fee, 0);
        },
        clearCart(state) {
            state.items = [];
            state.totalQuantity = 0;
            state.totalUnitQuantity = 0;
            state.totalAmount = 0;
            state.totalServiceFee = 0;
        },
    },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
