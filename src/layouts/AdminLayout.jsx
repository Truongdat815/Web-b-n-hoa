import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  LogOut, 
  Search,
  Bell,
  Mail,
  Maximize,
  Grid
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products', badge: 'New' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders', badge: 'New' },
    { path: '/admin/users', icon: Users, label: 'Users', badge: 'New' },
    { path: '/admin/promotions', icon: Tag, label: 'Promotions', badge: 'New' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-admin-sidebar text-white flex flex-col fixed h-full z-50"
      >
        <div className="p-4 border-b border-admin-dark/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{user?.full_name || 'Admin'}</h3>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full px-3 py-2 bg-admin-dark rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <nav className="flex-1 px-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'hover:bg-admin-dark/50 text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-admin-dark/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500 transition-colors text-gray-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 ml-64">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white shadow-sm sticky top-0 z-40"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded relative"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded relative"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Maximize className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Grid className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
