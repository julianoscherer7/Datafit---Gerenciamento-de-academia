import React from 'react';
import { motion } from 'framer-motion';

export const MainLayout = ({ children }) => {
  return (
    <motion.main 
      className="flex-1 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-5 md:p-8 lg:p-10 min-h-full max-w-[1400px] mx-auto">
        {children}
      </div>
    </motion.main>
  );
};
