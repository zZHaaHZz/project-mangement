import { Input, Avatar, Badge, Dropdown } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-300 bg-white">
      {/* Left */}
      <h1 className="text-3xl font-bold">Project Management</h1>

      {/* Center */}
      {/* <div className="flex-1 max-w-md mx-8">
        <Search placeholder="Tìm kiếm..." onSearch={handleSearch} allowClear className="w-full" />
      </div> */}

      {/* Right */}
      <div className="flex items-center gap-6">
        <Badge count={0} showZero={false}>
          <BellOutlined className="text-2xl cursor-pointer hover:text-blue-600" />
        </Badge>

        {user && (
          <div className="flex flex-col leading-tight">
            <span className="text-gray-700 text-lg font-bold">{user.name}</span>
            <span className="text-gray-500 text-sm">{user.role}</span>
          </div>
        )}

        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={["click"]} // ✅ CHÍNH LỖI Ở ĐÂY
          arrow
        >
          <Avatar
            size="large"
            className="cursor-pointer hover:opacity-80 select-none"
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
