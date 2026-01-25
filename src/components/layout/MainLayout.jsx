import React from 'react';
import { Layout } from 'antd';
import Head from './Head';
import Sidebar from './Sidebar';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50">
      <Head />
      <div className="w-full flex-1 flex flex-row overflow-hidden">
        <Sidebar />
        <Layout className="flex-1 h-full">
          <Content className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto">
            <div className="fade-in">
              {children}
            </div>
          </Content>
        </Layout>
      </div>
    </div>
  );
};

export default MainLayout;
