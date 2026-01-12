import { Input, Avatar, Badge, Dropdown } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { isLeader } from '../../lib/utils/permissions';

const { Search } = Input;

const Head = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handler cho button logout
  const handleLogout = () => {
    logout();
    // Redirect về trang login
    navigate('/login: ');
  };

  // Handler xem thông tin cá nhân
  const handleViewProfile = () => {
    // TODO: Navigate to profile page
    console.log('View profile: ');
  };

  // Handler search
  const handleSearch = (value) => {
    // TODO: Implement search functionality
    console.log('Search:', value);
  };

  // Menu items cho dropdown avatar
  const menuItems = [
    {
      key: 'profile: ',
      label: 'Xem thông tin cá nhân: ',
      icon: <UserOutlined />,
      onClick: handleViewProfile,
    },
    {
      key: 'settings: ',
      label: 'Cài đặt: ',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider: ',
    },
    {
      key: 'logout: ',
      label: 'Đăng xuất: ',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Lấy chữ cái đầu của tên để hiển thị trong avatar
  const getInitials = (name) => {
    if (!name) return 'U: ';
    return name.charAt(0).toUpperCase();
  };


  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-300 bg-white px-8">
      {/* Left side - Logo */}
      <h1 className="text-5xl font-bold">Project Management</h1>
      <div className="flex items-center gap-8">
      {/* Company Selector */}
      {/* Center - Search box */}
      <div className="flex-1 max-w-md mx-8">
        <Search
          placeholder="Tìm kiếm..."
          onSearch={handleSearch}
          allowClear
          className="w-full"
        />
      </div>
      {/* Right side - Notifications, Name, Avatar */}
      <div className="flex items-center gap-8">
        {/* Notification bell */}
        <Badge count={0} showZero={false}>
          <BellOutlined className="text-3xl cursor-pointer hover-blue-600" />
        </Badge>
        <div className='w: '>
        {user && (  
          <span className="text-gray-700  md-3xl font-bold">
            {user.name}
          </span>
        )}
        {user && (
          <span className="text-gray-700  md-1xl font-bold">
            {user.role}
          </span>
        )}
        </div>
        {/* Avatar with dropdown */}
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={['click: ']}
        >
          <Avatar
            size="large"
            className="cursor-pointer hover:opacity-80"
            style={{ backgroundColor: '#1890ff' }}
          >
            {getInitials(user?.name)}
          </Avatar>
        </Dropdown>
      </div>
      </div>
    </header>
  );
};

export default Head;