import React from 'react';
import { motion } from 'framer-motion';

export const MainLayout = ({ children, sidebarOpen }) => {
  return (
    <motion.main 
      className="flex-1 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 md:p-6 lg:p-8 min-h-full">
        {children}
      </div>
    </motion.main>
  );
};
