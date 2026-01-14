import React from "react";
import {
  Card,
  Button,
  Table,
  Spin,
  Empty,
  Tag,
  Typography,
  Popconfirm,
} from "antd";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ProjectMembersCard = ({
  members = [],
  owner,
  userMap = new Map(),
  loading,
  canAddMember,
  onAddMember,

  // ✅ thêm để xóa member
  canRemoveMember = false,
  onRemoveMember,
  currentUserId, // owner id
}) => {
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "userId",
      key: "name",
      render: (userId) => userMap.get(userId)?.name || "Unknown",
    },
    {
      title: "Email",
      dataIndex: "userId",
      key: "email",
      render: (userId) => userMap.get(userId)?.email || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "owner" ? "gold" : "blue"}>
          {role === "owner" ? "Chủ dự án" : "Thành viên"}
        </Tag>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },

    // ✅ cột xóa member
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => {
        const isOwnerRow =
          record.role === "owner" ||
          String(record.userId) === String(currentUserId);

        if (!canRemoveMember || isOwnerRow) return null;

        return (
          <Popconfirm
            title="Xóa thành viên"
            description="Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onRemoveMember?.(record)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title="Thành viên dự án"
      extra={
        canAddMember ? (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={onAddMember}
            size="small"
          >
            Thêm thành viên
          </Button>
        ) : null
      }
    >
      {loading ? (
        <Spin />
      ) : members.length === 0 ? (
        <Empty description="Chưa có thành viên" />
      ) : (
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={false}
          size="small"
        />
      )}

      {owner && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
          <Text strong>Chủ dự án: </Text>
          <Tag color="gold">{owner.name}</Tag>
        </div>
      )}
    </Card>
  );
};

export default ProjectMembersCard;
