import React from 'react';
import { Layout } from 'antd';
import Head from './Head';
import Sidebar from './Sidebar';
import { LayoutProvider } from '@/contexts/LayoutContext';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <LayoutProvider>
      <div className="w-screen h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full pl-80">
          <Head />
          <Layout className="flex-1 h-full overflow-hidden">
            <Content className="p-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto h-full">
              <div className="fade-in h-full">
                {children}
              </div>
            </Content>
          </Layout>
        </div>
      </div>
    </LayoutProvider>
  );
};

export default MainLayout;
