import React from 'react';

export const MainLayout = ({ children, sidebarOpen }) => {
  return (
    <main className="md:ml-64 mt-16 md:mt-0 pb-8">
      <div className="p-4 md:p-8">
        {children}
      </div>
    </main>
  );
};
