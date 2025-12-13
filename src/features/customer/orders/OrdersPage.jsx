import { motion } from 'framer-motion';
import CustomerLayout from '../../../layouts/CustomerLayout';

const OrdersPage = () => {
  const orders = [
    {
      id: 71,
      items: [{ name: 'Hoa Hồng Đỏ Ecuador', quantity: 1, image: '🌹' }],
      total: 450000,
      address: 'Hưng Yên',
      phone: '999999999',
      status: 'Hàng đang được giao',
      date: '2025-12-07 23:16:16',
    },
  ];

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-8"
        >
          Đơn hàng của bạn
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{order.items[0].image}</span>
                      <span className="text-sm">{order.items[0].quantity}x</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{order.total.toLocaleString()}VND</td>
                  <td className="px-6 py-4 text-gray-600">{order.address}</td>
                  <td className="px-6 py-4 text-gray-600">{order.phone}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 font-medium">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        HỦY ĐƠN
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        ĐÃ NHẬN
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </CustomerLayout>
  );
};

export default OrdersPage;
