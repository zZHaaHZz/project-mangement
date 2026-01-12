import React from 'react';
import { Layout } from 'antd';
import Head from './Head';
import Sidebar from './Siderbar';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Head />
      <div className="w-full flex-1 flex flex-row overflow-hidden">
        <Sidebar />
        <Layout className="flex-1 h-full">
          <Content className="p-6 bg-gray-50 overflow-y-auto">
            {children}
          </Content>
        </Layout>
      </div>
    </div>
  );
};

export default MainLayout;
