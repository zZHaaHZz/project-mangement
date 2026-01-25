import { Input, Avatar, Badge, Dropdown } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import avatarDefault from "@/assets/images/avatar2.png"
const { Search } = Input;

const Head = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout?.();
    navigate("/login"); // ✅ bỏ ": "
  };

  const handleViewProfile = () => {
    // ví dụ: navigate("/profile");
    console.log("View profile");
  };

  const handleSearch = (value) => {
    console.log("Search:", value);
  };

  // ✅ antd dropdown menu items
  const menuItems = [
    {
      key: "profile",
      label: "Xem thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: handleViewProfile,
    },
    {
      key: "settings",
      label: "Cài đặt",
      icon: <SettingOutlined />,
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">PM</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Project Management
        </h1>
      </div>

      {/* Center */}
      {/* <div className="flex-1 max-w-md mx-8">
        <Search placeholder="Tìm kiếm..." onSearch={handleSearch} allowClear className="w-full" />
      </div> */}

      {/* Right */}
      <div className="flex items-center gap-6">
        <Badge count={0} showZero={false}>
          <div className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors" />
          </div>
        </Badge>

        {user && (
          <div className="flex flex-col leading-tight pr-4 border-r border-gray-200">
            <span className="text-gray-800 text-base font-semibold">{user.name}</span>
            <span className="text-gray-500 text-xs capitalize">{user.role === 'leader' ? 'Quản lý' : 'Nhân viên'}</span>
          </div>
        )}

        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]}
          arrow
        >
          <Avatar
            size="large"
            className="cursor-pointer hover:opacity-80 select-none transition-all hover:ring-2 hover:ring-blue-400"
            src={user?.avatar || avatarDefault}
            style={{ backgroundColor: "#1890ff" }}
          >
            {getInitials(user?.name)}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  );
};

export default Head;
